const axios = require('axios')
const fs = require('fs')
const SYSTEM_PROMPT = (optimizedPayload) => `You are an expert automotive analyst specializing in the Egyptian used car market.
Analyze the following car data and provide a professional evaluation.

### INPUT:
${optimizedPayload}

### TASK:
1. Evaluate the car condition based on mechanical state, paint, and notes.
2. Compare the car price against the market range.
3. Detect any red flags or costly future repairs.
4. Estimate a fair market value range.
5. Give a final verdict: (Good Deal / Fair Deal / Bad Deal).
6. Provide a summary in Arabic in the output object.
7. mileage above 200,000 km is a negative factor.
8. Don't Accept any car if it has interior damage/Body Damage/Engine Damage very negative factor.

### RULES:
- Be strict and realistic (no optimism bias).
- Consider Egyptian market behavior.
- Penalize heavily for engine replacements, structural repairs, or full repaint.
- Mileage above 200,000 km is a negative factor.
- If data is missing, state assumptions clearly.
- Be concise and direct.
- Don't Accept any car if it has interior damage/Body Damage/Engine Damage very negative factor.
- Be STRICTED TO JSON OUTPUT ONLY.
- RESPOND WITH VALID JSON ONLY NOT MARKDOWN.

### OUTPUT FORMAT (JSON Strict), Always respond with valid JSON only — no explanation, no markdown, no code fences:
{
  "conditionScore": number (0-10),
  "priceEvaluation": "Underpriced" | "Fair" | "Overpriced",
  "estimatedFairPrice": { "min": number, "max": number },
  "riskLevel": "Low" | "Medium" | "High",
  "mainIssues": string[],
  "positivePoints": string[],
  "finalVerdict": "Good Deal" | "Fair Deal" | "Bad Deal",
  "summary": string (short, direct conclusion And in Arabic),
}
`

async function compareResults(finalPayload) {
  const reviewdCar = finalPayload.aiData
  const facebookListing = (finalPayload?.facebook?.filterdData || []).map((elm) => `title: ${elm.title}, ${elm.imageAlt} - Price: ${elm.price} in EGP`).join('\n')
  const hatla2eeTable = (finalPayload?.hatla2ee?.usedPricesTable?.data || []).map((elm) => `Model: ${elm.modelArabic} - avgPrice: ${elm.avgPrice} - minPrice: ${elm.minPrice} - maxPrice: ${elm.maxPrice} - Prices in EGP`).join('\n')
  const hatla2eeListing = (finalPayload?.hatla2ee?.listings?.data || []).map((elm) => `title: ${elm.title} - year: ${elm.year} - mileage: ${elm.mileage} - transmission: ${elm.transmission} - price: ${elm.price} - Prices in EGP`).join('\n')
  let textFinal = `The Car Details Iam into buy in json format: \n ${JSON.stringify(reviewdCar)}
---------
and here is some market data:
Facebook Market Listing: \n${facebookListing? facebookListing : 'No Data'}
---------
Hatla2ee Market Table: \n${hatla2eeTable? hatla2eeTable : 'No Data'}
---------
Hatla2ee Market Listing: \n${hatla2eeListing? hatla2eeListing : 'No Data'}`
  textFinal = SYSTEM_PROMPT(textFinal)
  try {
    let result = await sendCompareResultToAI(textFinal)
    return { result, finalPrompt: textFinal }
  } catch (e) {
    console.log(e)
    return { result: null, finalPrompt: textFinal }
  }
}

async function sendCompareResultToAI(content) {
  let url = `http://127.0.0.1:5000/ai/cerebras`
  try {
    const response = await axios.post(url, { content })
    const raw = response.data.data.content
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

module.exports = compareResults
