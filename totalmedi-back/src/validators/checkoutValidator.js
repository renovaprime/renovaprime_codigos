const { body } = require('express-validator');

module.exports = [
  body('name').notEmpty(),
  body('cpf').isLength({ min: 11, max: 11 }),
  body('birthday').matches(/^\d{2}\/\d{2}\/\d{4}$/),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('zipCode').isLength({ min: 8, max: 8 }),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('state').isLength({ min: 2, max: 2 }),
  body('amount').isFloat({ gt: 0 }),
  body('dueDate').isISO8601(),          // yyyy‑MM‑dd
  body('cardToken').notEmpty()
];
