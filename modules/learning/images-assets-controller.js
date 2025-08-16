const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const ASSETS_DIR = path.join(__dirname, '../dev-assets')
const sharp = require('sharp')

// Helper function to get base64 encoded image
const getBase64Image = (filePath) => {
  try {
    const fileData = fs.readFileSync(filePath)
    const base64Image = fileData.toString('base64')
    const fileExt = path.extname(filePath).substring(1) // Remove the dot
    return `data:image/${fileExt};base64,${base64Image}`
  } catch (error) {
    console.error('Error processing image:', error)
    return null
  }
}

async function GetImagesAssets(req, res) {
  if (!fs.existsSync(ASSETS_DIR)) {
    res.status(404).json({ message: 'Images dir not found', data: null })
  }
  try {
    fs.readdir(ASSETS_DIR, (err, files) => {
      if (err) return res.status(500).json({ error: 'Failed to read directory' })

      const images = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => ({
          name: file,
          url: `${path.join(ASSETS_DIR, file)}`, // Uses static route
        }))

      res.status(200).json({
        message: 'Success',
        data: { images },
      })
    })
  } catch (err) {
    res.status(418).json({
      message: 'Error Converting Image',
      data: null,
      error: err.message,
    })
  }
}

async function GetImage(req, res) {
  if (!fs.existsSync(ASSETS_DIR)) {
    res.status(404).json({ message: 'Images dir not found', data: null })
  }
  const { filename } = req.params
  const imagePath = path.join(ASSETS_DIR, filename)

  try {
    res.status(200).json({
      message: 'Success',
      data: { image: imagePath },
    })
  } catch (err) {
    res.status(418).json({
      message: 'Error Converting Image',
      data: null,
      error: err.message,
    })
  }
}

// API endpoint to get all images as base64
async function GetBase64Image(req, res) {
  fs.readdir(ASSETS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' })
    }

    const imagePromises = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => {
        return new Promise((resolve) => {
          const filePath = path.join(ASSETS_DIR, file)
          const base64 = getBase64Image(filePath)
          resolve({
            name: file,
            src: base64,
          })
        })
      })

    Promise.all(imagePromises)
      .then((images) => res.json(images.filter((img) => img.data !== null)))
      .catch((error) => res.status(500).json({ error: 'Error processing images' }))
  })
}

router.get('', GetImagesAssets)
router.get('/base64', GetBase64Image)
router.get('/assets/:filename', GetImage)
module.exports = router
