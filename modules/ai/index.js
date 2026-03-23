const express = require('express')
const router = express.Router()

router.use('/gemini', require('./models/gemini'))
router.use('/cerebras', require('./models/cerebras'))
router.use('/groq', require('./models/groq'))
router.use('/mistral', require('./models/mistral'))
router.use('/zai', require('./models/zai'))
router.use('/claude', require('./models/claude'))

module.exports = router
