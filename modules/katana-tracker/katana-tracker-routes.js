const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const KatanaTracker = require('./katana-tracker-model.js')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// --------------------------  DIVIDER  functions -------------------------------------------------
// environement => dev, test, prod
// create
async function SavePipelineRunDate(req, res) {
  try {
    // const { date, branch, version, environement, commit } = req.body
    await KatanaTracker.create({ ...req.body })
    res.status(201).json({ message: 'success' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save record' })
  }
}

// get
async function GetLastPipelineRun(req, res) {
  try {
    const { environement } = req.query
    let query = {}
    if (environement) query.environement = environement
    const record = await KatanaTracker.findOne(query).sort({ createdAt: -1 })
    if (!record) {
      return res.status(404).json({ message: 'No record found', data: null })
    }
    res.status(200).json({ message: 'success', data: record })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch record' })
  }
}
// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetLastPipelineRun).post(SavePipelineRunDate)

module.exports = router
