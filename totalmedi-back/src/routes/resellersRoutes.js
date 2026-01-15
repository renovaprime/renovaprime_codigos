const express = require('express');
const router = express.Router();
const resellersController = require('../controllers/resellersController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Create new reseller
router.post('/resellers', resellersController.create);

// Get all resellers
router.get('/resellers', resellersController.getAll);

// Get report data for Excel export
router.get('/resellers/report/export', resellersController.getReportData);

// Get reseller by ID
router.get('/resellers/:id', resellersController.getById);

// Update reseller
router.put('/resellers/:id', resellersController.update);

// Delete reseller
router.delete('/resellers/:id', resellersController.delete);

module.exports = router; 