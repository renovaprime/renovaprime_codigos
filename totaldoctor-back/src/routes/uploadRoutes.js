const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const uploadMiddleware = require('../middlewares/upload');

router.post(
  '/doctor-document',
  authMiddleware,
  permissionMiddleware('admin'),
  uploadMiddleware.single('file'),
  uploadController.uploadDoctorDocument
);

router.get(
  '/signed-url',
  authMiddleware,
  permissionMiddleware('admin'),
  uploadController.getSignedUrl
);

router.get(
  '/doctor-signed-urls',
  authMiddleware,
  permissionMiddleware('admin'),
  uploadController.getSignedUrlsForDoctor
);

module.exports = router;
