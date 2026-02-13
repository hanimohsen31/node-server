const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const sharp = require('sharp')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadDir = path.join('/tmp', 'uploads')
const upload = multer({ dest: uploadDir }) // update
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
upload.array('images', 10)

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
// Function to process the images: convert to JPEG, compress, and resize
async function ConvertImageToJPEG(req, res) {
  try {
    const file = req.files[0]
    if (!file) return res.status(400).json({ message: 'No file uploaded', data: null })
    const buffer = await sharp(file.path)
      .resize(1000, 1000, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer()
    const base64Image = buffer.toString('base64')
    res.status(200).json({
      message: 'Image Converted Successfully',
      data: { image: `data:image/jpeg;base64,${base64Image}` },
    })
  } catch (err) {
    res.status(418).json({
      message: 'Error Converting Image',
      data: null,
      error: err.message,
    })
  }
}

// -------------------------------- create collage --------------------------------
async function CreateCollage(req, res) {
  try {
    const files = req.files // Uploaded files
    // Validate files
    if (!files || files.length < 1) return res.status(400).json({ message: 'No images uploaded', data: null })
    // Collage options
    const options = {
      rows: 2,
      cols: 2,
      width: 500,
      height: 500,
      spacing: 0,
      bgColor: { r: 255, g: 255, b: 255, alpha: 1 },
    }

    const { rows, cols, width, height, spacing, bgColor } = options
    const collageWidth = cols * width + (cols - 1) * spacing
    const collageHeight = rows * height + (rows - 1) * spacing

    // Create a blank canvas
    const canvas = sharp({
      create: {
        width: collageWidth,
        height: collageHeight,
        channels: 4,
        background: bgColor,
      },
    })

    const compositeOperations = []
    // Prepare images for compositing
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const x = (i % cols) * (width + spacing)
      const y = Math.floor(i / cols) * (height + spacing)
      compositeOperations.push({
        input: await sharp(file.path).resize(width, height).toBuffer(),
        top: y,
        left: x,
      })
    }

    // Generate the collage
    const resultBuffer = await canvas.composite(compositeOperations).jpeg().toBuffer()

    // Cleanup uploaded files
    // files.forEach((file) => fs.unlinkSync(file.path))

    res.status(200).json({
      message: 'Collage Created Successfully',
      data: { image: `data:image/jpeg;base64,${resultBuffer.toString('base64')}` },
    })
  } catch (err) {
    res.status(418).json({
      message: 'Error Creating Collage',
      data: null,
      error: err.message,
    })
  }
}

router.post('/convertOne', upload.array('images', 1), ConvertImageToJPEG)
router.post('/collage', upload.array('images', 10), CreateCollage)
module.exports = router
