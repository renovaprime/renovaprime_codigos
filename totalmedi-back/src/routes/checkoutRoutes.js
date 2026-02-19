const express = require('express');
const validate = require('../validators/checkoutValidator');
const ctrl = require('../controllers/checkoutController');


const router = express.Router();
router.post('/checkout', validate, ctrl.pay);
router.post('/payment', ctrl.createCustomerAndPay);
router.post('/payment-avulsa', ctrl.createCustomerAndPayAvulsa);
router.post('/subscription', ctrl.createCustomerAndSubscribe);
module.exports = router;
