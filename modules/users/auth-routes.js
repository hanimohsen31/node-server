const crypto = require('crypto')
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('./auth-model')
const SendEmail = require('../../utils/SendEmail')
const ErrorHandler = require('../../utils/ErrorHandler')
const ProtectedRoute = require('./ProtectedRoute')
const router = express.Router()

function createToken(userData) {
  try {
    let payload = {
      id: userData._id,
      username: userData?.fullName,
      role: userData?.role,
      modules: userData?.modules,
      subscriptionActive: userData?.subscriptionActive,
    }
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: process.env.EXPIRATION })
    return token
  } catch (err) {
    // console.log('roken func err', err)
    return null
  }
}

// Signup
async function Signup(req, res) {
  let body = req.body
  // console.log('body', body)
  try {
    let newUser = await User.create({
      username: body.username.toLowerCase(),
      fullName: body.fullName,
      image: body.image,
      email: body.email.toLowerCase(),
      password: body.password,
      confirmPassword: body.confirmPassword,
      project: body?.project,
    })
    const token = createToken(newUser)
    // console.log('token', token)
    // send cookie
    // res.cookie('jwt', token, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), secure: true, httpOnly: true })
    res.status(201).json({ message: 'User Created', token })
  } catch (err) {
    ErrorHandler(res, err, 'Invalid user data', 400, 'su1')
  }
}

// Login
async function Login(req, res) {
  let { email, password } = req.body
  try {
    if (!email || !password) return ErrorHandler(res, null, 'email and password are required', 418, 'li1')

    let user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) return ErrorHandler(res, null, 'User not found', 404, 'li2')

    let isPasswordMatching = await user.correctPassword(password, user.password)
    if (!isPasswordMatching) return ErrorHandler(res, null, 'Password is not correct', 401, 'li3')
    const token = createToken(user)
    res.status(200).json({ message: 'User Logged in', token })
  } catch (err) {
    ErrorHandler(res, err, 'Invalid user data', 400, 'li2')
  }
}

// check auth
async function CheckAuth(req, res) {
  let token = req.headers?.authorization?.replace('Bearer ', '')

  try {
    if (!token) return ErrorHandler(res, null, 'no token found', 400, 'ca1')

    let decoded = ''
    try {
      decoded = await jwt.verify(token, process.env.JWT_KEY)
      // console.log(decoded)
    } catch (err) {
      return ErrorHandler(res, err, 'Invalid token', 401, 'ca2')
    }

    let user = await User.findById(decoded.id)
    if (!user) return ErrorHandler(res, null, 'User not found', 404, 'ca3')
    res.status(200).json({ message: 'Auth checked', checked: true, token })
  } catch (err) {
    ErrorHandler(res, err, 'Invalid token data', 400, 'ca4')
  }
}

// forget password
async function ForgetPassword(req, res) {
  // find user by email
  const user = await User.findOne({ email: req.body.email })
  if (!user) ErrorHandler(res, null, 'No Users Found, Wrong Email', 404, 'fp1')
  // create temp token
  const tempToken = crypto.randomBytes(32).toString('hex')
  // set temp token
  user.passwordResetToken = crypto.createHash('sha256').update(tempToken).digest('hex')
  user.PasswordResetExpiration = Date.now() + 10 * 60 * 1000
  await user.save({ validateBeforeSave: false })
  // perpare token to be sent in email
  const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${user.passwordResetToken}`
  const message = `click on link bellow mf \n${resetUrl}`
  // console.log('message', message)
  try {
    await SendEmail({
      email: user.email,
      subject: 'Password Reset',
      message,
    })
    res.status(200).json({ message: 'Reset Message sent' })
  } catch (err) {
    user.passwordResetToken = undefined
    user.PasswordResetExpiration = undefined
    await user.save({ validateBeforeSave: false })
    ErrorHandler(res, err, `Couldn't send email with token`, 400, 'fp2')
  }
}

// reset password
async function RestPassword(req, res) {
  const user = await User.findOne({ passwordResetToken: req.params.token, PasswordResetExpiration: { $gte: Date.now() } })
  if (!user) return ErrorHandler(res, null, `Token invalid or expired`, 400, 'rp1')
  if (!req.body.password || !req.body.confirmPassword) return ErrorHandler(res, null, `Password and Confirm Password required`, 400, 'rp2')
  // save user data
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.PasswordResetExpiration = undefined
  await user.save()
  // send token
  const token = createToken(user)
  res.status(200).json({ message: 'User Logged in', token })
}

// update password
async function UpdatePassword(req, res) {
  let { oldPassword, password, confirmPassword, token } = req.body
  try {
    if (!password || !confirmPassword) return ErrorHandler(res, null, 'Password  and confirm password are required', 418, 'up1')
    if (password !== confirmPassword) return ErrorHandler(res, null, 'Password and confirm password not match', 418, 'up2')
    // get user
    let decoded = ''
    try {
      decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.user = decoded
    } catch (err) {
      return ErrorHandler(res, err, 'Invalid token', 401, 'prt3')
    }
    let user = await User.findById(decoded.id).select('+password')
    if (!user) return ErrorHandler(res, null, 'User not found', 404, 'up4')
    // check password
    let isPasswordMatching = await user.correctPassword(oldPassword, user.password)
    if (!isPasswordMatching) return ErrorHandler(res, null, 'Old Password is not correct', 401, 'up5')
    // update password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    await user.save()
    // send token
    const newToken = createToken(user)
    res.status(201).json({ message: 'Password updated', newToken })
  } catch (err) {
    ErrorHandler(res, err, 'Invalid user data', 400, 'up6')
  }
}

router.route('/signup').post(Signup)
router.route('/login').post(Login)
router.route('/check-auth').get(CheckAuth)
router.route('/forget-password').post(ForgetPassword)
router.route('/reset-password/:token').patch(RestPassword)
router.route('/update-password').patch(ProtectedRoute, UpdatePassword)
module.exports = router
