const ErrorHandler = require('./ErrorHandler')

function RestrictTo(...args) {
  return (req, res, next) => {
    if (!args.includes(req.user.role)) ErrorHandler(res, null, "You don't have permission to do this action", 401, 'rt1')
    else next()
  }
}

module.exports = RestrictTo
