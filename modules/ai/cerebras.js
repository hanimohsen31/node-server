const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const models = {
    "gpt-oss-120b": {
        // max_completion_tokens: 1024,
        "model": "gpt-oss-120b",
        "stream": false,
        "max_tokens": 32768,
        "temperature": 1,
        "top_p": 1,
        "reasoning_effort": "medium",
    },
    "zai-glm-4.7": {
        // max_completion_tokens: 1024,
        "model": "zai-glm-4.7",
        "stream": false,
        "max_tokens": 65000,
        "temperature": 1,
        "top_p": 0.95,
    },
    "llama3.1-8b": {
        // max_completion_tokens: 1024,
        "model": "llama3.1-8b",
        "stream": false,
        "max_tokens": 2048,
        "temperature": 0.2,
        "top_p": 1,
    },
    "qwen-3-235b-a22b-instruct-2507": {
        // max_completion_tokens: 1024,
        "model": "qwen-3-235b-a22b-instruct-2507",
        "stream": false,
        "max_tokens": 20000,
        "temperature": 0.7,
        "top_p": 0.8,
    }
}

// https://cloud.cerebras.ai/
async function AskCerebras(req, res) {
    let { model, content, role } = req.body
    if (!content) return res.status(400).json({ error: "'content' field is required" })
    if (!model) model = models["gpt-oss-120b"]
    if (!role) role = "user"
    const API_KEY = process.env.CEREBRAS_API_KEY
    try {
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ ...model, messages: [{ role, content: content }] })
        });
        const data = await response.json();
        res.status(200).json({ message: 'success', data: data.choices[0].message })
    } catch (err) {
        ErrorHandler(res, err, 'Error in Getting Response From Cerebras', 400, 'gag1')
    }
}


// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskCerebras)
module.exports = router