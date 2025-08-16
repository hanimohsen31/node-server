const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const AuthDB = mongoose.createConnection(process.env.MONGO_CONNECT_URI + 'identity', {})

const userShcema = new mongoose.Schema(
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
    image: String,
    // ---------------------- password ------------------------------
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
    subscriptionPlan: {
      type: String,
      enum: {
        values: ['plan1', 'plan2', 'plan3', 'plan4'],
        message: 'Plan wrong',
      },
      default: 'plan1',
    },
    activeAccount: {
      type: Boolean,
      default: true,
      select: false,
    },
    modules: Array,
    // ---------------------- password ------------------------------
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'moderator', 'user', 'client', 'capten', 'gym'],
      default: 'user',
    },
    project: {
      type: String,
      enum: ['general', 'onix', 'omra', 'health'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// document middleware
userShcema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  this.confirmPassword = null
  next()
})

userShcema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})

userShcema.pre('save', async function (next) {
  this.modules = ['default']
  next()
})

// schema methods
userShcema.methods.correctPassword = async function (bodyPass, mongoPass) {
  return await bcryptjs.compare(bodyPass, mongoPass)
}

userShcema.methods.changePasswordAfterCreatingToken = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return jwtTimeStamp < changeTime
  }
  return false
}

const User = AuthDB.model('User', userShcema)
module.exports = User
