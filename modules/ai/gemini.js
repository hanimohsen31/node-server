const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const { GoogleGenAI } = require("@google/genai");
const API_KEY = 'AIzaSyDauiMlfEQHG-9xopSNtFUM_9W6zrUtuAM'
const ai = new GoogleGenAI({ apiKey: API_KEY });
// https://aistudio.google.com/usage?timeRange=last-28-days&project=gen-lang-client-0991593280&tab=rate-limit
const models = [
  // gemini-2.5
  { id: 0, name: "gemini-2.5-flash", usage: "10k" },
  { id: 1, name: "gemini-2.5-flash-lite", usage: "Unlimited" },
  { id: 2, name: "gemini-2.5-pro", usage: "10k" },
  // gemini-2.0
  { id: 3, name: "gemini-2.0-flash", usage: "Unlimited" },
  { id: 4, name: "gemini-2.0-flash-lite", usage: "Unlimited" },
  { id: 5, name: "gemini-2.0-flash-exp", usage: "500" },
  // gemma-3
  { id: 6, name: "gemma-3-12b", usage: "14.4K" },
  { id: 7, name: "gemma-3-27b", usage: "14.4K" },
];

async function AskGemini(req, res) {
  let { model, contents } = req.body;
  if (!contents) return ErrorHandler(res, null, "'contents' field is required", 400, 'gag1')
  if (!model) model = models[0].name
  try {
    const response = await ai.models.generateContent({ model, contents, });
    res.status(200).json({ message: 'success', data: response.text })
  } catch (err) {
    ErrorHandler(res, err, 'Error in Getting Response From Gemini', 400, 'gag1')
  }
}


// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskGemini)
module.exports = router