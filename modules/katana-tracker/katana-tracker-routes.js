const express = require('express')
const router = express.Router()
const KatanaTracker = require('./katana-tracker-model.js')

// --------------------------  DIVIDER  functions -------------------------------------------------
// search will be with "envName"
// environement => test, prod
// create
async function SavePipelineRunDate(req, res) {
  try {
    const { branch, envName } = req.body

    if (branch && !envName) {
      if (branch.includes('main') || branch.includes('test')) {
        envName = 'test'
      } else if (branch.includes('prod')) {
        envName = 'prod'
      } else if (branch.includes('comium')) {
        envName = 'comium'
      }
    }
    // const { date, branch, version, environement, commit } = req.body
    await KatanaTracker.create({ ...req.body })
    res.status(201).json({ message: 'success' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save record' })
  }
}

// search will be with "envName"
// get
async function GetLastPipelineRun(req, res) {
  try {
    const { envName } = req.query

    const record = await KatanaTracker.findOne({
      envName: { $regex: envName || '', $options: 'i' },
    }).sort({ createdAt: -1 })

    // Fallback: no match → just return the latest record in DB
    if (!record) {
      record = await KatanaTracker.findOne().sort({ createdAt: -1 })
    }

    if (!record) {
      return res.status(404).json({ message: 'No record found', data: null })
    }

    res.status(200).json({ message: 'success', data: record })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ error: 'Failed to fetch record' })
  }
}
// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetLastPipelineRun).post(SavePipelineRunDate)

module.exports = router
