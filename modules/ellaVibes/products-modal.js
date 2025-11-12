const mongoose = require('mongoose')
const slugify = require('slugify')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    maxLengh: [500, 'Name Max Length 500 chars'],
    minLengh: [5, 'Name Min Length 5 chars'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category required'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Description required'],
  },
  image: {
    type: String,
    required: [true, 'Image Link required'],
  },


  link: {
    type: String,
    required: [true, 'Link of Product required'],
  },
  brand: {
    type: String,
    required: [true, 'Brand required'],
  },
  price: {
    type: Number,
    required: [true, 'Price required'],
  },
})

// mongoose middleware types => document,query,aggregate,model
// 1- document middleware
// this will only work on create .save() || .create() and will not work on update
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product
