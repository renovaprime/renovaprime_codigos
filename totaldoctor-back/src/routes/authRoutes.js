const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../validators/validate');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidator');

router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
