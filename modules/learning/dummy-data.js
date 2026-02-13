const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const ErrorHandler = require('../../utils/ErrorHandler')

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
// get by id
async function GetDummyData(req, res) {
  try {
    let filePath = path.join(__dirname, '../../public/dashboard.json')
    console.log(filePath);
    let data = fs.readFileSync(filePath, 'utf8')
    res.status(200).json({ message: 'Data Found', data: JSON.parse(data) })
  } catch (err) {
    ErrorHandler(res, err, 'No Matching Post', 418, 'gpsts2')
  }
}


// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').get(GetDummyData)
module.exports = router
