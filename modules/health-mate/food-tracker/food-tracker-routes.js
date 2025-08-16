const express = require('express')
const router = express.Router()
const Tracker = require('./food-tracker-model')
const ErrorHandler = require('../../../utils/ErrorHandler')
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ErrorHandler(res, null, 'No token provided', 401, 'auth1')
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    req.user = decoded // attach decoded payload to request
    next() // move on to the next middleware/route handler
  } catch (err) {
    return ErrorHandler(res, err, 'Invalid token', 401, 'auth2')
  }
}

async function GetUserTrackedItem(req, res) {
  // comes from auth middleware
  const userId = req.user.id

  try {
    const trackedItems = await Tracker.find({ userId }).populate('foodId').lean()
    const sum = {
      calories: 0,
      carbohydrates: 0,
      fat: 0,
      protein: 0,
    }

    trackedItems.forEach((item) => {
      item.id = item._id
      delete item.userId
      delete item._id
      delete item.createdAt
      delete item.updatedAt
      delete item.__v
      item.foodItem = {
        id: item.foodId._id,
        nameEn: item.foodId.nameEn,
        nameAr: item.foodId.nameAr,
        calories: item.foodId.calories,
        carbohydrates: item.foodId.carbohydrates,
        fat: item.foodId.fat,
        protein: item.foodId.protein,
        serve: item.foodId.serve,
        unit: item.foodId.unit,
      }
      sum.calories += (item.foodId?.calories || 0) * item.quantity
      sum.carbohydrates += (item.foodId?.carbohydrates || 0) * item.quantity
      sum.fat += (item.foodId?.fat || 0) * item.quantity
      sum.protein += (item.foodId?.protein || 0) * item.quantity
      delete item.foodId
    })

    res.status(201).json({
      message: 'Success',
      data: {
        items: trackedItems,
        total: {
          calories: +sum.calories.toFixed(2),
          carbohydrates: +sum.carbohydrates.toFixed(2),
          fat: +sum.fat.toFixed(2),
          protein: +sum.protein.toFixed(2),
        },
      },
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to get items', 500, 't1')
  }
}

async function CreateTrackedItem(req, res) {
  // comes from auth middleware
  const userId = req.user.id
  try {
    const { foodId, quantity, mealType } = req.body
    const trackerEntry = await Tracker.create({ userId, foodId, quantity, mealType })

    res.status(201).json({
      message: 'Tracker entry created successfully',
      data: trackerEntry,
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to create tracker entry', 500, 't1')
  }
}

async function UpdateTrackedItem(req, res) {
  const token = req.headers.authorization?.split(' ')[1] // Bearer <token>
  let decoded = ''
  try {
    decoded = await jwt.verify(token, process.env.JWT_KEY)
    req.user = decoded
  } catch (err) {
    return ErrorHandler(res, err, 'Invalid token', 401, 'upd1')
  }

  try {
    const { id } = req.params // tracker entry ID
    const { foodId, quantity, mealType } = req.body

    const updatedEntry = await Tracker.findOneAndUpdate(
      { _id: id, userId: decoded.id }, // ensure user owns the entry
      { foodId, quantity, mealType },
      { new: true, runValidators: true } // return updated doc & validate
    )

    if (!updatedEntry) {
      return ErrorHandler(res, null, 'Tracker entry not found or not authorized', 404, 'upd2')
    }

    res.status(200).json({
      message: 'Tracker entry updated successfully',
      data: updatedEntry,
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to update tracker entry', 500, 'upd3')
  }
}

async function DeleteTrackedItem(req, res) {
  const userId = req.user.id

  try {
    const { id } = req.params // tracker entry ID
    console.log(id)
    const deletedEntry = await Tracker.findOneAndDelete({ _id: id, userId })

    if (!deletedEntry) {
      return ErrorHandler(res, null, 'Tracker entry not found', 404, 'del2')
    }

    res.status(200).json({
      message: 'Tracker entry deleted successfully',
      data: deletedEntry,
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to delete tracker entry', 500, 'del3')
  }
}

async function DeleteAllTrackedItems(req, res) {
  const token = req.headers.authorization?.split(' ')[1] // Bearer <token>
  let decoded = ''

  try {
    decoded = await jwt.verify(token, process.env.JWT_KEY)
  } catch (err) {
    return ErrorHandler(res, err, 'Invalid token', 401, 'delAll1')
  }

  try {
    const result = await Tracker.deleteMany({ userId: decoded.id })
    res.status(200).json({
      message: 'All tracker entries deleted successfully',
      deletedCount: result.deletedCount,
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to delete tracker entries', 500, 'delAll2')
  }
}

router.route('').get(authMiddleware, GetUserTrackedItem).post(authMiddleware, CreateTrackedItem)
router.route('/clear').delete(authMiddleware, DeleteAllTrackedItems)
router.route('/:id').put(authMiddleware, UpdateTrackedItem).delete(authMiddleware, DeleteTrackedItem)
module.exports = router
