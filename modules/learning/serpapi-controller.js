const express = require('express')
const router = express.Router()
const fetch = require('node-fetch') // Ensure you have node-fetch installed

async function GetTrending(req, res) {
  try {
    const url =
      'https://serpapi.com/search.json?engine=google_trends_trending_now&api_key=27b8b34a7e0bc6a18dcd30b0f8d5c158ee79fc828875a11ee151a367f3734ce6&geo=US&async=true'

    const response = await fetch(url)

    // Check if the response is OK (status 200–299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const Trends = await response.json() // Parse the response body as JSON

    res.status(200).json({ message: 'Trends fetched successfully', data: Trends })
  } catch (err) {
    console.error('Error fetching trends:', err.message)
    res.status(500).json({
      message: 'Error fetching trends',
      data: null,
      error: err.message, // Return error message for debugging
    })
  }
}

router.route('').get(GetTrending)
module.exports = router
