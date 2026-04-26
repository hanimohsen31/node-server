const express = require('express')
const router = express.Router()
const multer = require('multer')
const ErrorHandler = require('../../utils/ErrorHandler')
const runCarReportPipeline = require('./car-report-pipeline')
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
    if (!req.file && !req.body.pdfSummary?.trim()) {
      return ErrorHandler(res, null, 'No Input Data', 400, null)
    }
    const result = await runCarReportPipeline({
      pdfBuffer: req.file?.buffer,
      pdfSummary: req.body.pdfSummary,
      options: {
        minPriceLimit: req.body.minPriceLimit,
        maxPriceLimit: req.body.maxPriceLimit,
        facebookScrollCount: req.body.facebookScrollCount,
        hatla2eePaging: req.body.hatla2eePaging,
        browserClient: req.body.browserClient,
      },
      onProgress: (m) => console.log(m),
    })

    res.status(200).json({ message: 'Report processed successfully', data: result.fullData })
  } catch (err) {
    if (err.statusCode) return ErrorHandler(res, null, err.message, err.statusCode, null)
    ErrorHandler(res, err.message, 'Failed to process report', 500, null)
  }
}

// --------------------------  ROUTES  ----------------------------------------------------------------
router.get('/', (req, res) => res.redirect('/car-report.html'))
router.post('/', upload.single('file'), CreateCarReport)

module.exports = router
