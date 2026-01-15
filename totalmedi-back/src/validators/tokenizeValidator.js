const { body } = require('express-validator');

module.exports = [
  body('customerId').notEmpty(),
  body('cardNumber').notEmpty(),
  body('holderName').notEmpty(),
  body('expMonth').isLength({ min:2, max:2 }),
  body('expYear').isLength({ min:2, max:2 }),
  body('cvv').isLength({ min:3, max:4 })
];
