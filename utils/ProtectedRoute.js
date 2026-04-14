const jwt = require('jsonwebtoken')
const ErrorHandler = require('./ErrorHandler')
const User = require('../modules/auth/auth-model')

async function ProtectedRoute(req, res, next) {
  // Extract token from Authorization header
  let token
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Check if token was sent
  if (!token) {
    return ErrorHandler(res, null, 'Token Not Sent', 401, 'prt1')
  }

  // Verify token signature, expiry, and enforce algorithm — prevents alg:none and confusion attacks
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY, { algorithms: ['HS256'] })
  } catch (err) {
    // Do NOT forward err — it would expose JWT internals (e.g. "jwt expired") to the client
    return ErrorHandler(res, null, 'Invalid token', 401, 'prt2')
  }

  // Check if user still exists; explicitly select activeAccount (it is select:false in schema)
  let currentUser
  try {
    currentUser = await User.findById(decoded.id).select('+activeAccount')
  } catch (err) {
    return ErrorHandler(res, null, 'Authentication failed', 500, 'prt3')
  }

  if (!currentUser) {
    return ErrorHandler(res, null, 'Authentication failed', 401, 'prt4')
  }

  // Check if account is active
  if (!currentUser.activeAccount) {
    return ErrorHandler(res, null, 'Account is deactivated', 401, 'prt5')
  }

  // Check if user changed password after token was issued
  if (currentUser.changePasswordAfterCreatingToken(decoded.iat)) {
    return ErrorHandler(res, null, 'User recently changed password', 401, 'prt6')
  }

  req.user = currentUser
  next()
}

module.exports = ProtectedRoute
