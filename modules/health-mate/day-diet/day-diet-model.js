const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'healthMate', {})

const dayDietSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    totalCalories: { type: Number, default: 0 },
    totalCarbohydrate: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    meals: [
      {
        mealType: {
          type: String,
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          required: true,
        },
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FoodList',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  {
    collection: 'dayDiet',
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
)

const DayDiet = mainDB.model('DayDiet', dayDietSchema)
mainDB.model('FoodList', require('../food-list/food-list-model').schema) // reuse schema
mainDB.model('User', require('../health-mate-users/health-mate-users-model').schema) // reuse schema
module.exports = DayDiet
