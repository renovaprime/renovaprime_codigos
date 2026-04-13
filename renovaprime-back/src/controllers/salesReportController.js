const salesReportService = require('../services/salesReportService');
const { successResponse, errorResponse } = require('../utils/response');

class SalesReportController {
  async getSales(req, res, next) {
    try {
      const filters = {
        reseller_id: req.query.reseller_id,
        branch_id: req.query.branch_id,
        partner_id: req.query.partner_id,
        plan_type: req.query.plan_type,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const sales = await salesReportService.getSales(filters);
      return res.json(successResponse(sales));
    } catch (error) {
      next(error);
    }
  }

  async getSalesSummary(req, res, next) {
    try {
      const filters = {
        reseller_id: req.query.reseller_id,
        branch_id: req.query.branch_id,
        partner_id: req.query.partner_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const summary = await salesReportService.getSalesSummary(filters);
      return res.json(successResponse(summary));
    } catch (error) {
      next(error);
    }
  }

  async getCommissionReport(req, res, next) {
    try {
      const filters = {
        partner_id: req.query.partner_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const commissions = await salesReportService.getCommissionReport(filters);
      return res.json(successResponse(commissions));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalesReportController();
