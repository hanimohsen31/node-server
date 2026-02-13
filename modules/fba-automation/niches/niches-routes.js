const express = require('express')
const router = express.Router()
// database
const GenericSchema = require('../../../utils/GenericShema')
const mongoose = require('mongoose')
const Niche = mongoose.model('Niche', GenericSchema())
const Favourite = mongoose.model(
  'Favourite',
  GenericSchema({
    productName: {
      type: String,
      required: [true, 'productName is required'],
      unique: [true, 'Product/Niche is already saved'],
    },
  })
)

/**
 * here we send from ui or postman the categroies selected
 * [1] send each category selcted to chatgpt apis with prompt generates 100 products ideas + save results into one json file
 * [2] chatgpt create products ideas for selected categories (popular in usa - sell price more than 20$)
 * [3] save results into one json file
 */

// --------------------------  DIVIDER  routs ---------------------------------------------------------------
/* STEP 1 */
async function SaveProductOrNicheIdea(req, res) {
  const product = req.body
  try {
    console.log(req.body)
    const isExist = await Favourite.findOne({ productName: product.productName })
    if (isExist) return res.status(400).json({ message: 'Product already saved to Favourites', data: null })
    await Favourite.insertOne(product)
    res.status(200).json({ message: 'success', data: true })
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// /* STEP 2 - generate products ideas */
async function saveManualInserts(req, res) {
  // array of  { categories, searchId, productsNumber, promptJsonOutputFormat, includeParentCategory, generateType }[]
  let { searchId, tableRows } = req.body
  if (!Array.isArray(tableRows) || !tableRows.length) {
    return res.status(400).json({ message: 'No Table Rows', data: null })
  }
  if (!searchId) searchId = Date.now()
  console.log('Body', tableRows.length, searchId)
  try {
    await Niche.insertMany(tableRows)
    res.status(200).json({ message: 'success', data: tableRows })
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// /* STEP 3 - get saved searches ids */ 
async function GetAllSearchesIds(req, res) {
  try {
    const categories = await Niche.find()
    const categoriesArray = [...new Set(categories.map((item) => item.searchId))].filter((elm) => elm !== null).concat(['favourite'])
    res.status(200).json({ message: 'Posts', data: categoriesArray })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// /* STEP 3 - get Products */
async function GetProductsBySearchId(req, res) {
  const searchId = req.params.searchId
  try {
    if (!searchId) {
      return res.status(400).json({ message: 'searchId is required' })
    }
    const products = await Niche.find({ searchId: searchId })
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found', data: [] })
    }
    res.status(200).json({ message: 'success', data: products })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// /* STEP 3 - get favourites */
async function getFavourites(req, res) {
  try {
    console.log(req.body)
    const products = await Favourite.find()
    res.status(200).json({ message: 'success', data: products })
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('/saved-search').get(GetAllSearchesIds)
router.route('/save-imported').post(saveManualInserts)
router.route('/favourite').post(SaveProductOrNicheIdea).get(getFavourites)
router.route('/:searchId').get(GetProductsBySearchId)
module.exports = router
