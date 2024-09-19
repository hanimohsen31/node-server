const express = require('express')
const router = express.Router()
const Tour = require('../modals/tours-modal')
const APIsFeatures = require('../utils/APIsFeatures')
const ProtectedRoute = require('../utils/ProtectedRoute')
const RestrictTo = require('../utils/RestrictTo')
const ErrorHandler = require('../utils/ErrorHandler')

function top5(req, res, next) {
  req.query.pageCount = 5
  req.query.sort = '-price'
  next()
}

// get all
async function GetAllTours(req, res) {
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

async function GetAllToursUsingAPIsFeatures(req, res) {
  try {
    const features = new APIsFeatures(Tour.find(), req.query).filter().sort().fields().paging()
    const tours = await features.query
    res.status(200).json({ message: 'Tours', data: tours, length: tours.length })
  } catch (err) {
    res.status(418).json({ message: 'No Tours Found', data: null, error: err })
  }
}

async function GetToursStats(req, res) {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAvrage: { $gte: 4.5 } },
      },
      {
        $group: {
          // this will get all documents in one group
          // _id: null,
          // also you can use field
          _id: '$difficulty',
          toursNum: { $sum: 1 }, // add 1 for each document to the counter
          numRating: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAvrage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        // only able to sort by props in $group
        $sort: { avgPrice: 1 }, // 1 for acc
      },
    ])
    res.status(200).json({ message: 'Tours', data: stats })
  } catch (err) {
    res.status(418).json({ message: 'Error in aggregate', data: null, error: err })
  }
}

// get by id
async function GetToursById(req, res) {
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
async function PostTour(req, res) {
  let body = req.body
  try {
    let newTour = await Tour.create(body)
    res.status(200).json({ message: 'Tour Created', data: newTour })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// update
async function PatchTour(req, res) {
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
async function DeleteTour(req, res) {
  let id = req.params.id
  try {
    let tour = await Tour.findByIdAndDelete(id)
    res.status(200).json({ message: 'Tour Deleted', data: tour })
  } catch (err) {
    res.status(418).json({ message: 'Tour has not been Deleted', data: null })
  }
}

router.route('').get(ProtectedRoute, GetAllTours).post(PostTour)
router.route('/top5').get(ProtectedRoute, top5, GetAllTours)
router.route('/apis-features').get(ProtectedRoute, GetAllToursUsingAPIsFeatures)
router.route('/tours-stats').get(ProtectedRoute, GetToursStats)
router.route('/:id').get(ProtectedRoute, GetToursById).patch(ProtectedRoute, RestrictTo('admin'), PatchTour).delete(ProtectedRoute, RestrictTo('admin'), DeleteTour)
module.exports = router
