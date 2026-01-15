const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

// Public route to get active partners
router.get('/public/partners', partnerController.getActivePartners);

// Create new partner
router.post('/partners', partnerController.create);

// Get all partners
router.get('/partners', partnerController.getAll);

// Get partner by ID
router.get('/partners/:id', partnerController.getById);

// Update partner
router.put('/partners/:id', partnerController.update);

// Delete partner
router.delete('/partners/:id', partnerController.delete);

module.exports = router; 