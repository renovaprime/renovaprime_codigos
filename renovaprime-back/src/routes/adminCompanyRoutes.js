const express = require('express');
const router = express.Router();
const adminCompanyController = require('../controllers/adminCompanyController');
const adminCompanyReportController = require('../controllers/adminCompanyReportController');
const companyBeneficiaryController = require('../controllers/companyBeneficiaryController');
const companyBillingController = require('../controllers/companyBillingController');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const {
  createCompanySchema,
  updateCompanySchema,
  updateCompanyStatusSchema
} = require('../validators/companyValidator');
const {
  createCompanyContractSchema,
  updateCompanyContractStatusSchema
} = require('../validators/companyPlanValidator');
const {
  createCompanyBeneficiarySchema,
  updateCompanyBeneficiarySchema,
  grantCompanyDependentAccessSchema
} = require('../validators/companyBeneficiaryValidator');

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyController.listCompanies
);

router.get(
  '/:id/billing-preview',
  authMiddleware,
  permissionMiddleware('admin'),
  companyBillingController.billingPreview
);

router.post(
  '/:id/billings/generate',
  authMiddleware,
  permissionMiddleware('admin'),
  companyBillingController.generateBilling
);

router.get(
  '/:id/billings',
  authMiddleware,
  permissionMiddleware('admin'),
  companyBillingController.listBillingsAdmin
);

router.get(
  '/:id/lives',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyReportController.getCompanyLives
);

router.get(
  '/:id/beneficiaries',
  authMiddleware,
  permissionMiddleware('admin'),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.list(req, res, next);
  }
);

router.post(
  '/:id/beneficiaries',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createCompanyBeneficiarySchema),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.create(req, res, next);
  }
);

router.get(
  '/:id/beneficiaries/:beneficiaryId',
  authMiddleware,
  permissionMiddleware('admin'),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.getById(req, res, next);
  }
);

router.patch(
  '/:id/beneficiaries/:beneficiaryId',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanyBeneficiarySchema),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.update(req, res, next);
  }
);

router.delete(
  '/:id/beneficiaries/:beneficiaryId',
  authMiddleware,
  permissionMiddleware('admin'),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.delete(req, res, next);
  }
);

router.post(
  '/:id/beneficiaries/:beneficiaryId/access',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(grantCompanyDependentAccessSchema),
  (req, res, next) => {
    req.params.companyId = req.params.id;
    companyBeneficiaryController.grantAccess(req, res, next);
  }
);

router.get(
  '/:id/contract',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyController.getContract
);

router.post(
  '/:id/contract',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createCompanyContractSchema),
  adminCompanyController.createContract
);

router.patch(
  '/:id/contract/status',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanyContractStatusSchema),
  adminCompanyController.updateContractStatus
);

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyController.getCompanyById
);

router.post(
  '/',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(createCompanySchema),
  adminCompanyController.createCompany
);

router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanySchema),
  adminCompanyController.updateCompany
);

router.patch(
  '/:id/status',
  authMiddleware,
  permissionMiddleware('admin'),
  validate(updateCompanyStatusSchema),
  adminCompanyController.updateStatus
);

router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  adminCompanyController.deleteCompany
);

module.exports = router;
