const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const filePath = path.join(__dirname, '../dev-data/gym-app/meals-type/meals.json')
let Meals = JSON.parse(fs.readFileSync(filePath))
const Response = {
  CorrelationId: 'd0ca6117-4cdd-432c-9859-35ca2a0f443c',
  Status: true,
  ProblemDetails: null,
  Data: true,
  Metadata: null,
  Errors: [],
}

// get all
async function GetAllMeals(req, res) {
  const query = req.query
  let meals = JSON.parse(JSON.stringify(Meals))
  console.log('query', query)

  // Apply search filter if provided
  if (query.search) {
    meals = meals.filter((meal) => meal.Name?.toLowerCase().includes(query.search.toLowerCase()))
  }

  // Apply publish status filter if provided
  if (query.isPublish) {
    const publishStatus = query.isPublish === 'true' || query.isPublish === true
    meals = meals.filter((meal) => meal.IsPublish === publishStatus)
    console.log(meals)
  }

  // Get total count before pagination
  // Apply pagination if provided
  const totalCount = meals.length
  if (!query.pageIndex) query.pageIndex = 1
  if (!query.pageSize) query.pageSize = 10

  const startIndex = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
  const endIndex = startIndex + parseInt(query.pageSize)
  const pagination = {
    Count: meals.length,
    Limit: parseInt(query.pageSize),
    Offset: startIndex,
    TotalPages: Math.ceil(totalCount / parseInt(query.pageSize)),
    TotalCount: totalCount,
  }

  meals = meals.slice(startIndex, endIndex)

  try {
    const response = {
      CorrelationId: '1a422d93-1289-40d2-9c0c-b714a01640a6',
      Status: true,
      ProblemDetails: null,
      Data: [...meals],
      Metadata: { ResultSet: pagination },
      Errors: [],
    }

    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ message: 'Error happend', data: null, error: err })
  }
}

// // create
async function CreateMealType(req, res) {
  let body = req.body
  console.log('body', body)
  let meal = {
    Id: Math.random().toString(36).slice(2),
    Name: body.Name,
    Code: Math.random().toString(10).slice(2),
    Sequence: body.IsPublish,
    Priority: body.IsPublish,
    IsPublish: body.IsPublish,
    IsInUse: true,
  }
  try {
    Meals.push(meal)
    let response = { ...Response, Data: body.Name }
    res.status(200).json(response)
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null, error: err })
  }
}

// delete
async function DeleteMealType(req, res) {
  let id = req.params.id
  try {
    let mealIndex = Meals.findIndex((elm) => elm.Id === id)
    Meals.splice(mealIndex, 1)
    console.log('DeleteMealType', req.params, mealIndex, Meals.length)
    res.status(200).json(Response)
  } catch (err) {
    res.status(400).json({ message: 'Error Happened', data: null })
  }
}

// update
async function UpdateMealType(req, res) {
  let data = req.body
  try {
    let meal = Meals.find((elm) => elm.Id === data.Id)
    console.log('UpdateMealType', data, meal)
    const mealIndex = Meals.findIndex((elm) => elm.Id === data.Id)
    Meals[mealIndex] = { ...meal, ...data }
    res.status(200).json(Response)
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null })
  }
}

// publish
async function PublishMealType(req, res) {
  let id = req.params.id
  try {
    Meals.find((elm) => elm.Id === id).IsPublish = true
    res.status(200).json(Response)
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null })
  }
}

// unpublish
async function UnPublishMealType(req, res) {
  let id = req.params.id
  try {
    Meals.find((elm) => elm.Id === id).IsPublish = false
    res.status(200).json(Response)
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null })
  }
}

router.route('/MealType').get(GetAllMeals).post(CreateMealType)
router.route('/MealType/:id').delete(DeleteMealType)
router.route('/MealType/update').put(UpdateMealType)
router.route('/MealType/:id/publish').put(PublishMealType)
router.route('/MealType/:id/unpublish').put(UnPublishMealType)

router.route('/MealCuisines').get(GetAllMeals).post(CreateMealType)
router.route('/MealCuisines/:id').delete(DeleteMealType)
router.route('/MealCuisines/update').put(UpdateMealType)
router.route('/MealCuisines/:id/publish').put(PublishMealType)
router.route('/MealCuisines/:id/unpublish').put(UnPublishMealType)
module.exports = router
