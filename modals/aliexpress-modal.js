const mongoose = require('mongoose')
const aliExpressSchema = new mongoose.Schema({}, { strict: false })
const AliExpress = mongoose.model('AliExpress', aliExpressSchema)
module.exports = AliExpress
