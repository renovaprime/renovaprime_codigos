const express = require('express');
const router = express.Router();
const salesReportController = require('../controllers/salesReportController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  salesReportController.getSales
);

router.get(
  '/summary',
  authMiddleware,
  permissionMiddleware('admin'),
  salesReportController.getSalesSummary
);

router.get(
  '/commissions',
  authMiddleware,
  permissionMiddleware('admin'),
  salesReportController.getCommissionReport
);

module.exports = router;
