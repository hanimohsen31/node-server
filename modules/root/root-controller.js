const express = require('express')
const router = express.Router()

// --------------------------  DIVIDER  functions -------------------------------------------------
// get
async function GetHtmlContent(req, res) {
  try {
    res.status(200).json({ message: 'Server Works' })
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' })
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetHtmlContent)
module.exports = router
