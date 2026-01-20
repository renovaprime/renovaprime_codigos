const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { createSpecialtySchema, updateSpecialtySchema } = require('../validators/specialtyValidator');
const { createDoctorSchema, updateDoctorSchema } = require('../validators/adminDoctorValidator');
const { createBeneficiarySchema, updateBeneficiarySchema } = require('../validators/beneficiaryValidator');

router.get(
  '/doctors/pending',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listPendingDoctors
);

router.post(
  '/doctors/:id/approve',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.approveDoctor
);

router.post(
  '/doctors/:id/reject',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.rejectDoctor
);

router.get(
  '/appointments',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listAdminAppointments
);

router.get(
  '/appointments/history',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listAdminAppointmentsHistory
);

router.get(
  '/appointments/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.getAdminAppointmentById
);

router.post(
  '/appointments/:id/cancel',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.cancelAdminAppointment
);

router.get(
  '/specialties',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listSpecialties
);

router.post(
  '/specialties',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createSpecialtySchema),
  adminController.createSpecialty
);

router.put(
  '/specialties/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateSpecialtySchema),
  adminController.updateSpecialty
);

router.patch(
  '/specialties/:id/toggle',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.toggleSpecialty
);

router.delete(
  '/specialties/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.deleteSpecialty
);

router.post(
  '/doctors',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createDoctorSchema),
  adminController.createDoctor
);

router.get(
  '/doctors',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listActiveDoctors
);

router.get(
  '/doctors/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.getDoctorById
);

router.put(
  '/doctors/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateDoctorSchema),
  adminController.updateDoctor
);

router.delete(
  '/doctors/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.deleteDoctor
);

// ==================== Beneficiários ====================

router.get(
  '/beneficiaries',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listBeneficiaries
);

router.get(
  '/beneficiaries/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.getBeneficiaryById
);

router.post(
  '/beneficiaries',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createBeneficiarySchema),
  adminController.createBeneficiary
);

router.put(
  '/beneficiaries/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateBeneficiarySchema),
  adminController.updateBeneficiary
);

router.patch(
  '/beneficiaries/:id/status',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.toggleBeneficiaryStatus
);

router.get(
  '/beneficiaries/:id/dependents',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.listDependents
);

router.delete(
  '/beneficiaries/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminController.deleteBeneficiary
);

module.exports = router;
