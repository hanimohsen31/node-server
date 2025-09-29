const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'backend', {})
const genericSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: 'katanaTracker',
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.updatedAt
        delete ret.__v
      },
    },
    toObject: {
      virtuals: true,
    },
  }
)

const KatanaTracker = mainDB.model('katanaTracker', genericSchema)
module.exports = KatanaTracker
