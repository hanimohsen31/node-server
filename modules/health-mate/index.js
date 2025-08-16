const express = require('express')

const router = express.Router()

router.use('/auth', require('./health-mate-users/health-mate-users-routes'))

router.use('/food-list', require('./food-list/food-list-routes'))
router.use('/day-diet', require('./day-diet/day-diet-routes'))
router.use('/meals', require('./meals/meals-routes'))

router.use('/food-tracker', require('./food-tracker/food-tracker-routes'))

module.exports = router
