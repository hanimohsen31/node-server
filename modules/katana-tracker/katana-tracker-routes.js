const express = require('express')
const router = express.Router()
const KatanaTracker = require('./katana-tracker-model.js')
// export enum EnvironmentsNames {
//   Dev = "dev",
//   Test = "test",
//   FirebaseTest = "firebaseTest",
//   FirebaseProd = "firebaseProd",
//   Comium = "comium",
//   Prod = "prod",
// }

// --------------------------  DIVIDER  functions -------------------------------------------------
// search will be with "envName"
// environement => test, prod
// create
async function SavePipelineRunDate(req, res) {
  console.log('body:', req.body)

  try {
    let { branch, envName, message } = req.body
    // github action
    if (branch && !envName) {
      if (branch == 'main' || branch == 'env/test') {
        envName = 'test'
      } else if (branch == 'env/prod') {
        envName = 'prod'
      } else if (branch == 'env/comium') {
        envName = 'comium'
      }
    }
    // manual firebase deploy
    // if (!branch && message.includes('firebase')) {
    // }
    if (!envName) envName = 'test'

    // rest of records
    const recordEnv = envName.toLowerCase().includes('test') ? 'test' : 'prod' // 'test' || 'prod'
    const recordSource = (message || '').toLowerCase().includes('firebase') ? 'firebase' : 'github' // 'github' || 'firebase'
    // create record
    await KatanaTracker.create({ ...req.body, branch, envName, recordSource, recordEnv })
    res.status(201).json({ message: 'success', envName, recordSource, recordEnv })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to save record', error: err })
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
      return res.status(404).json({ message: 'No record found', data: '' })
    }

    res.status(200).json({ message: 'success', data: record })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ error: 'Failed to fetch record' })
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetLastPipelineRun).post(SavePipelineRunDate).put(SavePipelineRunDate)
// router.route('').put(SavePipelineRunDate)
module.exports = router
