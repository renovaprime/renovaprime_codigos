const express = require('express');
const router = express.Router();
const rapidocController = require('../controllers/rapidocController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  rapidocVitalScanBeneficiarySchema,
  faceScanCpfSchema
} = require('../validators/rapidocBeneficiaryValidator');

router.post(
  '/vitalscan',
  authMiddleware,
  permissionMiddleware('paciente'),
  validate(rapidocVitalScanBeneficiarySchema),
  rapidocController.getVitalScanUrl
);

router.post(
  '/vitalscan/by-cpf',
  authMiddleware,
  permissionMiddleware('paciente'),
  validate(faceScanCpfSchema),
  rapidocController.getVitalScanUrlByCpf
);

module.exports = router;
