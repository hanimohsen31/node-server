const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const API_KEY = process.env.MISTRAL_API_KEY;

// https://console.mistral.ai/build/playground
async function AskMistral(req, res) {
    let { content, role, instructions } = req.body
    if (!content) return res.status(400).json({ error: "'content' field is required" })
    if (!role) role = "user"
    if (!instructions) instructions = ""
    try {
        const response = await fetch("https://api.mistral.ai/v1/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: "devstral-latest",
                inputs: [{ role, content, }],
                tools: [],
                completion_args: { temperature: 0.7, max_tokens: 2048, top_p: 1 },
                instructions
            })
        });
        const data = await response.json();
        res.status(200).json({ message: 'success', data: data.outputs[0].content })
    } catch (err) {
        ErrorHandler(res, err, 'Error in Getting Response From Mistral', 400, 'gag1')
    }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskMistral)
module.exports = router