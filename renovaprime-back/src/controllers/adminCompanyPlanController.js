const companyPlanService = require('../services/companyPlanService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminCompanyPlanController {
  async listPlans(req, res, next) {
    try {
      const filters = { status: req.query.status };
      const plans = await companyPlanService.listPlans(filters);
      return res.json(successResponse(plans));
    } catch (error) {
      next(error);
    }
  }

  async getPlanById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const plan = await companyPlanService.getPlanById(id);
      return res.json(successResponse(plan));
    } catch (error) {
      if (error.message === 'Plan not found') {
        return res.status(404).json(errorResponse('Plano não encontrado', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createPlan(req, res, next) {
    try {
      const plan = await companyPlanService.createPlan(req.body);
      return res.status(201).json(successResponse(plan));
    } catch (error) {
      if (error.message.includes('billing_type') || error.message.includes('PER_') ||
          error.message.includes('Faixas') || error.message.includes('lives_') ||
          error.message.includes('unit_price')) {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async updatePlan(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const plan = await companyPlanService.updatePlan(id, req.body);
      return res.json(successResponse(plan));
    } catch (error) {
      if (error.message === 'Plan not found') {
        return res.status(404).json(errorResponse('Plano não encontrado', 'NOT_FOUND'));
      }
      if (error.message.includes('billing_type') || error.message.includes('PER_') ||
          error.message.includes('Faixas') || error.message.includes('lives_') ||
          error.message.includes('unit_price')) {
        return res.status(422).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const plan = await companyPlanService.updateStatus(id, req.body.active);
      return res.json(successResponse(plan));
    } catch (error) {
      if (error.message === 'Plan not found') {
        return res.status(404).json(errorResponse('Plano não encontrado', 'NOT_FOUND'));
      }
      if (error.message === 'Não é possível inativar plano com contrato vigente') {
        return res.status(422).json(errorResponse(error.message, 'UNPROCESSABLE'));
      }
      next(error);
    }
  }
}

module.exports = new AdminCompanyPlanController();
