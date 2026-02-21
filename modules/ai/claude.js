const Anthropic = require("@anthropic-ai/sdk");
const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const client = new Anthropic({apiKey: process.env.CLAUDE_API_KEY,});

async function AskClaude(req, res) {
    let { role, content } = req.body;
    if (!content) return ErrorHandler(res, null, "'content' field is required", 400, 'gag1')
    if (!role) role = "user"
    try {
        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001", // cheapest
            // model: "claude-sonnet-4-6",      // balanced
            // model: "claude-opus-4-6",        // most powerful
            max_tokens: 1024,
            messages: [{ role, content }],
        });
        res.status(200).json({ message: 'success', data: message.content[0].text })
    } catch (err) {
        ErrorHandler(res, err, 'Error in Getting Response From claude', 400, 'gag1')
    }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').post(AskClaude)
module.exports = router
