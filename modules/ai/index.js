const express = require('express')
const router = express.Router()

router.use('/gemini', require('./gemini'))
router.use('/cerebras', require('./cerebras'))
router.use('/groq', require('./groq'))
router.use('/mistral', require('./mistral'))

module.exports = router
