const express = require('express')
const router = express.Router()

router.use('/', require('./markdown-routes-v1'))
router.use('/v3', require('./markdown-routes-v3'))

module.exports = router
