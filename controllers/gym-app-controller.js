const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
let Collection = JSON.parse(fs.readFileSync(path.join(__dirname, '../dev-data/gym-app/collection.json')))

// Alternative more robust version with better parameter extraction
async function MatchAnyAdvanced(req, res) {
  let method = req.method
  let originalUrl = req.originalUrl
  let normalizedOriginalUrl = originalUrl
    .replace(/^\/gym-app\/api\/v1\//, '')
    .replace(/^\/api\/v1\//, '')
    .replace(/^api\/v1\//, '')
  // Split URL and query parameters
  let [originalPath, originalQuery] = normalizedOriginalUrl.split('?')
  // console.log('Original URL:', originalUrl)
  // console.log('Normalized path:', originalPath)
  // console.log('Method:', method)
  const apiConfig = Collection.filter((api) => api.method.toUpperCase() === method.toUpperCase()).find((api) => {
    // Extract path from API URL template
    let apiUrl = api.url.replace('{{baseUrl}}/api/v1/', '')
    let [apiPath, apiQuery] = apiUrl.split('?')
    // console.log('Comparing with API path:', apiPath)
    // Check if paths match and extract parameters
    const matchResult = matchPathWithParams(originalPath, apiPath)
    if (matchResult.matches) {
      // console.log('✓ Path matched:', apiPath)
      // console.log('✓ Extracted params:', matchResult.params)
      return true
    }
    return false
  })
  if (apiConfig) {
    // console.log('Found matching API config:', apiConfig.name)
    res.json(apiConfig.expectedResponse)
  } else {
    // console.log('No matching endpoint found')
    res.status(404).json({ error: 'Endpoint not found' })
  }
}

router.route('*').all(MatchAnyAdvanced)
module.exports = router

// helper
function matchPathWithParams(requestPath, apiPath) {
  // Split paths into segments
  const requestSegments = requestPath.split('/').filter((segment) => segment.length > 0)
  const apiSegments = apiPath.split('/').filter((segment) => segment.length > 0)
  // If different number of segments, they don't match
  if (requestSegments.length !== apiSegments.length) {
    return { matches: false, params: {} }
  }
  const params = {}
  // Compare each segment
  for (let i = 0; i < requestSegments.length; i++) {
    const requestSegment = requestSegments[i]
    const apiSegment = apiSegments[i]
    // If API segment starts with :, it's a parameter
    if (apiSegment.startsWith(':')) {
      const paramName = apiSegment.substring(1) // Remove the :
      params[paramName] = requestSegment
      continue
    }
    // If segments don't match exactly, paths don't match
    if (requestSegment !== apiSegment) {
      return { matches: false, params: {} }
    }
  }
  return { matches: true, params }
}
