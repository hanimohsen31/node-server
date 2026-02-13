const mongoose = require('mongoose')
const bloggingSchema = new mongoose.Schema({}, { strict: false })
const Blogging = mongoose.model('Blogging', bloggingSchema)
module.exports = Blogging
