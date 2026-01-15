const express = require('express');
const router = express.Router();
const professionalsController = require('../controllers/professionalsController');

// Create new professional
router.post('/professionals', 
  professionalsController.uploadFiles,
  professionalsController.create
);

// Get all professionals
router.get('/professionals', professionalsController.getAll);

// Get professional by ID
router.get('/professionals/:id', professionalsController.getById);

// Update professional
router.put('/professionals/:id',
  professionalsController.uploadFiles,
  professionalsController.update
);

// Delete professional
router.delete('/professionals/:id', professionalsController.delete);

module.exports = router;