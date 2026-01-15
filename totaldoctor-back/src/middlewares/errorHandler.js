const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json(errorResponse(err.message, 'VALIDATION_ERROR'));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(errorResponse('Resource already exists', 'CONFLICT'));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(errorResponse('Invalid reference', 'INVALID_REFERENCE'));
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json(errorResponse('Internal server error', 'INTERNAL_ERROR'));
  }

  return res.status(500).json(errorResponse(err.message, 'INTERNAL_ERROR'));
};

module.exports = errorHandler;
