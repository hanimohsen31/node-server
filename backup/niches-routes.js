const express = require('express')
const router = express.Router()
const Favourite = require('./favourites-model')
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

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
// generate products ideas
// async function CreateProductsIdeas(req, res) {
//   let { categories, searchId, productsNumber, promptJsonOutputFormat, includeParentCategory, generateType } = req.body
//   if (!categories) return res.status(400).json({ message: 'Categories required', data: null })
//   if (!searchId) searchId = Date.now()
//   let allProductsIdeas = []
//   try {
//     // [1] remove dublicated
//     // [2] push to allProductsIdeas
//     // [3] save to database
//     for (let i = 0; i < categories.length; i++) {
//       try {
//         let elm = categories[i]
//         let fullCategoryName = includeParentCategory ? `${elm.categoryName} in ${elm.parentName}` : `${elm.categoryName}`
//         if (includeParentCategory && elm.categoryName == elm.parentName) fullCategoryName = fullCategoryName.split(' in ')[0]
//         const prompt =
//           generateType == 'niches'
//             ? generateNichesPrompt(fullCategoryName, productsNumber, promptJsonOutputFormat)
//             : generateProductsPrompt(fullCategoryName, productsNumber, promptJsonOutputFormat)
//         if (!elm.categoryName || !fullCategoryName || !prompt) continue
//         const Response = await getAddedItemDetails(prompt) // parsing string to js object
//         if (Response) {
//           let spreadedProductsArray = Response.map((item) => {
//             return {
//               ...item,
//               categoryName: elm?.categoryName,
//               parentName: elm?.parentName,
//               searchId: searchId,
//             }
//           })
//           allProductsIdeas.push(...spreadedProductsArray)
//         }
//       } catch (err) {
//         console.log('Error in loop item: ', err)
//         continue
//       }
//     }
//     await Niche.insertMany(allProductsIdeas)
//     allProductsIdeas = allProductsIdeas.map((elm) => elm.keywords.map((keyword) => keyword.trim()))
//     res.status(200).json({ message: 'success', data: allProductsIdeas.flat() })
//   } catch (err) {
//     res.status(400).json({ message: 'Invalid Data', data: null, error: err })
//   }
// }

// get Products
async function GetProducts(req, res) {
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

// get saved searches ids
async function GetAllSearches(req, res) {
  try {
    const categories = await Niche.find()
    const categoriesArray = [...new Set(categories.map((item) => item.searchId))].filter((elm) => elm !== null).concat(['favourite'])
    res.status(200).json({ message: 'Posts', data: categoriesArray })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// async function GetPromptsForSelectedCategories(req, res) {
//   let { categories, searchId, productsNumber, promptJsonOutputFormat, includeParentCategory, generateType } = req.body
//   if (!categories) return res.status(400).json({ message: 'Categories required', data: null })
//   if (!searchId) searchId = Date.now()
//   let prompts = []
//   try {
//     for (let i = 0; i < categories.length; i++) {
//       try {
//         let elm = categories[i]
//         let fullCategoryName = includeParentCategory ? `${elm.categoryName} in ${elm.parentName}` : `${elm.categoryName}`
//         if (includeParentCategory && elm.categoryName == elm.parentName) fullCategoryName = fullCategoryName.split(' in ')[0]
//         let prompt = `
// /* ------------------------------ ${elm.categoryName} ------------------------------ */

// ${
//   generateType == 'niches'
//     ? generateNichesPrompt(fullCategoryName, productsNumber, promptJsonOutputFormat)
//     : generateProductsPrompt(fullCategoryName, productsNumber, promptJsonOutputFormat)
// }

// `
//         if (!elm.categoryName || !fullCategoryName) continue
//         prompts.push(prompt)
//       } catch (err) {
//         console.log('Error in loop item: ', err)
//         continue
//       }
//     }
//     res.status(200).json({ message: 'success', data: prompts })
//   } catch (err) {
//     res.status(400).json({ message: 'Invalid Data', data: null, error: err })
//   }
// }

async function SaveProductOrNicheIdea(req, res) {
  const product = req.body
  try {
    console.log(req.body)
    const isExist = await Favourite.findOne({ productName: product.productName })
    if (isExist) return res.status(400).json({ message: 'Product already saved to Favourites', data: null })
    await Favourite.insertOne(product)
    res.status(200).json({ message: 'success', data: true })
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

async function getFavourites(req, res) {
  try {
    console.log(req.body)
    const products = await Favourite.find()
    res.status(200).json({ message: 'success', data: products })
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// generate products ideas
async function saveManualInserts(req, res) {
  // array of  { categories, searchId, productsNumber, promptJsonOutputFormat, includeParentCategory, generateType }[]
  let { searchId, tableRows } = req.body
  if (!Array.isArray(tableRows) || !tableRows.length) {
    return res.status(400).json({ message: 'No Table Rows', data: null })
  }
  if (!searchId) searchId = Date.now()
  try {
    await Niche.insertMany(tableRows)
    res.status(200).json({ message: 'success', data: tableRows })
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(CreateProductsIdeas)
router.route('/saved-search').get(GetAllSearches)
router.route('/save-imported').post(saveManualInserts)
router.route('/favourite').post(SaveProductOrNicheIdea).get(getFavourites)
router.route('/prompts').post(GetPromptsForSelectedCategories)
router.route('/:searchId').get(GetProducts)
module.exports = router
