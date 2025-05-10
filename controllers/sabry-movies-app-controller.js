const express = require('express')
const router = express.Router()

async function Signup(req, res) {
  res.status(200).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: (Math.random() * 1000_000).toFixed(),
      username: req.body.username,
      email: req.body.email,
      createdAt: '2025-05-10T09:14:58.277Z',
    },
  })
}

async function Login(req, res) {
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: (Math.random() * 1000_000).toFixed(),
      username: req.body.username,
      email: req.body.username + 'gmail.com',
      createdAt: '2025-04-21T15:35:40.274Z',
    },
  })
}

router.post('/auth/signup', Signup)
router.post('/auth/login', Login)
module.exports = router
