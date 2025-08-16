const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'healthMate', {})

const trackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // link to your users collection
      required: [true, 'userId required'],
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodList',
      required: [true, 'foodId required'],
    },
    quantity: {
      type: Number,
      required: [true, 'quantity required'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
  },
  {
    collection: 'tracker',
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id // remove _id
        delete ret.__v // remove __v
      },
    }, // make virtuals show up in JSON
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
      },
    }, // make virtuals show up in objects
  }
)

// Virtual property `id` → returns `_id` as string
trackerSchema.virtual('id').get(function () {
  return this._id.toString()
})

// const Tracker = UserTrackerDB.model('Tracker', trackerSchema)
const Tracker = mainDB.model('Tracker', trackerSchema)
const FoodList = mainDB.model('FoodList', require('../food-list/food-list-model').schema) // reuse schema
const User = mainDB.model('User', require('../health-mate-users/health-mate-users-model').schema) // reuse schema
module.exports = Tracker
