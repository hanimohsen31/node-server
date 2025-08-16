const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const tourScema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name required'],
      maxLengh: [40, 'Name Max Length 40 chars'],
      minLengh: [10, 'Name Min Length 10 chars'],
      validate: [validator.isAlpha,'isAlpha error'],
      unique: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Min rating is 1'],
      max: [5, 'Max rating is 5'],
    },
    price: {
      type: Number,
      required: [true, 'Tour price required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group Size required'],
    },
    ratingAvrage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this will only work on create and will not work on update
        validator: function (val) {
          return val < this.price
        },
        message: 'Discount price must be less than price',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty wrong',
      },
    },
    discount: Number,
    summury: {
      type: String,
      trim: true,
    },
    discription: {
      type: String,
      trim: true,
    },
    imageCovre: {
      type: String,
      required: [true, 'Image Covre required'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    duration: {
      type: Number,
      required: [true, 'Duration Required'],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// virtual props
tourScema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

// mongoose middleware types => document,query,aggregate,model
// 1- document middleware
// this will only work on create .save() || .create() and will not work on update
tourScema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// 2- query middleware
// /^find/ => findOne || findMany || findAndUpdate ....
tourScema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  next()
})

// 3- aggregate middleware
tourScema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  next()
})

const Tour = mongoose.model('Tour', tourScema)
module.exports = Tour
