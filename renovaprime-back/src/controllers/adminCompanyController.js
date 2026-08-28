const companyService = require('../services/companyService');
const companyContractService = require('../services/companyContractService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminCompanyController {
  async listCompanies(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        status: req.query.status
      };
      const companies = await companyService.listCompanies(filters);
      return res.json(successResponse(companies));
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const company = await companyService.getCompanyById(id);
      return res.json(successResponse(company));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createCompany(req, res, next) {
    try {
      const company = await companyService.createCompany(req.body);
      return res.status(201).json(successResponse(company));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('CNPJ ou e-mail de login já cadastrado', 'CONFLICT'));
      }
      if (error.message === 'E-mail corporativo deve ser diferente do e-mail de login') {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const company = await companyService.updateCompany(id, req.body);
      return res.json(successResponse(company));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.message === 'E-mail corporativo deve ser diferente do e-mail de login') {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('CNPJ ou e-mail de login já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const company = await companyService.updateStatus(id, req.body.active);
      return res.json(successResponse(company));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await companyService.deleteCompany(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.message === 'Não é possível excluir empresa com vidas cadastradas' ||
          error.message === 'Não é possível excluir empresa com faturas') {
        return res.status(422).json(errorResponse(error.message, 'UNPROCESSABLE'));
      }
      next(error);
    }
  }

  async getContract(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const contract = await companyContractService.getContract(id);
      return res.json(successResponse(contract));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.message === 'Contract not found') {
        return res.status(404).json(errorResponse('Contrato não encontrado', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createContract(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const contract = await companyContractService.createContract(id, req.body);
      return res.status(201).json(successResponse(contract));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.message === 'Plan not found') {
        return res.status(404).json(errorResponse('Plano não encontrado', 'NOT_FOUND'));
      }
      if (error.code === 'CONTRACT_CONFLICT') {
        return res.status(409).json(errorResponse(error.message, 'CONFLICT'));
      }
      if (error.message === 'Plano inativo não pode ser vinculado' ||
          error.message === 'Plano deve ter faixas ativas com preço maior que zero') {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async updateContractStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const contract = await companyContractService.updateContractStatus(id, req.body.active);
      return res.json(successResponse(contract));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.message === 'Contract not found') {
        return res.status(404).json(errorResponse('Contrato não encontrado', 'NOT_FOUND'));
      }
      next(error);
    }
  }
}

module.exports = new AdminCompanyController();
