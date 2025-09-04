const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../../utils/ErrorHandler')
const jwt = require('jsonwebtoken')
const DayDiet = require('./day-diet-model')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ErrorHandler(res, null, 'No token provided', 401, 'auth1')
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    req.user = decoded // attach decoded payload to request
    console.log(res.user)
    next() // move on to the next middleware/route handler
  } catch (err) {
    return ErrorHandler(res, err, 'Invalid token', 401, 'auth2')
  }
}

function fromateDayDiet(dayDietItem) {
  dayDietItem.id = dayDietItem._id
  delete dayDietItem._id
  delete dayDietItem.__v
  if (dayDietItem.createdBy) {
    dayDietItem.createdBy.id = dayDietItem.createdBy._id
    delete dayDietItem.createdBy._id
  }
  if (dayDietItem.assignees) {
    dayDietItem.assignees = dayDietItem.assignees.map((a) => {
      a.id = a._id
      delete a._id
      return a
    })
  }
  console.log(dayDietItem.meals)

  dayDietItem.meals = dayDietItem.meals.map((meal) => {
    return {
      id: meal.id,
      quantity: meal.quantity,
      mealType: meal.mealType,
      foodItem: {
        id: meal.foodId._id,
        nameEn: meal.foodId.nameEn,
        nameAr: meal.foodId.nameAr,
        calories: meal.foodId.calories,
        carbohydrates: meal.foodId.carbohydrates,
        fat: meal.foodId.fat,
        protein: meal.foodId.protein,
        serve: meal.foodId.serve,
        unit: meal.foodId.unit,
      },
    }
  })

  return dayDietItem
}

async function GetDayDietList(req, res) {
  try {
    // comes from auth middleware
    const userId = req.user.id
    let dayDiets = await DayDiet.find({
      $or: [{ createdBy: userId }, { assignees: userId }],
    })
      .populate([
        { path: 'meals.foodId' },
        { path: 'createdBy', select: '_id username fullName email role' },
        { path: 'assignees', select: '_id username email role gender height weight activityLevel fitnessGoals' },
      ])
      .lean()
    // Format results
    dayDiets = dayDiets.map((diet) => fromateDayDiet(diet)) || []
    res.status(200).json({
      message: 'success',
      data: dayDiets,
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to get list', 500, 'gddl1')
  }
}

async function GetDayDietById(req, res) {
  try {
    const dayDietId = req.params.id
    const userId = req.user.id
    let dayDiet = await DayDiet.findOne({
      _id: dayDietId,
      $or: [{ createdBy: userId }, { assignees: userId }],
    })
      .populate([
        { path: 'meals.foodId' },
        { path: 'createdBy', select: '_id username fullName email role' },
        { path: 'assignees', select: '_id username email role gender height weight activityLevel fitnessGoals' },
      ])
      .lean()
    if (!dayDiet) return ErrorHandler(res, null, 'DayDiet not found or access denied', 404, 'gddbi1a')
    res.status(200).json({ message: 'success', data: fromateDayDiet(diet) })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to get DayDiet by ID', 500, 'gddbi1b')
  }
}

async function CreateDayDietItem(req, res) {
  const userId = req.user.id
  try {
    let dayDiet = new DayDiet(req.body)
    dayDiet = await dayDiet.populate({ path: 'meals.foodId', model: 'FoodList' })
    dayDiet.createdBy = userId
    dayDiet.assignees = req.body.assignees || [userId]
    // Sum
    dayDiet.meals.forEach((meal) => {
      if (meal.foodId) {
        dayDiet.totalCalories += meal.foodId.calories * meal.quantity
        dayDiet.totalCarbohydrate += meal.foodId.carbohydrates * meal.quantity
        dayDiet.totalFat += meal.foodId.fat * meal.quantity
        dayDiet.totalProtein += meal.foodId.protein * meal.quantity
      }
    })
    // Save
    await dayDiet.save()
    let responseData = await DayDiet.findById(dayDiet._id)
      .populate([
        { path: 'meals.foodId' },
        { path: 'createdBy', select: '_id username fullName email role' },
        { path: 'assignees', select: '_id username email role gender height weight activityLevel fitnessGoals' },
      ])
      .lean()
    res.status(201).json({ message: 'success', data: fromateDayDiet(responseData) })
  } catch (err) {
    console.log(err)
    ErrorHandler(res, err, 'Failed', 500, 'cddi3')
  }
}

async function UpdateDayDietItem(req, res) {
  try {
    const dayDietId = req.params.id
    const userId = req.user.id
    let dayDiet = await DayDiet.findOne({
      _id: dayDietId,
      $or: [{ createdBy: userId }, { assignees: userId }],
    })
    if (!dayDiet) return ErrorHandler(res, null, 'Item not found', 403, 'updd4a')
    Object.assign(dayDiet, req.body)
    await dayDiet.populate('meals.foodId')
    // Sum
    dayDiet.meals.forEach((meal) => {
      meal.items.forEach((item) => {
        if (item.foodId) {
          dayDiet.totalCalories += item.foodId.calories * item.quantity
          dayDiet.totalCarbohydrate += item.foodId.carbohydrates * item.quantity
          dayDiet.totalFat += item.foodId.fat * item.quantity
          dayDiet.totalProtein += item.foodId.protein * item.quantity
        }
      })
    })
    await dayDiet.save()
    // Step 6: Populate for response
    let responseData = await DayDiet.findById(dayDiet._id)
      .populate([
        { path: 'meals.foodId' },
        { path: 'createdBy', select: '_id username fullName email role' },
        { path: 'assignees', select: '_id username email role gender height weight activityLevel fitnessGoals' },
      ])
      .lean()
    res.status(200).json({ message: 'success', data: fromateDayDiet(responseData) })
  } catch (err) {
    console.error(err)
    ErrorHandler(res, err, 'Failed to update record', 500, 'updd4b')
  }
}

async function DeleteDayDietItem(req, res) {
  try {
    const dayDietId = req.params.id
    const userId = req.user.id
    const dayDiet = await DayDiet.findOne({
      _id: dayDietId,
      $or: [{ createdBy: userId }, { assignees: userId }],
    })
    if (!dayDiet) return ErrorHandler(res, null, 'Item not found', 404, 'dddi5a')
    await DayDiet.deleteOne({ _id: dayDietId })
    res.status(200).json({ message: 'success', id: dayDietId })
  } catch (err) {
    console.error(err)
    ErrorHandler(res, err, 'Failed to delete record', 500, 'dddi5b')
  }
}

router.route('').get(authMiddleware, GetDayDietList).post(authMiddleware, CreateDayDietItem)
router.route('/:id').get(authMiddleware, GetDayDietById).put(authMiddleware, UpdateDayDietItem).delete(authMiddleware, DeleteDayDietItem)
module.exports = router
