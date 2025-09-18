const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const Cypress = require('./cypress-modal')

// --------------------------  DIVIDER  functions -------------------------------------------------
async function AddReport(req, res) {
  let body = req.body
  try {
    const savedDoc = await Cypress.create(body) // save whatever object shape
    res.status(201).json({ message: 'success', data: true })
  } catch (err) {
    ErrorHandler(res, err, 'Failed', 500, 'cddi3')
  }
}

async function GetReport(req, res) {
  try {
    const reports = await Cypress.find({})
    res.status(201).json({ message: 'success', data: reports })
  } catch (err) {
    ErrorHandler(res, err, 'Failed', 500, 'cddi3')
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetReport).post(AddReport)
module.exports = router
