const mongoose = require('mongoose')

function GenericSchema(schemaObject = {}, collectionName = undefined, strictMode = false) {
  return new mongoose.Schema(schemaObject, {
    strict: strictMode,
    collection: collectionName,
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
  })
}

module.exports = GenericSchema
