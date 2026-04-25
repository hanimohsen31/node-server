const express = require('express')
const router = express.Router()
const multer = require('multer')
const axios = require('axios')
const ErrorHandler = require('../../utils/ErrorHandler')
const convertPdfToJson = require('./pipeline/step1-convert-pdf-to-text')
const sendPdfTextToAI = require('./pipeline/step2-send-pdf-text-to-ai')
const scrapFacebook = require('./pipeline/step3-scrap-facebook')
const scrapHatla2ee = require('./pipeline/step4-scrap-hatla2ee')
const compareResults = require('./pipeline/step5-compare-results')
const successResponse = require('./utils/constants')
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'), false)
  },
  limits: { fileSize: 20 * 1024 * 1024 },
})

// =========================
// CreateCarRrport
// =========================
const CreateCarRrport = async (req, res) => {
  try {
    if (!req.file) return ErrorHandler(res, null, 'PDF file is required (field name: file)', 400, null)
    const minPriceLimit = req.body.minPriceLimit || 300_000
    const maxPriceLimit = req.body.maxPriceLimit || 550_000
    const facebookScrollCount = req.body.facebookScrollCount || 10
    const hatla2eePaging = req.body.hatla2eePaging || 10

    // [1] Convert PDF to JSON
    const result = await convertPdfToJson(req.file.buffer)
    let pdfSummary = result.cleanText

    // [2] Send PDF summary to AI
    const aiData = await sendPdfTextToAI(pdfSummary, 'cerebras')

    // [3] Scrape Facebook
    const facebook = await scrapFacebook(aiData.modelArabic || aiData.modelEnglish, 'cairo', minPriceLimit, maxPriceLimit, facebookScrollCount)

    // [4] Scrape hatla2ee // make => Hyundai || model => Matrix
    const hatla2ee = await scrapHatla2ee(aiData.makeEnglish, aiData.modelEnglish, null, minPriceLimit, maxPriceLimit, hatla2eePaging)

    // [5] Compare
    const finalPayload = { pdfSummary, aiData, facebook, hatla2ee }
    const analysis = await compareResults(finalPayload)

    res.status(200).json({ status: 200, message: 'Report processed successfully', data: { ...finalPayload, ...analysis } })
  } catch (err) {
    ErrorHandler(res, err.message, 'Failed to process report', 500, null)
  }
}

// =========================
// CreateCarReportManual
// =========================
const CreateCarReportManual = async (req, res) => {
  try {
    const { pdfSummary, minPriceLimit = 300_000, maxPriceLimit = 550_000, facebookScrollCount = 10, hatla2eePaging = 10 } = req.body

    if (!pdfSummary || !pdfSummary.trim())
      return ErrorHandler(res, null, 'pdfSummary text is required', 400, null)

    // [2] Parse plain text with AI (same as PDF pipeline)
    const aiData = await sendPdfTextToAI(pdfSummary, 'cerebras')

    // [3] Scrape Facebook
    const facebook = await scrapFacebook(aiData.modelArabic || aiData.modelEnglish, 'cairo', minPriceLimit, maxPriceLimit, facebookScrollCount)

    // [4] Scrape hatla2ee
    const hatla2ee = await scrapHatla2ee(aiData.makeEnglish, aiData.modelEnglish, null, minPriceLimit, maxPriceLimit, hatla2eePaging)

    // [5] Compare
    const finalPayload = { pdfSummary, aiData, facebook, hatla2ee }
    const analysis = await compareResults(finalPayload)

    res.status(200).json({ status: 200, message: 'Report processed successfully', data: { ...finalPayload, ...analysis } })
  } catch (err) {
    ErrorHandler(res, err.message, 'Failed to process manual report', 500, null)
  }
}

// --------------------------  ROUTES  ----------------------------------------------------------------
router.get('/', (req, res) => res.redirect('/car-report.html'))
router.post('/', upload.single('file'), CreateCarRrport)
router.post('/manual', CreateCarReportManual)

module.exports = router
