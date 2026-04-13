const express = require('express');
const router = express.Router();
const meController = require('../controllers/meController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { updateMeSchema, updatePasswordSchema } = require('../validators/meValidator');

// Todas as rotas requerem autenticação e aceitam qualquer role autenticada
const allRoles = ['admin', 'medico', 'paciente'];

// GET /me - Retorna dados do usuário logado
router.get(
  '/',
  authMiddleware,
  permissionMiddleware(allRoles),
  meController.getMe
);

// PUT /me - Atualiza dados básicos do usuário (name, email, phone)
router.put(
  '/',
  authMiddleware,
  permissionMiddleware(allRoles),
  validate(updateMeSchema),
  meController.updateMe
);

// PUT /me/password - Altera senha do usuário
router.put(
  '/password',
  authMiddleware,
  permissionMiddleware(allRoles),
  validate(updatePasswordSchema),
  meController.updateMyPassword
);

module.exports = router;
