const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
let Collection = JSON.parse(fs.readFileSync(path.join(__dirname, '../dev-data/gym-app/collection.json')))

async function MatchAny(req, res) {
  let method = req.method
  let originalUrl = req.originalUrl.replaceAll('/gym-app/api/v1/', '').replaceAll('api/v1/', '')

  const apiConfig = Collection.filter((api) => api.method.toUpperCase() === method.toUpperCase()).find((api) =>
    originalUrl.startsWith(api.url.replace('{{baseUrl}}/api/v1/', '').replaceAll('/api/v1/', '').split('/')[0].split('?')[0])
  )

  // console.log('originalUrl', originalUrl)
  // console.log('apiConfig', apiConfig)

  if (apiConfig) res.json(apiConfig.expectedResponse)
  else res.status(404).json({ error: 'Endpoint not found' })
}

router.route('*').all(MatchAny)
module.exports = router
