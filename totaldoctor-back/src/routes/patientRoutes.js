const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { createPatientSchema } = require('../validators/patientValidator');

router.post('/', validate(createPatientSchema), patientController.create);

router.get(
  '/appointments',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.listAppointments
);

module.exports = router;
