const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    let message = 'A record with this information already exists.';
    if (err.sqlMessage && err.sqlMessage.includes('email')) {
      message = 'An account or store with this email already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('uq_user_store_rating')) {
      message = 'You have already submitted a rating for this store. You may modify your existing rating.';
    }
    return res.status(409).json({
      success: false,
      message
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist.'
    });
  }

  // Fallback internal error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;

