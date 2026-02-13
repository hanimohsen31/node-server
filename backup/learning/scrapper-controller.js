const express = require('express')
const router = express.Router()
const axios = require('axios')

async function ScrappData(req, res) {
  const apiUrl = req.body.url
  try {
    const response = await axios.get(apiUrl)
    res.status(200).json({ message: 'Scrapp', data: response.data })
  } catch (err) {
    res.status(418).json({ message: 'No Tours Found', data: null, error: err })
  }
}

router.route('').post(ScrappData)
module.exports = router
