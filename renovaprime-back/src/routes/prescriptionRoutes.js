const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { emitPrescriptionSchema } = require('../validators/prescriptionValidator');

router.post(
  '/:appointmentId',
  authMiddleware,
  permissionMiddleware('medico'),
  validate(emitPrescriptionSchema),
  prescriptionController.emit
);

router.get(
  '/patient',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  prescriptionController.listByPatient
);

router.get(
  '/:prescriptionId/patient-link',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  prescriptionController.getPatientLink
);

router.get(
  '/:prescriptionId',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  prescriptionController.getPrescriptionById
);

router.patch(
  '/:prescriptionId/sign',
  authMiddleware,
  permissionMiddleware('medico'),
  prescriptionController.updateSignStatus
);

router.patch(
  '/:memedPrescriptionId/mark-deleted',
  authMiddleware,
  permissionMiddleware('medico'),
  prescriptionController.markDeleted
);

module.exports = router;
