const express = require('express')
const router = express.Router()
const Post = require('../modals/posts-modal')
const Product = require('../modals/products-modal')
const ProtectedRoute = require('../utils/ProtectedRoute')
const ErrorHandler = require('../utils/ErrorHandler')

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
// create
async function CreatePost(req, res) {
  let body = req.body
  try {
    let newPost = await Post.create(body)
    res.status(200).json({ message: 'Post Added', data: newPost })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// get all
async function GetAllPosts(req, res) {
  let reqQuery = { ...req.query }
  let excluded = ['PageIndex', 'PageSize', 'sort', 'fields']
  excluded.forEach((elm) => delete reqQuery[elm])
  try {
    // now for chaining
    // this way returning a new querey to chain multible quiries
    query = Post.find()

    // Sorting
    if (req.query.sort) {
      let sortBy = req.query.sort.split(',').join()
      query = query.sort(sortBy)
    }

    // Limit fields
    if (req.query.fields) {
      let fields = req.query.fields.split(',').join()
      query = query.select(fields)
    } else {
      query = query.select('')
      // to exclue a field
      query = query.select('-__v -content')
    }

    // Search
    if (req.query.search) {
      const searchText = req.query.search
      query = query.find({ title: { $regex: searchText, $options: 'i' } })
    }

    // Pagination
    // Count matching items
    // Clone the query conditions for counting
    const countQuery = Post.find(query._conditions)
    let totalCount = await countQuery.countDocuments()
    let PageIndex = +req.query.PageIndex || 1
    let PageSize = +req.query.PageSize || 10
    let totalPages = Math.ceil(totalCount / PageSize)
    let skippedRecords = (PageIndex - 1) * PageSize
    query = query.skip(skippedRecords).limit(PageSize)
    // check length
    if (req.query.page && skippedRecords >= totalCount) throw new Error('Page Not Found')

    let posts = await query
    res.status(200).json({ message: 'Posts', data: posts, totalCount, totalPages })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// get by id
async function GetPostBySlug(req, res) {
  let slug = req.params.slug
  try {
    let post = await Post.findOne({ slug })
    if (post) res.status(200).json({ message: 'Post Found', data: post })
    else ErrorHandler(res, null, 'Post not found', 404, 'gpsts1')
  } catch (err) {
    ErrorHandler(res, err, 'No Matching Post', 418, 'gpsts2')
  }
}

// delete
async function DeletePost(req, res) {
  let slug = req.params.slug
  try {
    let post = await Post.findOne({ slug })
    res.status(200).json({ message: 'Post Deleted', data: post })
  } catch (err) {
    res.status(418).json({ message: 'Post has not been Deleted', data: null })
  }
}

// --------------------------  DIVIDER  products ------------------------------------------------------------
// create
async function CreateProduct(req, res) {
  let body = req.body
  try {
    let newProduct = await Product.create(body)
    res.status(200).json({ message: 'Product Added', data: newProduct })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// get all
async function GetAllProducts(req, res) {
  // console.log(req.query)
  let reqQuery = { ...req.query }
  let excluded = ['pageIndex', 'pageSize', 'sort', 'fields']
  excluded.forEach((elm) => delete reqQuery[elm])
  try {
    // now for chaining
    // this way returning a new querey to chain multible quiries
    let query = Product.find()

    // Sorting
    if (req.query.sort) {
      let sortBy = req.query.sort.split(',').join()
      query = query.sort(sortBy)
    }

    // Limit fields
    if (req.query.fields) {
      let fields = req.query.fields.split(',').join()
      query = query.select(fields)
    } else {
      query = query.select('')
      // to exclue a field
      query = query.select('-__v -content')
    }
    
    // Search
    if (req.query.search) {
      const searchText = req.query.search
      query = query.find({ name: { $regex: searchText, $options: 'i' } })
    }

    // Pagination
    // Count matching items
    // Clone the query conditions for counting
    const countQuery = Product.find(query._conditions)
    let totalCount = await countQuery.countDocuments()
    let PageIndex = +req.query.PageIndex || 1
    let PageSize = +req.query.PageSize || 10
    let totalPages = Math.ceil(totalCount / PageSize)
    let skippedRecords = (PageIndex - 1) * PageSize
    query = query.skip(skippedRecords).limit(PageSize)
    // check length
    if (req.query.page && skippedRecords >= totalCount) throw new Error('Page Not Found')

    let products = await query
    res.status(200).json({ message: 'Products', data: products, totalCount, totalPages  })
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: 'No Products Found', data: null, error: err })
  }
}

// get by id
async function GetProductBySlug(req, res) {
  let slug = req.params.slug
  try {
    let product = await Product.findOne({ slug })
    if (product) res.status(200).json({ message: 'Product Found', data: product })
    else ErrorHandler(res, null, 'Product not found', 404, 'gprds1')
  } catch (err) {
    ErrorHandler(res, err, 'No Matching Product', 418, 'gprds2')
  }
}

// delete
async function DeleteProduct(req, res) {
  let slug = req.params.slug
  try {
    let product = await Product.findOne({ slug })
    res.status(200).json({ message: 'Product Deleted', data: product })
  } catch (err) {
    res.status(418).json({ message: 'Product has not been Deleted', data: null })
  }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('/posts').get(GetAllPosts)
router.route('/post').post(ProtectedRoute, CreatePost)
router.route('/post/:slug').get(GetPostBySlug).delete(ProtectedRoute, DeletePost)

router.route('/products').get(GetAllProducts)
router.route('/product').post(ProtectedRoute, CreateProduct)
router.route('/product/:slug').get(GetProductBySlug).delete(ProtectedRoute, DeleteProduct)

module.exports = router
