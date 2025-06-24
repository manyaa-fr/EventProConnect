class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Captures stack trace (for error debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;