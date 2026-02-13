const express = require('express')
const router = express.Router()
const Blogging = require('./blogging-modal')

// Get All Blogs
async function GetAllBlogs(req, res) {
  let reqQuery = { ...req.query }
  try {
    // method 1 for filter
    let blog = await Blogging.find(reqQuery)
    res.status(200).json({ message: 'Blog', data: blog })
  } catch (err) {
    res.status(418).json({ message: 'No Tours Found', data: null, error: err })
  }
}

// Get In Order Data
async function GetInOrderData(req, res) {
  let reqQuery = { ...req.query, isPublished: false || null }
  try {
    // method 1 for filter
    let blog = await Blogging.findOne(reqQuery)
    res.status(200).json({ message: 'Blog', data: blog })
  } catch (err) {
    res.status(418).json({ message: 'No Tours Found', data: null, error: err })
  }
}

// Update Is Published
async function UpdateIsPublished(req, res) {
  const id = req.params.id
  try {
    let blog = await Blogging.findByIdAndUpdate(
      id,
      { $set: { isPublished: false } }, // Set the new value for isPublished
      { new: true } // Return the updated document
    )
    if (!blog) return res.status(404).json({ message: 'Blog not found', data: null })
    res.status(200).json({ message: 'Blog updated successfully', data: blog })
  } catch (err) {
    res.status(500).json({ message: 'Error updating blog', data: null, error: err })
  }
}

// Delete Blog
async function DeleteBlog(req, res) {
  const id = req.params.id
  try {
    const deletedBlog = await Blogging.findByIdAndDelete(id)
    if (!deletedBlog) return res.status(404).json({ message: 'Blog not found', data: null })
    res.status(200).json({ message: 'Blog Deleted', data: deletedBlog })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting blog', data: null, error: err })
  }
}

// create one
async function CreateBlog(req, res) {
  let body = req.body
  try {
    let newBlog = await Blogging.create(body)
    res.status(200).json({ message: 'Blog Created', data: newBlog })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// create Bulk
async function UpdateProductsBulk(req, res) {
  let body = req.body
  try {
    await Blogging.deleteMany()
    let newProducts = await Blogging.insertMany(body)
    res.status(200).json({ message: 'Products Deleted and Inserted', data: newProducts })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

router.route('').post(CreateBlog).get(GetAllBlogs)
router.route('/order').get(GetInOrderData)
router.route('/update-bulk').put(UpdateProductsBulk)
router.route('/:id').delete(DeleteBlog)
router.route('/isPublished/:id').patch(UpdateIsPublished)

module.exports = router
