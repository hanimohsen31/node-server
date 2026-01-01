const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'telegramBot', {})
const genericSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: 'amaraBot',
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
const AmaraBot = mainDB.model('amaraBot', genericSchema)
module.exports = AmaraBot
