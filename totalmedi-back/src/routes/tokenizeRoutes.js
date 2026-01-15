const express = require('express');
const validate = require('../validators/tokenizeValidator');
const ctrl     = require('../controllers/tokenizeController');
const router   = express.Router();

router.post('/tokenize', validate, ctrl.tokenize);
module.exports = router;
