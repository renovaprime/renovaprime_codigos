const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');
const siteRoutes = require('./siteRoutes');
const meRoutes = require('./meRoutes');
const partnerRoutes = require('./partnerRoutes');
const cmsRoutes = require('./cmsRoutes');
const salesRoutes = require('./salesRoutes');
const partnerAreaRoutes = require('./partnerAreaRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patient', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/site', siteRoutes);
router.use('/partners', partnerRoutes);
router.use('/cms', cmsRoutes);
router.use('/sales', salesRoutes);
router.use('/partner-area', partnerAreaRoutes);
router.use('/medical-records', medicalRecordRoutes);

module.exports = router;
