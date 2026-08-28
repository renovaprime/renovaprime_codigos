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
const rapidocRoutes = require('./rapidocRoutes');
const adminCompanyRoutes = require('./adminCompanyRoutes');
const adminCompanyReportRoutes = require('./adminCompanyReportRoutes');
const adminCompanyPlanRoutes = require('./adminCompanyPlanRoutes');
const companyAreaRoutes = require('./companyAreaRoutes');

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/doctors', doctorRoutes);
// Mais específico antes de `/patient` para não ser engolido pelo patientRoutes
router.use('/patient/rapidoc', rapidocRoutes);
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
router.use('/admin/companies', adminCompanyRoutes);
router.use('/admin/company-reports', adminCompanyReportRoutes);
router.use('/admin/company-plans', adminCompanyPlanRoutes);
router.use('/company-area', companyAreaRoutes);

module.exports = router;
