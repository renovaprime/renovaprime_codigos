const partnerService = require('../services/partnerService');
const { successResponse, errorResponse } = require('../utils/response');

class PartnerController {
  // ==================== Partners ====================

  async listPartners(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        status: req.query.status
      };
      const partners = await partnerService.listPartners(filters);
      return res.json(successResponse(partners));
    } catch (error) {
      next(error);
    }
  }

  async getPartnerById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const partner = await partnerService.getPartnerById(id);
      return res.json(successResponse(partner));
    } catch (error) {
      if (error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createPartner(req, res, next) {
    try {
      const partner = await partnerService.createPartner(req.body);
      return res.status(201).json(successResponse(partner));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async updatePartner(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const partner = await partnerService.updatePartner(id, req.body);
      return res.json(successResponse(partner));
    } catch (error) {
      if (error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async togglePartner(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const partner = await partnerService.togglePartner(id);
      return res.json(successResponse(partner));
    } catch (error) {
      if (error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deletePartner(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await partnerService.deletePartner(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  // ==================== Branches ====================

  async listBranches(req, res, next) {
    try {
      const filters = {
        partner_id: req.query.partner_id || req.params.partnerId,
        name: req.query.name,
        status: req.query.status
      };
      const branches = await partnerService.listBranches(filters);
      return res.json(successResponse(branches));
    } catch (error) {
      next(error);
    }
  }

  async getBranchById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const branch = await partnerService.getBranchById(id);
      return res.json(successResponse(branch));
    } catch (error) {
      if (error.message === 'Branch not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createBranch(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.params.partnerId) {
        data.partner_id = parseInt(req.params.partnerId);
      }
      const branch = await partnerService.createBranch(data);
      return res.status(201).json(successResponse(branch));
    } catch (error) {
      if (error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async updateBranch(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const branch = await partnerService.updateBranch(id, req.body);
      return res.json(successResponse(branch));
    } catch (error) {
      if (error.message === 'Branch not found' || error.message === 'Partner not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async toggleBranch(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const branch = await partnerService.toggleBranch(id);
      return res.json(successResponse(branch));
    } catch (error) {
      if (error.message === 'Branch not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteBranch(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await partnerService.deleteBranch(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Branch not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  // ==================== Resellers ====================

  async listResellers(req, res, next) {
    try {
      const filters = {
        branch_id: req.query.branch_id || req.params.branchId,
        name: req.query.name,
        cpf: req.query.cpf,
        status: req.query.status
      };
      const resellers = await partnerService.listResellers(filters);
      return res.json(successResponse(resellers));
    } catch (error) {
      next(error);
    }
  }

  async getResellerById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const reseller = await partnerService.getResellerById(id);
      return res.json(successResponse(reseller));
    } catch (error) {
      if (error.message === 'Reseller not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createReseller(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.params.branchId) {
        data.branch_id = parseInt(req.params.branchId);
      }
      const reseller = await partnerService.createReseller(data);
      return res.status(201).json(successResponse(reseller));
    } catch (error) {
      if (error.message === 'Branch not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('CPF já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async updateReseller(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const reseller = await partnerService.updateReseller(id, req.body);
      return res.json(successResponse(reseller));
    } catch (error) {
      if (error.message === 'Reseller not found' || error.message === 'Branch not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('CPF já cadastrado', 'CONFLICT'));
      }
      next(error);
    }
  }

  async toggleReseller(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const reseller = await partnerService.toggleReseller(id);
      return res.json(successResponse(reseller));
    } catch (error) {
      if (error.message === 'Reseller not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteReseller(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      await partnerService.deleteReseller(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Reseller not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }
}

module.exports = new PartnerController();
