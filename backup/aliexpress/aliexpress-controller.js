const express = require('express')
const router = express.Router()
const AliExpress = require('./aliexpress-modal')

// create
async function UpdateProductsBulk(req, res) {
  let body = req.body;
  try {
    await AliExpress.deleteMany();
    let newProducts = await AliExpress.insertMany(body);
    res.status(200).json({ message: 'Products Deleted and Inserted', data: newProducts });
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err });
  }
}

async function GetAllProducts(req, res) {
  try {
    // method 1 for filter
    let products = await AliExpress.find()
    res.status(200).json({ message: 'AliExpress Products', data: products })
  } catch (err) {
    res.status(418).json({ message: 'No products Found', data: null, error: err })
  }
}

router.route('').put(UpdateProductsBulk).get(GetAllProducts)
module.exports = router
