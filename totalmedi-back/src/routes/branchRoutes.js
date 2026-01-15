const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branchesController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Create new branch
router.post('/branches', branchesController.create);

// Get all branches
router.get('/branches', branchesController.getAll);

// Get branch by ID
router.get('/branches/:id', branchesController.getById);

// Update branch
router.put('/branches/:id', branchesController.update);

// Delete branch
router.delete('/branches/:id', branchesController.delete);

module.exports = router; 