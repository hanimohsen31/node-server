const mongoose = require('mongoose')
const HealthMateDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'healthMate', {})

const foodListSchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: [true, 'English name required'],
      trim: true,
    },
    nameAr: {
      type: String,
      required: [true, 'Tour name required'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Calories required'],
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrates required'],
    },
    fat: {
      type: Number,
      required: [true, 'Fat required'],
    },
    protein: {
      type: Number,
      required: [true, 'Protein required'],
    },
    serve: {
      type: Number,
      required: [true, 'Serve required'],
    },
    unit: {
      type: String,
      enum: ['gm', 'pcs', 'ml'],
      required: [true, 'Unit required'],
    },
    description: String,
    image: String,
  },
  {
    collection: 'foodList',
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
      },
    },
  }
)

// Virtual property `id` → returns `_id` as string
foodListSchema.virtual('id').get(function () {
  return this._id.toString()
})

const FoodList = HealthMateDB.model('FoodList', foodListSchema)
module.exports = FoodList
