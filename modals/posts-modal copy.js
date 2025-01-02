const mongoose = require('mongoose')
const slugify = require('slugify')

const postsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title required'],
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
  thumbnail: {
    type: String,
    required: [true, 'Image Link required'],
  },
  postImage: {
    type: String,
    required: [true, 'Image Link required'],
  },
  content: {
    type: String,
    required: [true, 'Content required'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Description required'],
  },
  author: {
    type: String,
    trim: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now(),
  },
  tags: [String],
})

// 1- document middleware
// this will only work on create .save() || .create() and will not work on update
postsSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true })
  next()
})

const Post = mongoose.model('Post', postsSchema)
module.exports = Post
