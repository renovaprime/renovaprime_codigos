const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  addAttachmentSchema,
  createConsentSchema,
} = require('../validators/medicalRecordValidator');

// --------------- Records (medico) ---------------

router.post(
  '/',
  authMiddleware,
  permissionMiddleware('medico'),
  validate(createRecordSchema),
  medicalRecordController.create
);

router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('medico'),
  validate(updateRecordSchema),
  medicalRecordController.update
);

router.post(
  '/:id/sign',
  authMiddleware,
  permissionMiddleware('medico'),
  medicalRecordController.sign
);

// Record by appointment (medico - usado na teleconsulta)
router.get(
  '/appointment/:appointmentId',
  authMiddleware,
  permissionMiddleware(['medico', 'admin']),
  medicalRecordController.getByAppointment
);

// Patient summary
router.get(
  '/patient/:beneficiaryId/summary',
  authMiddleware,
  permissionMiddleware(['medico', 'admin']),
  medicalRecordController.getPatientSummary
);

// Patient records
router.get(
  '/patient/:beneficiaryId',
  authMiddleware,
  permissionMiddleware(['medico', 'admin', 'paciente']),
  medicalRecordController.getPatientRecords
);

// Patient audit (admin)
router.get(
  '/patient/:beneficiaryId/audit',
  authMiddleware,
  permissionMiddleware('admin'),
  medicalRecordController.getPatientAuditLogs
);

// --------------- Attachments ---------------

router.post(
  '/:id/attachments',
  authMiddleware,
  permissionMiddleware('medico'),
  validate(addAttachmentSchema),
  medicalRecordController.addAttachment
);

router.get(
  '/:id/attachments',
  authMiddleware,
  permissionMiddleware(['medico', 'admin']),
  medicalRecordController.getAttachments
);

router.delete(
  '/:recordId/attachments/:attachmentId',
  authMiddleware,
  permissionMiddleware('medico'),
  medicalRecordController.deleteAttachment
);

// --------------- Audit ---------------

router.get(
  '/:id/audit',
  authMiddleware,
  permissionMiddleware('admin'),
  medicalRecordController.getAuditLogs
);

// --------------- Consent ---------------

router.post(
  '/consents',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  validate(createConsentSchema),
  medicalRecordController.createConsent
);

router.get(
  '/consents/appointment/:appointmentId',
  authMiddleware,
  permissionMiddleware(['paciente', 'medico', 'admin']),
  medicalRecordController.getConsent
);

// --------------- Patient view ---------------

router.get(
  '/my-records',
  authMiddleware,
  permissionMiddleware('paciente'),
  medicalRecordController.getMyRecords
);

// --------------- Single record (must be last to avoid conflicts) ---------------

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware(['medico', 'admin', 'paciente']),
  medicalRecordController.getById
);

module.exports = router;
