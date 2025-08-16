const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const AuthDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'healthMate', {})

const userShcema = new mongoose.Schema(
  {
    // ---------------------- Basic Info ------------------------------
    username: {
      type: String,
      required: [true, 'User name required'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      validate: [validator.isEmail, 'Email is not correct'],
      lowercase: true,
      unique: true,
      trim: true,
    },
    image: String,

    // ---------------------- Security ------------------------------
    password: {
      type: String,
      required: [true, 'Password required'],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirm Password required'],
      validate: {
        // this will only work on create and will not work on update
        validator: function (val) {
          return val === this.password
        },
        message: 'Confirm password not match',
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    PasswordResetExpiration: Date,

    // ---------------------- Subscription --------------------------
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    subscriptionActive: {
      type: Boolean,
      default: false,
    },

    // ---------------------- Account Status ------------------------
    activeAccount: {
      type: Boolean,
      default: true,
      select: false,
    },

    role: {
      type: String,
      // enum: ['superAdmin', 'admin', 'moderator', 'user', 'client', 'capten', 'gym'],
      enum: ['gym', 'trainer', 'trainee'],
      default: 'user',
    },
    project: {
      type: String,
      default: 'healthMate',
    },
    // ---------------------- Health & Fitness Data -----------------
    dateOfBirth: {
      required: [true, 'Date of Birth required'],
      type: String,
    },
    gender: {
      required: [true, 'Gender required'],
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      value: {
        required: [true, 'Height value required'],
        type: Number,
        min: [0, 'Height must be positive'],
      },
      unit: {
        required: [true, 'Height unit required'],
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    weight: {
      value: {
        required: [true, 'Weight value required'],
        type: Number,
        min: [0, 'Weight must be positive'],
      },
      unit: {
        required: [true, 'Weight unit required'],
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg',
      },
    },
    activityLevel: {
      required: [true, 'Activity Level required'],
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very active'],
    },
    fitnessGoals: {
      required: [true, 'Fitness Goals required'],
      type: [String],
      enum: ['weight loss', 'muscle gain', 'maintenance', 'endurance', 'flexibility'],
    },
  },
  {
    collection: 'healtMateUsers', // ← This controls the collection name
    timestamps: true, // adds createdAt & updatedAt automatically

    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
        delete ret.confirmPassword
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
        delete ret.confirmPassword
      },
    },
  }
)

// ---------------------- Virtual ---------------------------------------------
// Virtual property `id` → returns `_id` as string
userShcema.virtual('id').get(function () {
  return this._id.toString()
})

// document middleware
// ---------------------- Password Hash Middleware ----------------------------
userShcema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  this.confirmPassword = undefined
  next()
})

// ---------------------- Check Password Method -------------------------------
userShcema.methods.correctPassword = async function (bodyPass, mongoPass) {
  return await bcryptjs.compare(bodyPass, mongoPass)
}

// ---------------------- Password Changed After Token ------------------------
userShcema.methods.changePasswordAfterCreatingToken = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return jwtTimeStamp < changeTime
  }
  return false
}

const User = AuthDB.model('User', userShcema)
module.exports = User
