const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

// Routes
router.post('/login', loginValidation, authController.login);
router.get('/verify', authController.verifyAuth);
router.post(
  '/change-password',
  authenticateToken,
  changePasswordValidation,
  authController.changePassword
);

module.exports = router;