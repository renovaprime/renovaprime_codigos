const { errorResponse } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json(errorResponse(errors, 'VALIDATION_ERROR'));
    }
  };
};

module.exports = validate;
