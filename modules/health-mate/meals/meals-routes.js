const express = require('express')
const router = express.Router()
const Meals = require('./meals-model')
const ErrorHandler = require('../../../utils/ErrorHandler')

async function GetAllMeals(req, res) {
  try {
    const mealsList = await Meals.find().populate('foodId').lean()
    const sum = {
      calories: 0,
      carbohydrates: 0,
      fat: 0,
      protein: 0,
    }

    mealsList.forEach((item) => {
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
        items: mealsList,
        total: {
          calories: +sum.calories.toFixed(2),
          carbohydrates: +sum.carbohydrates.toFixed(2),
          fat: +sum.fat.toFixed(2),
          protein: +sum.protein.toFixed(2),
        },
      },
    })
  } catch (err) {
    console.log(err)
    ErrorHandler(res, err, 'Failed to retrieve food lists', 500, 'flg1')
  }
}

// Get food item by id
async function GetMealById(req, res) {
  const id = req.params.id
  try {
    const mealItem = await Meals.findById(id)
    if (mealItem) res.status(200).json({ message: 'Food item found', data: mealItem })
    else ErrorHandler(res, null, 'Food item not found', 404, 'flg2')
  } catch (err) {
    ErrorHandler(res, err, 'Failed to retrieve food item', 500, 'flg2')
  }
}

// Create new food item
async function CreateMealItem(req, res) {
  try {
    const newMeal = await Meals.create(req.body)
    res.status(201).json({ message: 'Food item created successfully', data: newMeal })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to create food item', 500, 'fl1')
  }
}

// Update food item
async function UpdateMealItem(req, res) {
  const id = req.params.id
  try {
    const updatedMealItem = await Meals.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (updatedMealItem) {
      res.status(200).json({ message: 'Food item updated successfully', data: updatedMealItem })
    } else {
      ErrorHandler(res, null, 'Food item not found', 404, 'fl3')
    }
  } catch (err) {
    ErrorHandler(res, err, 'Failed to update food item', 500, 'fl3')
  }
}

// Delete food item
async function DeleteMealItem(req, res) {
  const id = req.params.id
  try {
    const deletedMealItem = await Meals.findByIdAndDelete(id)
    if (deletedMealItem) {
      res.status(200).json({ message: 'Food item deleted successfully', data: deletedMealItem })
    } else {
      ErrorHandler(res, null, 'Food item not found', 404, 'fl4')
    }
  } catch (err) {
    ErrorHandler(res, err, 'Failed to delete food item', 500, 'fl4')
  }
}

router.route('').get(GetAllMeals).post(CreateMealItem)
router.route('/:id').get(GetMealById).put(UpdateMealItem).delete(DeleteMealItem)
module.exports = router
