const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../../utils/ErrorHandler')
const { GoogleGenAI } = require('@google/genai')
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// https://aistudio.google.com/usage?timeRange=last-28-days&project=gen-lang-client-0991593280&tab=rate-limit
const models = [
  // gemini-2.5
  { id: 0, name: 'gemini-2.5-flash', usage: '10k' },
  { id: 1, name: 'gemini-2.5-flash-lite', usage: 'Unlimited' },
  { id: 2, name: 'gemini-2.5-pro', usage: '10k' },
  // gemini-2.0
  { id: 3, name: 'gemini-2.0-flash', usage: 'Unlimited' },
  { id: 4, name: 'gemini-2.0-flash-lite', usage: 'Unlimited' },
  { id: 5, name: 'gemini-2.0-flash-exp', usage: '500' },
  // gemma-3
  { id: 6, name: 'gemma-3-12b', usage: '14.4K' },
  { id: 7, name: 'gemma-3-27b', usage: '14.4K' },
]

async function AskGemini(req, res) {
  let { model, contents } = req.body
  if (!contents) return ErrorHandler(res, null, "'contents' field is required", 400, 'gag1')
  if (!model) model = models[2].name
  try {
    const response = await ai.models.generateContent({ model, contents })
    res.status(200).json({ message: 'success', data: response.text })
  } catch (err) {
    console.log(err)
    ErrorHandler(res, err, 'Error in Getting Response From Gemini', 400, 'gag1')
  }
}

async function ParsingFileWithGemini(req, res) {
  let { model, prompt } = req.body
  const file = req.file // Provided by multer
  console.log(req.body)
  if (!file) return ErrorHandler(res, null, 'File is required', 400, 'gag1')
  if (!model) model = models[2].name
  try {
    const filePart = { inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } }
    const contents = [{ role: 'user', parts: [{ text: prompt || 'Analyze this file.' }, filePart] }]
    const response = await ai.models.generateContent({ model, contents })
    res.status(200).json({ message: 'success', data: response.text() })
  } catch (err) {
    console.log(err)
    ErrorHandler(res, err, 'Error in Getting Response From Gemini', 400, 'gag1')
  }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskGemini)
router.route('/file').post(upload.single('file'), ParsingFileWithGemini)
module.exports = router
