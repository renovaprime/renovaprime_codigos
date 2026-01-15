const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');

// Get all commission plans
router.get('/commission-plans', commissionController.getAll);

// Get commission plan by ID
router.get('/commission-plans/:id', commissionController.getById);

// Get commission plans by partner ID
router.get('/commission-plans/partner/:partnerId', commissionController.getByPartnerId);

// Create new commission plan
router.post('/commission-plans', commissionController.create);

// Update commission plan
router.put('/commission-plans/:id', commissionController.update);

// Delete commission plan
router.delete('/commission-plans/:id', commissionController.delete);

module.exports = router;
