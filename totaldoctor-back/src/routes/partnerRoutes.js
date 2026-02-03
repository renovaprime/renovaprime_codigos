const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  createPartnerSchema,
  updatePartnerSchema,
  createBranchSchema,
  updateBranchSchema,
  createResellerSchema,
  updateResellerSchema
} = require('../validators/partnerValidator');

// ==================== Partners ====================

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.listPartners
);

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.getPartnerById
);

router.post(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createPartnerSchema),
  partnerController.createPartner
);

router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updatePartnerSchema),
  partnerController.updatePartner
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.togglePartner
);

router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.deletePartner
);

// ==================== Branches ====================

router.get(
  '/:partnerId/branches',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.listBranches
);

router.post(
  '/:partnerId/branches',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createBranchSchema),
  partnerController.createBranch
);

router.get(
  '/branches/all',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.listBranches
);

router.get(
  '/branches/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.getBranchById
);

router.put(
  '/branches/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateBranchSchema),
  partnerController.updateBranch
);

router.patch(
  '/branches/:id/toggle',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.toggleBranch
);

router.delete(
  '/branches/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.deleteBranch
);

// ==================== Resellers ====================

router.get(
  '/branches/:branchId/resellers',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.listResellers
);

router.post(
  '/branches/:branchId/resellers',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createResellerSchema),
  partnerController.createReseller
);

router.get(
  '/resellers/all',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.listResellers
);

router.get(
  '/resellers/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.getResellerById
);

router.put(
  '/resellers/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateResellerSchema),
  partnerController.updateReseller
);

router.patch(
  '/resellers/:id/toggle',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.toggleReseller
);

router.delete(
  '/resellers/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  partnerController.deleteReseller
);

module.exports = router;
