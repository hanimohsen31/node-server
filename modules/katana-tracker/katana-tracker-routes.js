const express = require('express')
const router = express.Router()
const KatanaTracker = require('./katana-tracker-model.js')

// --------------------------  DIVIDER  functions -------------------------------------------------
// search will be with "envName"
// environement => test, prod
// create
async function SavePipelineRunDate(req, res) {
  try {
    let { branch, envName } = req.body

    if (branch && !envName) {
      if (branch == 'main' || branch == 'env/test') {
        envName = 'test'
      } else if (branch == 'env/prod') {
        envName = 'prod'
      } else if (branch == 'env/comium') {
        envName = 'comium'
      }
    }

    if (!envName || !['test', 'prod', 'comium'].includes(envName)) envName = 'test'

    await KatanaTracker.create({ ...req.body, branch, envName })
    res.status(201).json({ message: 'success' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save record' })
  }
}

// search will be with "envName"
// get
async function GetLastPipelineRun(req, res) {
  try {
    let { envName } = req.query
    console.log(envName)

    let record = await KatanaTracker.findOne({
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
