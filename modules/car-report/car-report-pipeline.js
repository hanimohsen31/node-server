const fs = require('fs')
const path = require('path')
const os = require('os')
const convertPdfToJson = require('./pipeline/step1-convert-pdf-to-text')
const sendPdfTextToAI = require('./pipeline/step2-send-pdf-text-to-ai')
const scrapFacebook = require('./pipeline/step3-scrap-facebook')
const scrapHatla2ee = require('./pipeline/step4-scrap-hatla2ee')
const compareResults = require('./pipeline/step5-compare-results')
const mergeFacebookResults = require('./utils/facebook-merge')

async function runCarReportPipeline({ pdfBuffer, pdfSummary, options = {}, onProgress } = {}) {
  const minPriceLimit = Number(options.minPriceLimit) || 300_000
  const maxPriceLimit = Number(options.maxPriceLimit) || 550_000
  const facebookScrollCount = Number(options.facebookScrollCount) || 10
  const hatla2eePaging = Number(options.hatla2eePaging) || 10
  const browserClient = options.browserClient || 'clone'
  const notify = (m) => {
    try {
      onProgress?.(m)
    } catch (_) {}
  }

  // [1] Convert PDF to text (or use provided text)
  let summaryText
  if (pdfBuffer) {
    notify('step-1: extracting text from PDF...')
    const result = await convertPdfToJson(pdfBuffer)
    if (result.isEmpty) {
      const err = new Error('PDF appears to be empty or unreadable')
      err.statusCode = 400
      throw err
    }
    summaryText = result.cleanText
  } else if (pdfSummary?.trim()) {
    summaryText = pdfSummary.trim()
  } else {
    const err = new Error('No Input Data')
    err.statusCode = 400
    throw err
  }
  console.log('step-1 pdf summary', summaryText)

  // [2] Send PDF summary to AI
  notify('step-2: parsing car details with AI...')
  const aiData = await sendPdfTextToAI(summaryText)
  if (!aiData) {
    const err = new Error('AI failed to parse the PDF content')
    err.statusCode = 502
    throw err
  }
  console.log('step-2 Car parsed Data', aiData)

  // [3] Scrape Facebook (Arabic + English, merged)
  notify('step-3: scraping Facebook marketplace...')
  let facebook = null
  try {
    const fbResults = []
    for (const searchTerm of [aiData.modelArabic, aiData.modelEnglish, 
      // `${aiData.makeArabic} ${aiData.modelArabic} ${aiData.year}`, `${aiData.makeEnglish} ${aiData.modelEnglish} ${aiData.year}`
    ].filter(Boolean)) {
      try {
        const result = await scrapFacebook(searchTerm, 'cairo', minPriceLimit, maxPriceLimit, facebookScrollCount, browserClient)
        fbResults.push(result)
      } catch (e) {
        console.error(`[Facebook scrape failed for "${searchTerm}"]`, e.message)
      }
    }
    if (fbResults.length > 0) {
      facebook = mergeFacebookResults(fbResults, minPriceLimit, maxPriceLimit)
    }
  } catch (e) {
    console.error('[Facebook scrape failed]', e.message)
  }
  console.log('step-3 Facebook Data', facebook)

  // [4] Scrape hatla2ee
  notify('step-4: scraping Hatla2ee...')
  let hatla2ee = null
  try {
    hatla2ee = await scrapHatla2ee(aiData.makeEnglish, aiData.modelEnglish, null, minPriceLimit, maxPriceLimit, hatla2eePaging)
  } catch (e) {
    console.error('[Hatla2ee scrape failed]', e.message)
  }
  console.log('step-4 hatla2ee Data', hatla2ee)

  // [5] Build payload
  const finalPayload = { pdfSummary: summaryText, aiData }
  if (facebook) finalPayload.facebook = facebook
  if (hatla2ee) finalPayload.hatla2ee = hatla2ee

  // [6] Compare (skip if no market data)
  let analysis = null
  if (facebook || hatla2ee) {
    notify('step-5: comparing & generating verdict...')
    try {
      analysis = await compareResults(finalPayload)
    } catch (e) {
      console.error('[Compare failed]', e.message)
    }
    console.log('step-6 analysis Data', analysis)
  }

  // [7] Save report
  const reportDir = path.join(os.homedir(), 'Downloads', `car-report-${Date.now()}`)
  fs.mkdirSync(reportDir, { recursive: true })
  const reportFilePath = path.join(reportDir, 'CarReportResult.json')
  const promptFilePath = path.join(reportDir, 'finalPrompt.txt')
  const fullData = analysis ? { ...finalPayload, ...analysis } : finalPayload
  fs.writeFileSync(reportFilePath, JSON.stringify(fullData, null, 2))
  if (analysis?.finalPrompt) fs.writeFileSync(promptFilePath, analysis.finalPrompt.toString())

  return {
    pdfSummary: summaryText,
    aiData,
    facebook,
    hatla2ee,
    analysis,
    finalPayload,
    fullData,
    reportDir,
    reportFilePath,
    finalPrompt: analysis?.finalPrompt,
    promptFilePath: analysis?.finalPrompt ? promptFilePath : null,
    hasMarketData: Boolean(facebook || hatla2ee),
  }
}

module.exports = runCarReportPipeline
