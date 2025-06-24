// Wraps async functions to automatically catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`AsyncHandler Error: ${err.message}`.red);
    next(err);
  });
};

module.exports = asyncHandler;