const express = require('express');
const router = express.Router();
const consultationRequestController = require('../controllers/consultationRequestController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/consultation-requests', authenticateToken, consultationRequestController.getAll);
router.post('/consultation-requests/:id/create-beneficiary', authenticateToken, consultationRequestController.createBeneficiary);
router.post('/consultation-requests/:id/schedule', authenticateToken, consultationRequestController.schedule);

module.exports = router;
