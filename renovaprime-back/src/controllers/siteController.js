const siteService = require('../services/siteService');
const { successResponse, errorResponse } = require('../utils/response');

class SiteController {
  async createPendingDoctor(req, res, next) {
    try {
      const result = await siteService.createPendingDoctor(req.body);
      return res.status(201).json(successResponse(result));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email já está em uso', 'CONFLICT'));
      }
      if (error.message === 'Doctor role not found') {
        return res.status(500).json(errorResponse(error.message, 'SERVER_ERROR'));
      }
      next(error);
    }
  }

  async listActiveSpecialties(req, res, next) {
    try {
      const specialties = await siteService.listActiveSpecialties();
      return res.json(successResponse(specialties));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SiteController();
