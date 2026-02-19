const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const API_KEY = process.env.GROQ_API_KEY;
async function AskGroq(req, res) {
    let { content, role } = req.body
    if (!content) return res.status(400).json({ error: "'content' field is required" })
    if (!role) role = "user"
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({
                messages: [{ role, content }],
                model: "openai/gpt-oss-120b",
                temperature: 1,
                max_completion_tokens: 8192,
                top_p: 1,
                stream: false,
                reasoning_effort: "medium",
                stop: null
            })
        });
        console.log(response);
        const data = await response.json(); // because stream=true
        res.status(200).json({ message: 'success', data: data.choices[0].message })
    } catch (err) {
        ErrorHandler(res, err, 'Error in Getting Response From Groq', 400, 'gag1')
    }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskGroq)
module.exports = router