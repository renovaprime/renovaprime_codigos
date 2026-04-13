const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

// Public routes (no auth required)
router.get(
  '/public',
  cmsController.findAllPublic
);

router.get(
  '/public/:key',
  cmsController.findByKey
);

// Protected routes - admin only
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.findAll
);

router.get(
  '/:key',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.findByKey
);

router.post(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.create
);

router.put(
  '/:key',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.update
);

router.put(
  '/:key/upsert',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.upsert
);

router.delete(
  '/:key',
  authMiddleware,
  permissionMiddleware('admin'),
  cmsController.delete
);

module.exports = router;
