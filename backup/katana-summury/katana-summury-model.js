const mongoose = require('mongoose')
const mainDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'backend', {})
const genericSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    runId: { type: String, required: true, unique: true },
    fileType: { type: String, enum: ['html'], required: true },
    content: { type: Buffer, required: true }, // store raw file content
  },
  {
    strict: false,
    collection: 'katanaSummuries',
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

const KatanaSummuries = mainDB.model('KatanaSummuries', genericSchema)
module.exports = KatanaSummuries
