const express = require('express')
const router = express.Router()
const Blogging = require('../modals/blogging-modal')
const ErrorHandler = require('../utils/ErrorHandler')

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
  const { id } = req.params // Get the ID from the request parameters
  const { isPublished } = req.body // Get the updated flag value from the request body

  try {
    // Update the tour by ID with the new isPublished flag
    let updatedTour = await Tour.findByIdAndUpdate(
      id,
      { $set: { isPublished } }, // Set the new value for isPublished
      { new: true } // Return the updated document
    )

    if (!updatedTour) {
      return res.status(404).json({ message: 'Tour not found', data: null })
    }

    res.status(200).json({ message: 'Tour updated successfully', data: updatedTour })
  } catch (err) {
    res.status(500).json({ message: 'Error updating tour', data: null, error: err })
  }
}

router.route('').post(CreateBlog)
router.route('/order').get(GetInOrderData)
router.route('/:id').get().patch().delete()
router.route('/isPublished/:id').patch(UpdateIsPublished)
module.exports = router
