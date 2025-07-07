const axios = require('axios')
const express = require('express')
const router = express.Router()

// Proxy controller function
async function AllHTTPMethodsProxyController(req, res) {
  try {
    // Extract the target URL from the request path
    const fullPath = req.originalUrl
    const prefix = '/tunneling/'
    const targetUrl = fullPath.substring(fullPath.indexOf(prefix) + prefix.length)
    if (!targetUrl) return res.status(400).json({ error: 'Target URL is missing' })
    // Validate the target URL format
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid target URL format' })
    }
    // Forward the request to the .NET server
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.method === 'GET' ? undefined : req.body,
      headers: {
        ...req.headers,
        'host': new URL(targetUrl).host, // Update host header
        'origin': new URL(targetUrl).origin, // Update origin header
        // Remove headers that shouldn't be forwarded
        'accept-encoding': 'identity',
        'content-length': req.headers['content-length'],
      },
      params: req.query,
      responseType: 'stream',
      validateStatus: () => true, // Accept all status codes
    })
    // Forward response headers
    res.status(response.data.res)
    res.status(response.data.response)
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key !== 'content-encoding' && key !== 'transfer-encoding') {
        res.set(key, value)
      }
    })
    // console.log('RESPONDED', response.status)
    // Forward the response body
    response.data.pipe(res)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      details: error.response?.data || null,
    })
  }
}

router.route('*').all(AllHTTPMethodsProxyController)
module.exports = router
