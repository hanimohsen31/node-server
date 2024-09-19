class AppError extends Error {
  constructor(statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOptional = true
    Error.captureStackTrace(this, this.constructor)
  }
}

function ErrorHandler(res, err, message, statusCode, errorCode) {
  res.status(statusCode).json({
    status: statusCode,
    message: message,
    trace: err || null,
    errorCode: errorCode,
    data: null,
  })
}

module.exports = ErrorHandler
