const express = require('express')
const router = express.Router()
const Tour = require('../modals/tours-modal')
const APIsFeatures = require('../utils/APIsFeatures')
const ProtectedRoute = require('../utils/ProtectedRoute')
const RestrictTo = require('../utils/RestrictTo')
const ErrorHandler = require('../utils/ErrorHandler')

// get all
async function GetAllPosts(req, res) {
  // console.log(req.query)
  let reqQuery = { ...req.query }
  let excluded = ['pageNumber', 'pageCount', 'sort', 'fields']
  excluded.forEach((elm) => delete reqQuery[elm])
  try {
    // method 1 for filter
    // let tours = await Tour.find(query)
    // method 2 for filter
    // let tours = await Tour.find().where('price').equals(500).where('difficulty').equals("easy")

    // now for chaining
    // this way returning a new querey to chain multible quiries
    let query = Tour.find(reqQuery)
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
      query = query.select('-__v')
    }
    // Pagination
    let pageNumber = +req.query.pageNumber || 1
    let pageCount = +req.query.pageCount || 10
    let skippedRecords = (pageNumber - 1) * pageCount
    query = query.skip(skippedRecords).limit(pageCount)
    // check length
    if (req.query.page) {
      const length = await Tour.countDocuments()
      if (skippedRecords >= length) throw new Error('Page Not Found')
    }

    let tours = await query
    res.status(200).json({ message: 'Tours', data: tours, length: tours.length })
  } catch (err) {
    // console.log(err)
    res.status(418).json({ message: 'No Tours Found', data: null, error: err })
  }
}

// get by id
async function GetPostById(req, res) {
  let id = req.params.id
  try {
    let tour = await Tour.findById(id)
    if (tour) res.status(200).json({ message: 'Tour Found', data: tour })
    else ErrorHandler(res, null, 'Tour not found', 404, 'tid1')
  } catch (err) {
    ErrorHandler(res, err, 'No Matching Tour', 418, 'tid1')
  }
}

// create
async function PostPost(req, res) {
  let body = req.body
  try {
    let newTour = await Tour.create(body)
    res.status(200).json({ message: 'Tour Created', data: newTour })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// update
async function PatchPost(req, res) {
  let id = req.params.id
  let data = req.body
  try {
    let tour = await Tour.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    res.status(200).json({ message: 'Tour Updated', data: tour })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

// delete
async function DeletePost(req, res) {
  let id = req.params.id
  try {
    let tour = await Tour.findByIdAndDelete(id)
    res.status(200).json({ message: 'Tour Deleted', data: tour })
  } catch (err) {
    res.status(418).json({ message: 'Tour has not been Deleted', data: null })
  }
}

router.route('').get(ProtectedRoute, GetAllTours).post(PostTour)
router.route('/:id').get(ProtectedRoute, GetToursById).patch(ProtectedRoute, RestrictTo('admin'), PatchTour).delete(ProtectedRoute, RestrictTo('admin'), DeleteTour)
module.exports = router
