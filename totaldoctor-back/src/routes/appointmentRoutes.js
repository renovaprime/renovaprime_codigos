const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { createAppointmentSchema } = require('../validators/appointmentValidator');

router.post(
  '/',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  validate(createAppointmentSchema),
  appointmentController.create
);

router.post(
  '/:id/start',
  authMiddleware,
  permissionMiddleware('medico'),
  appointmentController.start
);

router.post(
  '/:id/finish',
  authMiddleware,
  permissionMiddleware('medico'),
  appointmentController.finish
);

router.post(
  '/:id/cancel',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  appointmentController.cancel
);

module.exports = router;
