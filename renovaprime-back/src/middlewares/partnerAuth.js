const { verifyToken } = require('../utils/jwt');
const { Partner, PartnerBranch, Reseller } = require('../models');
const { errorResponse } = require('../utils/response');

const partnerAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Token não fornecido', 'UNAUTHORIZED'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded.entityType) {
      return res.status(401).json(errorResponse('Token inválido', 'UNAUTHORIZED'));
    }

    let entity;
    switch (decoded.entityType) {
      case 'partner':
        entity = await Partner.findByPk(decoded.entityId);
        break;
      case 'branch':
        entity = await PartnerBranch.findByPk(decoded.entityId);
        break;
      case 'reseller':
        entity = await Reseller.findByPk(decoded.entityId);
        break;
      default:
        return res.status(401).json(errorResponse('Tipo de entidade inválido', 'UNAUTHORIZED'));
    }

    if (!entity) {
      return res.status(401).json(errorResponse('Entidade não encontrada', 'UNAUTHORIZED'));
    }

    if (!entity.active) {
      return res.status(403).json(errorResponse('Conta desativada', 'FORBIDDEN'));
    }

    req.partnerAuth = {
      entityType: decoded.entityType,
      entityId: decoded.entityId,
      partnerId: decoded.partnerId,
      branchId: decoded.branchId,
      name: entity.name,
      email: entity.email
    };

    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Token inválido ou expirado', 'UNAUTHORIZED'));
  }
};

module.exports = partnerAuthMiddleware;
