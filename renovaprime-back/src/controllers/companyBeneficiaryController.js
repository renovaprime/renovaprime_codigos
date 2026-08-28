const companyBeneficiaryService = require('../services/companyBeneficiaryService');
const { successResponse, errorResponse } = require('../utils/response');

function handleBeneficiaryError(error, res, next) {
  if (error.code === 'NOT_FOUND') {
    const messages = {
      'Company not found': 'Empresa não encontrada',
      'Beneficiary not found': 'Beneficiário não encontrado',
      'Titular not found': 'Titular não encontrado',
      'Dependent not found': 'Dependente não encontrado'
    };
    return res.status(404).json(errorResponse(messages[error.message] || error.message, 'NOT_FOUND'));
  }
  if (error.code === 'CONFLICT') {
    const messages = {
      'CPF already registered': 'CPF já cadastrado',
      'Email already registered': 'E-mail já cadastrado'
    };
    return res.status(409).json(errorResponse(messages[error.message] || error.message, 'CONFLICT'));
  }
  if (error.code === 'UNPROCESSABLE') {
    return res.status(422).json(errorResponse(error.message, 'UNPROCESSABLE'));
  }
  return next(error);
}

class CompanyBeneficiaryController {
  async list(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;

      const filters = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search
      };

      const beneficiaries = await companyBeneficiaryService.listBeneficiaries(companyId, filters);
      return res.json(successResponse(beneficiaries));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async getById(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;
      const beneficiaryId = parseInt(req.params.beneficiaryId || req.params.id, 10);

      const beneficiary = await companyBeneficiaryService.getBeneficiaryById(companyId, beneficiaryId);
      return res.json(successResponse(beneficiary));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async create(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;

      const createdByUserId = req.user?.id || null;
      const beneficiary = await companyBeneficiaryService.createBeneficiary(
        companyId,
        req.body,
        createdByUserId
      );
      return res.status(201).json(successResponse(beneficiary));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async update(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;
      const beneficiaryId = parseInt(req.params.beneficiaryId || req.params.id, 10);

      if (req.body.status === 'INACTIVE') {
        const beneficiary = await companyBeneficiaryService.inactivateBeneficiary(
          companyId,
          beneficiaryId
        );
        return res.json(successResponse(beneficiary));
      }

      const beneficiary = await companyBeneficiaryService.updateBeneficiary(
        companyId,
        beneficiaryId,
        req.body
      );
      return res.json(successResponse(beneficiary));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async inactivate(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;
      const beneficiaryId = parseInt(req.params.beneficiaryId || req.params.id, 10);

      const beneficiary = await companyBeneficiaryService.inactivateBeneficiary(
        companyId,
        beneficiaryId
      );
      return res.json(successResponse(beneficiary));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async delete(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;
      const beneficiaryId = parseInt(req.params.beneficiaryId || req.params.id, 10);

      await companyBeneficiaryService.deleteBeneficiary(companyId, beneficiaryId);
      return res.status(204).send();
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }

  async grantAccess(req, res, next) {
    try {
      const companyId = req.params.companyId
        ? parseInt(req.params.companyId, 10)
        : req.companyAuth.entityId;
      const beneficiaryId = parseInt(req.params.beneficiaryId || req.params.id, 10);

      const result = await companyBeneficiaryService.grantDependentAccess(
        companyId,
        beneficiaryId,
        req.body
      );
      return res.json(successResponse(result));
    } catch (error) {
      handleBeneficiaryError(error, res, next);
    }
  }
}

module.exports = new CompanyBeneficiaryController();
