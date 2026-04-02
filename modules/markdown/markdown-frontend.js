const express = require('express')
const router = express.Router()
const path = require('path')

// create
async function OpenMarkdownServer(req, res) {
    try {
        console.log("📚 Start Markdown Viewer On:", `http://localhost:5000/`);
        res.sendFile(path.join(angularPath, 'index.html'));
    } catch (err) {
        res.status(418).json({ message: 'Invalid Data', data: null, error: err })
    }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('/markdown').get(OpenMarkdownServer)

module.exports = router
