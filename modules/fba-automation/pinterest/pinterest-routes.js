const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const { initBrowser, downloadImageUpdated, autoScroll, randomDelay } = require('../../../utils/PuppeteerHelpers')
// database
const GenericSchema = require('../../../utils/GenericShema')
const mongoose = require('mongoose')
const PinterestResult = mongoose.model(
  'PinterestResult',
  GenericSchema({
    searchId: {
      type: String,
      required: [true, 'searchId is required'],
      unique: [true, 'name is already used'],
    },
  })
)

// ------------------------------------------------------------------
// get final report data
async function StartSearchOnPinterest(req, res) {
  let { niches, searchId, count } = req.body
  const existing = await PinterestResult.findOne({ searchId })
  if (existing) return res.status(400).json({ message: 'searchId must be unique' })
  if (!niches.length) return res.status(400).json({ message: 'keywords is required', data: null })
  if (!searchId) return res.status(400).json({ message: 'searchId is required' })
  if (!count) count = 30
  const outputDir = path.join(__dirname, '../../storage/pinterest_search/', `Search_` + Date.now())
  fs.mkdirSync(outputDir, { recursive: true })
  // /* check inputs */

  try {
    // ------------------------  DIVIDER  browser -------------------------------------------------------------
    const { browser } = await initBrowser()
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    // ------------------------  DIVIDER  Pinterest ---------------------------------------------------------
    for (const keyword of niches) {
      console.log(`🔍 Getting Pinterest Images for: "${keyword}"`)
      try {
        // [1] Go to Pinterest
        await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keyword)}&rs=typed`, {
          headless: false,
          waitUntil: 'networkidle2',
        })
        randomDelay()
        await page.waitForSelector('[data-grid-item="true"]', { timeout: 10_000 }) // Wait for grid items to load

        // await autoScroll(page); // Scroll to load more content
        // let previousCount = 0;
        // let sameCountTries = 0;
        let previousCount = 0
        let sameCountTries = 0
        while (true) {
          await autoScroll(page)
          await new Promise((r) => setTimeout(r, 1500)) // give Pinterest time to load
          const currentCount = await page.$$eval('[data-grid-item="true"]', (els) => els.length)
          console.log(`📸 Loaded ${currentCount} / ${count}`)
          if (currentCount >= count) {
            console.log('✅ Reached desired count')
            break
          }
          if (currentCount === previousCount) sameCountTries++
          else sameCountTries = 0
          if (sameCountTries >= 5) {
            console.warn('⚠️ No new pins are loading, stopping...')
            break
          }
          previousCount = currentCount
        }
        console.log(`✅ Final count: ${previousCount}`)

        // [2] Get image URLs from grid items
        const pins = []
        const html = await page.content()
        const cheer = cheerio.load(html)
        cheer('[data-grid-item="true"]').each((i, el) => {
          // /* Analyse each grid item */
          const linkEl = cheer(el).find('a[href*="/pin/"]').first()
          const imgEl = cheer(el).find('img').first()
          const descEl = cheer(el).find('[data-test-id="desc"]').first()
          if (!imgEl || !linkEl) return
          let bestSrc = imgEl.attr('src')
          const srcset = imgEl.attr('srcset')
          if (srcset) {
            const highest = srcset.split(',').pop().trim().split(' ')[0]
            if (highest) bestSrc = highest
          }
          if (!bestSrc) return
          bestSrc = bestSrc.replace('/236x/', '/736x/').replace('/474x/', '/736x/')
          // /* creat object to save in database*/
          pins.push({
            id: Math.random().toString(36).slice(2),
            aria: linkEl.attr('aria-label') || imgEl.attr('alt') || '',
            href: linkEl.attr('href'),
            signature: imgEl.attr('data-test-image-signature'),
            img: bestSrc,
            srcset,
            description: descEl.text().trim(),
          })
        })
        // [3] download images
        for (let index = 0; index < pins.length; index++) {
          const item = pins[index]
          const localImgPath = `${outputDir}/Pinterest__${keyword.replace(/ /g, '_')}__${index + 1}.jpeg`
          await downloadImageUpdated(item.img, localImgPath)
          // ✅ Find the correct pin using signature if possible, else fallback by index
          const targetPin = pins.find((p) => p.signature && item.signature && p.signature === item.signature) || item // fallback: same element in loop
          targetPin.localImgPath = localImgPath.split('/').at(-1)
        }
        // [4] save in database
        let finalDataObject = {
          pins,
          searchId,
          keyword,
          niches,
          count: pins.length,
          fullPath: outputDir,
          searchFolderId: outputDir.split('\\').at(-1).split('/').at(-1),
        }
        await PinterestResult.insertOne(finalDataObject)
        console.log('✅ Data Saved Successfully')
        res.status(200).json({ message: 'success', data: true })
        return
      } catch (error) {
        console.error('❌ Pinterest error:', error)
        return
      }
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// get saved results
async function GetAllSearches(req, res) {
  try {
    const result = await PinterestResult.find()
    const searchesArray = [...new Set(result.map((item) => item.searchId))].filter((elm) => elm !== null)
    res.status(200).json({ message: 'Posts', data: searchesArray })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// get final report data
async function GetPinsResults(req, res) {
  const searchId = req.params.searchId
  if (!searchId) return res.status(400).json({ message: 'searchId is required' })
  try {
    let productsData = await PinterestResult.findOne({ searchId: searchId })
    if (!productsData) return res.status(404).json({ message: 'No Data Found', data: [] })
    if (!productsData.fullPath) return res.status(404).json({ message: 'No Path found', data: [] })
    if (!productsData.pins.length) return res.status(404).json({ message: 'No Pins found', data: [] })
    // absoulte path
    let imagesDirectory = productsData.fullPath.replace(/\\/g, '/')
    let imagesResponse = productsData.pins.map((elm) => {
      const filePath = path.join(imagesDirectory, elm.localImgPath)
      // Check file exists to avoid errors
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`)
        return null
      }
      // Read file and convert to base64
      const fileBuffer = fs.readFileSync(filePath)
      const base64Data = fileBuffer.toString('base64')
      // Detect MIME type by extension (simple way)
      const ext = path.extname(elm.localImgPath).slice(1)
      const mimeType = ext === 'jpg' ? 'jpeg' : ext // Normalize jpeg
      const base64Image = `data:image/${mimeType};base64,${base64Data}`
      return {
        ...elm,
        base64Image,
      }
    })
    res.status(200).json({ message: 'success', data: imagesResponse })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

router.route('').post(StartSearchOnPinterest).get(GetAllSearches)
router.route('/:searchId').get(GetPinsResults)
module.exports = router
