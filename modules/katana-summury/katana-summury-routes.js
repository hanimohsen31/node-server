const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const KatanaSummuries = require('./katana-summury-model.js')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// --------------------------  DIVIDER  functions -------------------------------------------------
// create
async function SaveFileIntoServer(req, res) {
  try {
    const { filename, runId } = req.body
    const file = req.file

    // Validate inputs
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    if (!filename || !runId) {
      return res.status(400).json({ error: 'filename and runId are required' })
    }

    // Only accept HTML files
    if (file.mimetype !== 'text/html') {
      return res.status(400).json({ error: 'Only HTML files are allowed' })
    }

    const doc = await KatanaSummuries.create({
      filename,
      runId,
      fileType: 'html',
      content: file.buffer,
    })

    res.status(201).json({ message: 'success', id: doc.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to upload report' })
  }
}

// get
async function GetHtmlContent(req, res) {
  try {
    const { filename, runId } = req.query
    // Build query object dynamically
    let query = {}
    if (filename) query.filename = filename
    if (runId) query.runId = runId
    // Get the latest matching record
    const report = await KatanaSummuries.findOne(query).sort({ createdAt: -1 })
    if (!report) {
      return res.status(404).json({ message: 'No report found', data: null })
    }
    res.status(200).json({ message: 'success', data: report })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch report' })
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetHtmlContent).post(upload.single('content'), SaveFileIntoServer)

module.exports = router
