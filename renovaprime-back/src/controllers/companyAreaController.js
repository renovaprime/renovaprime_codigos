const companyAuthService = require('../services/companyAuthService');
const companyAreaService = require('../services/companyAreaService');
const { successResponse, errorResponse } = require('../utils/response');

class CompanyAreaController {
  async login(req, res, next) {
    try {
      const result = await companyAuthService.login(req.body.email, req.body.password);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json(errorResponse(error.message, 'UNAUTHORIZED'));
      }
      if (error.message === 'Empresa inativa. Entre em contato com o administrador.') {
        return res.status(401).json(errorResponse(error.message, 'UNAUTHORIZED'));
      }
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await companyAreaService.getProfile(req.companyAuth);
      return res.json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await companyAreaService.updateProfile(req.companyAuth, req.body);
      return res.json(successResponse(profile));
    } catch (error) {
      if (error.message === 'E-mail de login já cadastrado') {
        return res.status(409).json(errorResponse(error.message, 'CONFLICT'));
      }
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await companyAreaService.changePassword(
        req.companyAuth,
        req.body.currentPassword,
        req.body.newPassword
      );
      return res.json(successResponse({ message: 'Senha alterada com sucesso' }));
    } catch (error) {
      if (error.message === 'Senha atual incorreta') {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }
}

module.exports = new CompanyAreaController();
