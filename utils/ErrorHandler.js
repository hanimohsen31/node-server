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
