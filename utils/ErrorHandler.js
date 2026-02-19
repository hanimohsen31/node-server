function ErrorHandler(res, err, message, statusCode, errorCode) {
  console.log('Error:', err);
  res.status(statusCode).json({
    status: statusCode,
    message: message,
    trace: err || null,
    errorCode: errorCode,
    data: null,
  })
}

module.exports = ErrorHandler
