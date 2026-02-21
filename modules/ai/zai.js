const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')

async function AskZAI(req, res) {
    let { role, content } = req.body;
    if (!content) return ErrorHandler(res, null, "'content' field is required", 400, 'gag1')
    if (!role) role = "user"
    try {
        let response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: { 'Accept-Language': 'en-US,en', Authorization: `Bearer ${process.env.ZAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'glm-5',
                messages: [{ role, content }],
                stream: false,
                temperature: 1
            })
        })
        response = await response.json()
        res.status(200).json({ message: 'success', data: response })
    } catch (err) {
        ErrorHandler(res, err, 'Error in Getting Response From ZAI', 400, 'gag1')
    }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskZAI)
module.exports = router
