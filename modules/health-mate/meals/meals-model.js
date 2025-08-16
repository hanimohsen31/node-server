const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'healthMate', {})

// Subdocument schema for meal items
const mealItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodList',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  }
  // { _id: false } // no separate _id for subdocuments
)

// Main meals schema
const mealSchema = new mongoose.Schema(
  {
    meals: {
      type: [mealItemSchema],
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
  },
  {
    collection: 'meals',
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

// Register virtual id
mealSchema.virtual('id').get(function () {
  return this._id.toString()
})

// Register FoodList model (reusing schema)
mainDB.model('FoodList', require('../food-list/food-list-model').schema)

const Meals = mainDB.model('Meals', mealSchema)

module.exports = {
  Meals,
  mealItemSchema,
  mealSchema,
}
