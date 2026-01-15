const express = require('express');
const router = express.Router();
const teleconsultController = require('../controllers/teleconsultController');
const authMiddleware = require('../middlewares/auth');

router.get(
  '/:appointmentId/access',
  authMiddleware,
  teleconsultController.getAccess
);

module.exports = router;
