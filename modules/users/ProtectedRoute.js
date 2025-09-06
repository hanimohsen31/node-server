const jwt = require('jsonwebtoken')
const ErrorHandler = require('../../utils/ErrorHandler')
const User = require('./auth-model')

async function ProtectedRoute(req, res, next) {
  let token = ''
  if (req.headers?.authorization && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers?.authorization.split(' ')[1]
  }
  // check if token sent from front end
  if (!token) {
    return ErrorHandler(res, null, 'Token Not Sent', 401, 'prt1')
  }
  // check if token not edited or changed
  let decoded = ''
  try {
    // TODO reset token key
    decoded = await jwt.verify(token, process.env.JWT_KEY)
    req.user = decoded
  } catch (err) {
    return ErrorHandler(res, err, 'Invalid token', 401, 'prt2')
  }
  // check if user still exist
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return ErrorHandler(res, null, 'Token not belonging to this user', 401, 'prt3')
  }
  // check if user changed password after creating token
  let passwordChanged = currentUser.changePasswordAfterCreatingToken(decoded.iat)
  // console.log(passwordChanged);
  if (passwordChanged) {
    return ErrorHandler(res, null, 'User recently changed password', 401, 'prt4')
  }
  // next
  req.user = currentUser
  next()
}

module.exports = ProtectedRoute
