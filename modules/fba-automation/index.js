const express = require('express')
const router = express.Router()

router.use('/amazon', require('./amazon/amazon-routes'))
router.use('/niches', require('./niches/niches-routes'))
router.use('/pinterest', require('./pinterest/pinterest-routes'))

module.exports = router
