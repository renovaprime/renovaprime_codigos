const express = require('express');
const router = express.Router();
const adminCompanyPlanController = require('../controllers/adminCompanyPlanController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  createCompanyPlanSchema,
  updateCompanyPlanSchema,
  updateCompanyPlanStatusSchema
} = require('../validators/companyPlanValidator');

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyPlanController.listPlans
);

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyPlanController.getPlanById
);

router.post(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createCompanyPlanSchema),
  adminCompanyPlanController.createPlan
);

router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanyPlanSchema),
  adminCompanyPlanController.updatePlan
);

router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanyPlanStatusSchema),
  adminCompanyPlanController.updateStatus
);

module.exports = router;
