const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')

const userScema = new mongoose.Schema(
  {
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
    image: {
      type: String,
      default: 'public/images/user.webp',
    },
    // password
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
    // Subscription
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    subscriptionActive: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: {
        values: ['plan1', 'plan2', 'plan3'],
        message: 'Plan wrong',
      },
      default: 'plan1',
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    passwordResetToken: String,
    PasswordResetExpiration: Date,
    activeAccount: {
      type: Boolean,
      default: true,
      select: false,
    },
    modules: Array,
    project: {
      type: String,
      enum: ['general', 'onix', 'omra'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// document middleware
userScema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  this.confirmPassword = null
  next()
})

userScema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})

userScema.pre('save', async function (next) {
  this.modules = ['default']
  next()
})

// schema methods
userScema.methods.correctPassword = async function (bodyPass, mongoPass) {
  return await bcryptjs.compare(bodyPass, mongoPass)
}

userScema.methods.changePasswordAfterCreatingToken = function (jwtTimeStamp) {
  // console.log(this.passwordChangedAt)
  if (this.passwordChangedAt) {
    const changeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    // console.log(jwtTimeStamp, changeTime)
    return jwtTimeStamp < changeTime
  }
  return false
}

const User = mongoose.model('User', userScema)
module.exports = User
