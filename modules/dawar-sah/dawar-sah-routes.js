const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Car = require('./dawar-sah-model')
const ProtectedRoute = require('../../utils/ProtectedRoute')
const ErrorHandler = require('../../utils/ErrorHandler')

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// =========================
// ➕ CREATE (إضافة عربية)
// =========================
const CreateCar = async (req, res) => {
  try {
    const car = await Car.create(req.body)
    res.status(201).json({ status: 201, data: car })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return ErrorHandler(res, err, err.message, 400, 'car_create_validation')
    }
    ErrorHandler(res, err, 'Failed to create car', 500, 'car_create_error')
  }
}

// =========================
// 📖 GET ALL + FILTER + PAGINATION
// =========================
const GetCars = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice,
      brand,
      model,
      year,
      category,
      condition,
      status,
      transmission,
      fuelType,
      city,
      search,
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))

    const allowedSortFields = ['createdAt', 'price', 'year', 'mileage']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

    const filter = { isActive: true, isApproved: true }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (brand) filter.brand = brand
    if (model) filter.model = model
    if (year) filter.year = Number(year)
    if (category) filter.category = category
    if (condition) filter.condition = condition
    if (status) filter.status = status
    if (transmission) filter.transmission = transmission
    if (fuelType) filter.fuelType = fuelType
    if (city) filter.city = city

    if (search) {
      filter.$or = [
        { titleAr: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ]
    }

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .sort({ [sortField]: order === 'asc' ? 1 : -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Car.countDocuments(filter),
    ])

    res.json({
      status: 200,
      data: cars,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to fetch cars', 500, 'car_get_all_error')
  }
}

// =========================
// 📖 GET ONE
// =========================
const GetCarById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return ErrorHandler(res, null, 'Invalid car ID', 400, 'car_invalid_id')
    }

    const car = await Car.findById(req.params.id)

    if (!car || !car.isActive) {
      return ErrorHandler(res, null, 'Car not found', 404, 'car_not_found')
    }

    res.json({ status: 200, data: car })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to fetch car', 500, 'car_get_one_error')
  }
}

// =========================
// 📖 GET ONE BY SLUG
// =========================
const GetCarBySlug = async (req, res) => {
  try {
    const car = await Car.findOne({ slug: req.params.slug, isActive: true })

    if (!car) {
      return ErrorHandler(res, null, 'Car not found', 404, 'car_not_found')
    }

    res.json({ status: 200, data: car })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to fetch car', 500, 'car_get_slug_error')
  }
}

// =========================
// ✏️ UPDATE
// =========================
const UpdateCar = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return ErrorHandler(res, null, 'Invalid car ID', 400, 'car_invalid_id')
    }

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    )

    if (!car) {
      return ErrorHandler(res, null, 'Car not found', 404, 'car_not_found')
    }

    res.json({ status: 200, data: car })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return ErrorHandler(res, err, err.message, 400, 'car_update_validation')
    }
    ErrorHandler(res, err, 'Failed to update car', 500, 'car_update_error')
  }
}

// =========================
// ❌ SOFT DELETE (إخفاء)
// =========================
const DeleteCar = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return ErrorHandler(res, null, 'Invalid car ID', 400, 'car_invalid_id')
    }

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    )

    if (!car) {
      return ErrorHandler(res, null, 'Car not found or already hidden', 404, 'car_not_found')
    }

    res.json({ status: 200, message: 'Car hidden successfully' })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to hide car', 500, 'car_delete_error')
  }
}

// =========================
// 🔥 HARD DELETE (اختياري)
// =========================
const HardDeleteCar = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return ErrorHandler(res, null, 'Invalid car ID', 400, 'car_invalid_id')
    }

    const car = await Car.findByIdAndDelete(req.params.id)

    if (!car) {
      return ErrorHandler(res, null, 'Car not found', 404, 'car_not_found')
    }

    res.json({ status: 200, message: 'Car deleted permanently' })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to permanently delete car', 500, 'car_hard_delete_error')
  }
}

// =========================
// 🎛️ GET FILTERS (للـ UI)
// =========================
const GetFilters = async (_req, res) => {
  try {
    const activeFilter = { isActive: true, isApproved: true }

    const [brands, models, years, cities, priceRange] = await Promise.all([
      Car.distinct('brand', activeFilter),
      Car.distinct('model', activeFilter),
      Car.distinct('year', activeFilter),
      Car.distinct('city', activeFilter),
      Car.aggregate([
        { $match: activeFilter },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
        { $project: { _id: 0, min: 1, max: 1 } },
      ]),
    ])

    res.json({
      status: 200,
      data: {
        // dynamic — from DB
        brands: brands.sort(),
        models: models.sort(),
        years: years.sort((a, b) => b - a),
        cities: cities.sort(),
        priceRange: priceRange[0] ?? { min: 0, max: 0 },
        // static — from schema enums
        categories: ['used', 'new', 'accident'],
        conditions: ['factory_full', 'factory_in_out', 'factory_out', 'clean_paint', 'accident'],
        statuses: ['available', 'reserved', 'inspection', 'viewing_booked', 'sold'],
        transmissions: ['manual', 'automatic', 'cvt', 'dual_clutch'],
        fuelTypes: ['petrol', 'diesel', 'electric', 'hybrid'],
      },
    })
  } catch (err) {
    ErrorHandler(res, err, 'Failed to fetch filters', 500, 'car_filters_error')
  }
}

// --------------------------  ROUTES  ----------------------------------------------------------------
router.route('/').get(GetCars).post(CreateCar)
router.get('/filters', GetFilters)
router.get('/slug/:slug', GetCarBySlug)
router.route('/:id').get(GetCarById).put(ProtectedRoute, UpdateCar).delete(ProtectedRoute, DeleteCar)
router.route('/:id/permanent').delete(ProtectedRoute, HardDeleteCar)

module.exports = router
