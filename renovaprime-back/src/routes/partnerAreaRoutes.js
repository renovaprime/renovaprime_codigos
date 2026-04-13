const express = require('express');
const router = express.Router();
const partnerAreaController = require('../controllers/partnerAreaController');
const partnerAuthMiddleware = require('../middlewares/partnerAuth');
const partnerPermission = require('../middlewares/partnerPermission');

// Public
router.post('/auth/login', partnerAreaController.login);

// Protected (all entity types)
router.get('/profile', partnerAuthMiddleware, partnerAreaController.getProfile);
router.put('/profile', partnerAuthMiddleware, partnerAreaController.updateProfile);
router.put('/profile/password', partnerAuthMiddleware, partnerAreaController.changePassword);
router.get('/dashboard', partnerAuthMiddleware, partnerAreaController.getDashboard);
router.get('/sales', partnerAuthMiddleware, partnerAreaController.getSales);
router.get('/sales/summary', partnerAuthMiddleware, partnerAreaController.getSalesSummary);
router.get('/sales/commissions', partnerAuthMiddleware, partnerAreaController.getCommissions);

// Partner only
router.get('/branches', partnerAuthMiddleware, partnerPermission('partner'), partnerAreaController.getBranches);

// Partner + Branch
router.get('/resellers', partnerAuthMiddleware, partnerPermission(['partner', 'branch']), partnerAreaController.getResellers);

module.exports = router;
