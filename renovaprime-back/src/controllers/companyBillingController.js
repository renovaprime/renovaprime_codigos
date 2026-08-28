const companyBillingService = require('../services/companyBillingService');
const companyWebhookService = require('../services/companyWebhookService');
const { successResponse, errorResponse } = require('../utils/response');

class CompanyBillingController {
  async billingPreview(req, res, next) {
    try {
      const companyId = parseInt(req.params.id, 10);
      const competence = req.query.competence || null;
      const preview = await companyBillingService.getBillingPreview(companyId, competence);
      return res.json(successResponse(preview));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.code === 'COMPANY_INACTIVE' ||
          error.code === 'NO_CONTRACT' ||
          error.code === 'NO_LIVES' ||
          error.code === 'NO_TIERS' ||
          error.code === 'VOLUME_ABOVE_TIER' ||
          error.code === 'ALREADY_BILLED') {
        return res.status(422).json(errorResponse(error.message, 'UNPROCESSABLE'));
      }
      next(error);
    }
  }

  async generateBilling(req, res, next) {
    try {
      const companyId = parseInt(req.params.id, 10);
      const competence = req.body?.competence || req.query.competence || null;
      const billing = await companyBillingService.generateMonthlyBillingForCompany(companyId, competence);
      return res.status(201).json(successResponse(billing));
    } catch (error) {
      if (error.message === 'Company not found') {
        return res.status(404).json(errorResponse('Empresa não encontrada', 'NOT_FOUND'));
      }
      if (error.code === 'COMPANY_INACTIVE' ||
          error.code === 'NO_CONTRACT' ||
          error.code === 'NO_LIVES' ||
          error.code === 'NO_TIERS' ||
          error.code === 'VOLUME_ABOVE_TIER' ||
          error.code === 'ALREADY_BILLED') {
        return res.status(422).json(errorResponse(error.message, 'UNPROCESSABLE'));
      }
      next(error);
    }
  }

  async listBillingsAdmin(req, res, next) {
    try {
      const companyId = parseInt(req.params.id, 10);
      const billings = await companyBillingService.listBillings(companyId);
      return res.json(successResponse(billings));
    } catch (error) {
      next(error);
    }
  }

  async listBillingsPortal(req, res, next) {
    try {
      const companyId = req.companyAuth.entityId;
      const billings = await companyBillingService.listBillingsForPortal(companyId);
      return res.json(successResponse(billings));
    } catch (error) {
      next(error);
    }
  }

  async getBillingByCompetencePortal(req, res, next) {
    try {
      const companyId = req.companyAuth.entityId;
      const { competence } = req.params;
      const billing = await companyBillingService.getBillingByCompetenceForPortal(companyId, competence);
      return res.json(successResponse(billing));
    } catch (error) {
      if (error.message === 'Billing not found') {
        return res.status(404).json(errorResponse('Fatura não encontrada', 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async handleAsaasWebhook(req, res) {
    try {
      const token = process.env.ASAAS_WEBHOOK_TOKEN;
      if (token) {
        const headerToken = req.headers['asaas-access-token'];
        if (headerToken !== token) {
          return res.status(401).json(errorResponse('Token inválido', 'UNAUTHORIZED'));
        }
      }

      const result = await companyWebhookService.processAsaasWebhook(req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Company webhook processing error:', error.message);
      return res.status(200).json({ error: error.message });
    }
  }
}

module.exports = new CompanyBillingController();
