const express = require('express')
const router = express.Router()
const FoodList = require('./food-list-model')
const ErrorHandler = require('../../../utils/ErrorHandler')

// --------------------------  DIVIDER  functions -------------------------------------------------
// Get all food items
async function GetAllFoodLists(req, res) {
  try {
    const foodLists = await FoodList.find()
    res.status(200).json({ message: 'Food lists retrieved successfully', data: foodLists })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to retrieve food lists', 500, 'flg1')
  }
}

// Get food item by id
async function GetFoodListById(req, res) {
  const id = req.params.id
  try {
    const foodItem = await FoodList.findById(id)
    if (foodItem) res.status(200).json({ message: 'Food item found', data: foodItem })
    else ErrorHandler(res, null, 'Food item not found', 404, 'flg2')
  } catch (err) {
    ErrorHandler(res, err, 'Failed to retrieve food item', 500, 'flg2')
  }
}

// Create new food item
async function CreateFoodItem(req, res) {
  try {
    const newFoodItem = await FoodList.create(req.body)
    res.status(201).json({ message: 'Food item created successfully', data: newFoodItem })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to create food item', 500, 'fl1')
  }
}

// Update food item
async function UpdateFoodItem(req, res) {
  const id = req.params.id
  try {
    const updatedFoodItem = await FoodList.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (updatedFoodItem) {
      res.status(200).json({ message: 'Food item updated successfully', data: updatedFoodItem })
    } else {
      ErrorHandler(res, null, 'Food item not found', 404, 'fl3')
    }
  } catch (err) {
    ErrorHandler(res, err, 'Failed to update food item', 500, 'fl3')
  }
}

// Delete food item
async function DeleteFoodItem(req, res) {
  const id = req.params.id
  try {
    const deletedFoodItem = await FoodList.findByIdAndDelete(id)
    if (deletedFoodItem) {
      res.status(200).json({ message: 'Food item deleted successfully', data: deletedFoodItem })
    } else {
      ErrorHandler(res, null, 'Food item not found', 404, 'fl4')
    }
  } catch (err) {
    ErrorHandler(res, err, 'Failed to delete food item', 500, 'fl4')
  }
}

// Create multiple food items (bulk insert)
async function CreateBulkFoodItems(req, res) {
  try {
    const foodItems = req.body
    if (!Array.isArray(foodItems) || foodItems.length === 0) {
      return ErrorHandler(res, null, 'Food items array is required', 400, 'fl5')
    }
    const newFoodItems = await FoodList.insertMany(foodItems, { ordered: false })
    res.status(201).json({ message: 'Food items created successfully', data: newFoodItems })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to create food items', 500, 'fl5')
  }
}

// --------------------------  DIVIDER  routers ---------------------------------------------------
router.route('').get(GetAllFoodLists).post(CreateFoodItem)
router.route('/:id').get(GetFoodListById).put(UpdateFoodItem).delete(DeleteFoodItem)
router.route('/bulk').post(CreateBulkFoodItems)
module.exports = router
