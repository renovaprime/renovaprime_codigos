const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  createPatientAppointmentSchema,
  manageDependentAccessSchema,
  createDependentSchema
} = require('../validators/patientAppointmentValidator');

// Patient appointments routes
router.get(
  '/appointments',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getMyAppointments
);

// Patient appointments history route
router.get(
  '/appointments/history',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getAppointmentsHistory
);

router.post(
  '/appointments',
  authMiddleware,
  permissionMiddleware('paciente'),
  validate(createPatientAppointmentSchema),
  patientController.createAppointment
);

router.post(
  '/appointments/:id/cancel',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.cancelMyAppointment
);

router.get(
  '/beneficiaries',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getMyBeneficiaries
);

router.post(
  '/beneficiaries',
  authMiddleware,
  permissionMiddleware('paciente'),
  validate(createDependentSchema),
  patientController.createDependent
);

router.post(
  '/beneficiaries/:id/access',
  authMiddleware,
  permissionMiddleware('paciente'),
  validate(manageDependentAccessSchema),
  patientController.manageDependentAccess
);

// Subscription
router.get(
  '/subscription',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getSubscription
);

// Specialties - accessible by patients (only active ones)
router.get(
  '/specialties',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.listSpecialties
);

// Availability routes
router.get(
  '/availability/specialty/:specialtyId/month/:yearMonth',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getMonthAvailability
);

router.get(
  '/availability/specialty/:specialtyId/day/:date',
  authMiddleware,
  permissionMiddleware('paciente'),
  patientController.getDaySlots
);

module.exports = router;
