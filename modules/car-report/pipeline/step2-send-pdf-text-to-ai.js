const axios = require('axios')
const Hatla2eeBaseData = require('../utils/hatla2ee-lists')
const SYSTEM_PROMPT = `You are a car inspection report parser.
You receive Arabic car report text and extract structured data from it.
Always respond with valid JSON only — no explanation, no markdown, no code fences.
ANY INVALID JSON RESPONSE WILL BE CRASH MY SERVER.
Extract these fields (use null if not found) Response RISTRICTED TO JSON OUTPUT ONLY:
{
  "makeArabic": string,
  "makeEnglish": string,
  "modelArabic": string,
  "modelEnglish": string,
  "year": number,
  "transmission": string,
  "mileage": number,
  "price": number,
  "licenseExpiry": string,
  "trafficDepartment": string,
  "interiorCondition": string,
  "exteriorPaint": string,
  "engineCondition": string,
  "gearboxCondition": string,
  "suspensionCondition": string,
  "acCondition": string,
  "tiresCondition": string,
  "notes": string[]
}

And here is the text:
`

async function sendPdfTextToAI(cleanText) {
  let models = Object.keys(Hatla2eeBaseData).map((x) => Hatla2eeBaseData[x])
  let url = `http://127.0.0.1:5000/ai/cerebras`
  let content = SYSTEM_PROMPT + cleanText + '\n' + `here is some brands and models from some market website to match input with\n` + `brands` + JSON.stringify(Object.keys(Hatla2eeBaseData)) + `\n` + `models` + JSON.stringify(models.flat()) + `\n`
  try {
    const response = await axios.post(url, { content })
    const raw = response.data.data.content
    console.log('raw of ai response', raw)
    try {
      return JSON.parse(raw)
    } catch {
      try {
        const stripped = raw
          ?.replace(/^```(?:json)?\s*/i, '')
          ?.replace(/\s*```$/, '')
          ?.trim()
        return JSON.parse(stripped)
      } catch {
        return raw
      }
    }
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = sendPdfTextToAI
