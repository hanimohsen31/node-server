const express = require('express')
const router = express.Router()
const ErrorHandler = require('../utils/ErrorHandler')
const sharp = require('sharp')
// Configure multer for file uploads

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
async function CreateCollage(req, res) {
  try {
    const files = req.files // Uploaded files

    // Validate files
    if (!files || files.length < 1) {
      return res.status(400).json({ message: 'No images uploaded', data: null })
    }

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
    const resultBuffer = await canvas.composite(compositeOperations).png().toBuffer()

    // Cleanup uploaded files
    // files.forEach((file) => fs.unlinkSync(file.path))

    // Send the resulting collage as a response
    res.status(200).json({
      message: 'Collage Created Successfully',
      data: {
        image: `data:image/png;base64,${resultBuffer.toString('base64')}`,
      },
    })
  } catch (err) {
    res.status(418).json({
      message: 'Error Creating Collage',
      data: null,
      error: err.message,
    })
  }
}

router.post('', CreateCollage)
module.exports = router
