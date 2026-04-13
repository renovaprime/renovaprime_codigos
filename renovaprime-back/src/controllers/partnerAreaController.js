const partnerAuthService = require('../services/partnerAuthService');
const partnerAreaService = require('../services/partnerAreaService');
const { successResponse, errorResponse } = require('../utils/response');
const {
  partnerLoginSchema,
  updatePartnerProfileSchema,
  updateBranchProfileSchema,
  updateResellerProfileSchema,
  changePasswordSchema
} = require('../validators/partnerAreaValidator');

class PartnerAreaController {
  async login(req, res, next) {
    try {
      const validated = partnerLoginSchema.parse(req.body);
      const result = await partnerAuthService.login(validated.email, validated.password);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
      }
      if (error.message === 'Credenciais inválidas' || error.message === 'Conta desativada') {
        return res.status(401).json(errorResponse(error.message, 'UNAUTHORIZED'));
      }
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await partnerAreaService.getProfile(req.partnerAuth);
      return res.json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const summary = await partnerAreaService.getDashboardSummary(req.partnerAuth);
      return res.json(successResponse(summary));
    } catch (error) {
      next(error);
    }
  }

  async getSales(req, res, next) {
    try {
      const filters = {
        branch_id: req.query.branch_id,
        reseller_id: req.query.reseller_id,
        plan_type: req.query.plan_type,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const sales = await partnerAreaService.getSales(req.partnerAuth, filters);
      return res.json(successResponse(sales));
    } catch (error) {
      next(error);
    }
  }

  async getSalesSummary(req, res, next) {
    try {
      const filters = {
        branch_id: req.query.branch_id,
        reseller_id: req.query.reseller_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const summary = await partnerAreaService.getSalesSummary(req.partnerAuth, filters);
      return res.json(successResponse(summary));
    } catch (error) {
      next(error);
    }
  }

  async getCommissions(req, res, next) {
    try {
      const filters = {
        branch_id: req.query.branch_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const commissions = await partnerAreaService.getCommissions(req.partnerAuth, filters);
      return res.json(successResponse(commissions));
    } catch (error) {
      next(error);
    }
  }

  async getBranches(req, res, next) {
    try {
      const branches = await partnerAreaService.getBranches(req.partnerAuth);
      return res.json(successResponse(branches));
    } catch (error) {
      next(error);
    }
  }

  async getResellers(req, res, next) {
    try {
      const resellers = await partnerAreaService.getResellers(req.partnerAuth);
      return res.json(successResponse(resellers));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      let schema;
      switch (req.partnerAuth.entityType) {
        case 'partner': schema = updatePartnerProfileSchema; break;
        case 'branch': schema = updateBranchProfileSchema; break;
        case 'reseller': schema = updateResellerProfileSchema; break;
        default:
          return res.status(400).json(errorResponse('Tipo de entidade inválido', 'INVALID_ENTITY'));
      }

      const validated = schema.parse(req.body);
      const profile = await partnerAreaService.updateProfile(req.partnerAuth, validated);
      return res.json(successResponse(profile));
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      await partnerAreaService.changePassword(req.partnerAuth, validated.currentPassword, validated.newPassword);
      return res.json(successResponse({ message: 'Senha alterada com sucesso' }));
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
      }
      if (error.message === 'Senha atual incorreta') {
        return res.status(400).json(errorResponse(error.message, 'INVALID_PASSWORD'));
      }
      next(error);
    }
  }
}

module.exports = new PartnerAreaController();
