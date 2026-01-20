const express = require('express');
const router = express.Router();
const teleconsultController = require('./teleconsultController');
const authMiddleware = require('../../middlewares/auth');
const permissionMiddleware = require('../../middlewares/permission');

// Health check (público)
router.get('/health', teleconsultController.health);

// Obter dados da sala (médico ou paciente autenticado)
router.get(
  '/room/:appointmentId',
  authMiddleware,
  permissionMiddleware(['medico', 'paciente']),
  teleconsultController.getRoom
);

// Verificar disponibilidade da teleconsulta (médico ou paciente autenticado)
router.get(
  '/appointments/:appointmentId/availability',
  authMiddleware,
  permissionMiddleware(['medico', 'paciente']),
  teleconsultController.checkAvailability
);

// Finalizar teleconsulta (apenas médico)
router.post(
  '/appointments/:appointmentId/end',
  authMiddleware,
  permissionMiddleware('medico'),
  teleconsultController.endTeleconsultation
);

// Registrar peer ID do médico (apenas médico)
router.post(
  '/appointments/:appointmentId/register-peer',
  authMiddleware,
  permissionMiddleware('medico'),
  teleconsultController.registerPeerId
);

module.exports = router;
