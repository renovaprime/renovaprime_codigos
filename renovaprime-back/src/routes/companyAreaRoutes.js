const express = require('express');
const router = express.Router();
const companyAreaController = require('../controllers/companyAreaController');
const companyBeneficiaryController = require('../controllers/companyBeneficiaryController');
const companyBillingController = require('../controllers/companyBillingController');
const companyAuthMiddleware = require('../middlewares/companyAuth');
const validate = require('../validators/validate');
const {
  companyLoginSchema,
  updateCompanyProfileSchema,
  changeCompanyPasswordSchema
} = require('../validators/companyValidator');
const {
  createCompanyBeneficiarySchema,
  updateCompanyBeneficiarySchema,
  grantCompanyDependentAccessSchema
} = require('../validators/companyBeneficiaryValidator');

router.post(
  '/auth/login',
  validate(companyLoginSchema),
  companyAreaController.login
);

router.post(
  '/webhooks/asaas',
  companyBillingController.handleAsaasWebhook
);

router.get(
  '/billing',
  companyAuthMiddleware,
  companyBillingController.listBillingsPortal
);

router.get(
  '/billing/:competence',
  companyAuthMiddleware,
  companyBillingController.getBillingByCompetencePortal
);

router.get(
  '/profile',
  companyAuthMiddleware,
  companyAreaController.getProfile
);

router.put(
  '/profile',
  companyAuthMiddleware,
  validate(updateCompanyProfileSchema),
  companyAreaController.updateProfile
);

router.put(
  '/profile/password',
  companyAuthMiddleware,
  validate(changeCompanyPasswordSchema),
  companyAreaController.changePassword
);

router.get(
  '/beneficiaries',
  companyAuthMiddleware,
  companyBeneficiaryController.list
);

router.post(
  '/beneficiaries',
  companyAuthMiddleware,
  validate(createCompanyBeneficiarySchema),
  companyBeneficiaryController.create
);

router.get(
  '/beneficiaries/:id',
  companyAuthMiddleware,
  companyBeneficiaryController.getById
);

router.patch(
  '/beneficiaries/:id',
  companyAuthMiddleware,
  validate(updateCompanyBeneficiarySchema),
  companyBeneficiaryController.update
);

router.delete(
  '/beneficiaries/:id',
  companyAuthMiddleware,
  companyBeneficiaryController.delete
);

router.post(
  '/beneficiaries/:id/access',
  companyAuthMiddleware,
  validate(grantCompanyDependentAccessSchema),
  companyBeneficiaryController.grantAccess
);

module.exports = router;
