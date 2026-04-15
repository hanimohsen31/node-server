const mongoose = require('mongoose')
const CarsDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'dawarsah', {})

// 📦 Schema
const carSchema = new mongoose.Schema(
  {
    titleAr: { type: String, required: true },
    titleEn: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    year: { type: Number, required: true, index: true },
    price: { type: Number, required: true, index: true },
    currency: { type: String, default: 'EGP' },
    condition: {
      type: String,
      enum: ['fabrikaInAndOut', 'fabrikaIn', 'notFabrika', 'accident'],
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
      index: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'dual_clutch'],
      index: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'electric', 'hybrid'],
      index: true,
    },
    mileage: { type: Number, index: true },
    color: String,
    city: { type: String, index: true },
    description: String,
    features: [String],
    mainImage: { type: String, required: true },
    images: [String],
    videos: [String],
    pdfUrl: { type: String },
    seller: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      isDealer: { type: Boolean, default: false },
    },
    // 🛠️ تحكم الأدمن
    slug: { type: String, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isApproved: { type: Boolean, default: true },
  },
  {
    timestamps: true, // createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

carSchema.pre('save', function (next) {
  this.images = this.images.filter((img) => img.url !== this.mainImage)
  if (!this.slug) {
    const base = this.titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    const suffix = this._id.toString().slice(-6)
    this.slug = `${base}-${suffix}`
  }
  next()
})

const Car = CarsDB.model('Car', carSchema)
module.exports = Car
