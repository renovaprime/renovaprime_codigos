const companyReportService = require('../services/companyReportService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminCompanyReportController {
  async listReports(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        status: req.query.status
      };
      const reports = await companyReportService.listReports(filters);
      return res.json(successResponse(reports));
    } catch (error) {
      next(error);
    }
  }

  async getCompanyLives(req, res, next) {
    try {
      const companyId = parseInt(req.params.id, 10);
      const filters = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search
      };
      const lives = await companyReportService.getCompanyLives(companyId, filters);
      return res.json(successResponse(lives));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async getCompanyBillings(req, res, next) {
    try {
      const companyId = parseInt(req.params.id, 10);
      const billings = await companyReportService.getCompanyBillings(companyId);
      return res.json(successResponse(billings));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      next(error);
    }
  }
}

module.exports = new AdminCompanyReportController();
