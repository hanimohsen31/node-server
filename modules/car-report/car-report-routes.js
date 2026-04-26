const express = require('express')
const router = express.Router()
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
const ErrorHandler = require('../../utils/ErrorHandler')
const convertPdfToJson = require('./pipeline/step1-convert-pdf-to-text')
const sendPdfTextToAI = require('./pipeline/step2-send-pdf-text-to-ai')
const scrapFacebook = require('./pipeline/step3-scrap-facebook')
const scrapHatla2ee = require('./pipeline/step4-scrap-hatla2ee')
const compareResults = require('./pipeline/step5-compare-results')
const mergeFacebookResults = require('./utils/facebook-merge')
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'), false)
  },
  limits: { fileSize: 20 * 1024 * 1024 },
})

// =========================
// CreateCarReport
// =========================
const CreateCarReport = async (req, res) => {
  try {
    // console.log(req.body)
    if (!req.file && !req.body.pdfSummary?.trim()) {
      return ErrorHandler(res, null, 'No Input Data', 400, null)
    }
    const minPriceLimit = Number(req.body.minPriceLimit) || 300_000
    const maxPriceLimit = Number(req.body.maxPriceLimit) || 550_000
    const facebookScrollCount = Number(req.body.facebookScrollCount) || 10
    const hatla2eePaging = Number(req.body.hatla2eePaging) || 10
    const browserClient = req.body.browserClient || 'clone'

    // [1] Convert PDF to JSON (skip if manual text was provided)
    let pdfSummary
    if (req.file) {
      const result = await convertPdfToJson(req.file.buffer)
      if (result.isEmpty) return ErrorHandler(res, null, 'PDF appears to be empty or unreadable', 400, null)
      pdfSummary = result.cleanText
    } else {
      pdfSummary = req.body.pdfSummary.trim()
    }
    console.log('step-1 pdf summary', pdfSummary)

    // [2] Send PDF summary to AI
    const aiData = await sendPdfTextToAI(pdfSummary)
    if (!aiData) return ErrorHandler(res, null, 'AI failed to parse the PDF content', 502, null)
    console.log('step-2 Car parsed Data', aiData)

    // [3] Scrape Facebook (Arabic + English, merged)
    let facebook = null
    try {
      const fbResults = []
      for (const searchTerm of [aiData.modelArabic, aiData.modelEnglish].filter(Boolean)) {
        try {
          const result = await scrapFacebook(searchTerm, 'cairo', minPriceLimit, maxPriceLimit, facebookScrollCount,browserClient)
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

    // [4] Scrape hatla2ee // make => Hyundai || model => Matrix
    let hatla2ee = null
    try {
      hatla2ee = await scrapHatla2ee(aiData.makeEnglish, aiData.modelEnglish, null, minPriceLimit, maxPriceLimit, hatla2eePaging)
    } catch (e) {
      console.error('[Hatla2ee scrape failed]', e.message)
    }
    console.log('step-4 hatla2ee Data', hatla2ee)

    // [5] Build payload
    const finalPayload = { pdfSummary, aiData }
    if (facebook) finalPayload.facebook = facebook
    if (hatla2ee) finalPayload.hatla2ee = hatla2ee

    if (!facebook && !hatla2ee) {
      return res.status(200).json({ message: 'Report processed successfully (no market data available)', data: finalPayload })
    }

    // [6] Compare
    let analysis = null
    try {
      analysis = await compareResults(finalPayload)
    } catch (e) {
      console.error('[Compare failed]', e.message)
    }
    console.log('step-6 analysis Data', analysis)
    fs.writeFileSync('C:\\Users\\Hani Rashed\\Downloads\\result.json', JSON.stringify({ ...finalPayload, ...analysis }, null, 2))
    res.status(200).json({ message: 'Report processed successfully', data: { ...finalPayload, ...analysis } })
  } catch (err) {
    ErrorHandler(res, err.message, 'Failed to process report', 500, null)
  }
}

// --------------------------  ROUTES  ----------------------------------------------------------------
router.get('/', (req, res) => res.redirect('/car-report.html'))
router.post('/', upload.single('file'), CreateCarReport)

module.exports = router
