const express = require('express');
const router = express.Router();
const adminCompanyReportController = require('../controllers/adminCompanyReportController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyReportController.listReports
);

router.get(
  '/:id/lives',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyReportController.getCompanyLives
);

router.get(
  '/:id/billings',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyReportController.getCompanyBillings
);

module.exports = router;
