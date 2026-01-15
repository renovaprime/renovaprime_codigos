const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/appointments', appointmentController.create);
router.post('/appointments/with-referral', appointmentController.createWithReferral);
router.get('/appointments', appointmentController.getAll);
router.get('/appointments/referrals', appointmentController.getAllReferrals);
router.get('/appointments/:uuid', appointmentController.getById);
router.delete('/appointments/:uuid', appointmentController.cancel);
router.get('/specialty-availability', appointmentController.getAvailability);
router.get('/specialties', appointmentController.getSpecialties);

module.exports = router;