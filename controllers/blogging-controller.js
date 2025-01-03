const express = require('express')
const router = express.Router()
const Blogging = require('../modals/blogging-modal')
const ErrorHandler = require('../utils/ErrorHandler')
const axios = require('axios')
const { google } = require('googleapis')

// create
async function CreateBlog(req, res) {
  let body = req.body
  try {
    let newBlog = await Blogging.create(body)
    res.status(200).json({ message: 'Blog Created', data: newBlog })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

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

// delete
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

async function AddPostToBLog() {
  const apiKey = 'AIzaSyBvpxifRV3moiZTklAgtub5DAArWJjtNzE' // Replace with your actual API key
  const title = 'TITITITIIITITLE' // Replace with your actual API key
  const content = 'COCOCOOCOCOCOCOCOCOCNNNNNTETNTNNTNT' // Replace with your actual API key
  const author = 'AUTUTUTUUTUER' // Replace with your actual API key
  const apiUrl = 'https://www.googleapis.com/blogger/v3/blogs/8070105920543249955/posts/' // Replace with your API endpoint
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  const body = JSON.stringify({ title: title, content: content, author: author })
  try {
    let blog = await Blogging.findOne()
    const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: body })
    if (!response.ok) {
      const errorData = await response.json() // Try to parse error response
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }
    const data = await response.json()
    res.status(200).json({ message: 'Blog', data: data })
  } catch (error) {
    res.status(418).json({ message: 'EROOR', data: null, error: err })
  }
}

router.route('').post(CreateBlog).get(GetAllBlogs)
router.route('/order').get(GetInOrderData)
router.route('/:id').delete(DeleteBlog)
router.route('/isPublished/:id').patch(UpdateIsPublished)
router.route('/blog').post(AddPostToBLog)

module.exports = router
