const { verifyToken } = require('../utils/jwt');
const { Company } = require('../models');
const { errorResponse } = require('../utils/response');

const companyAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Token não fornecido', 'UNAUTHORIZED'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.entityType !== 'company') {
      return res.status(401).json(errorResponse('Token inválido', 'UNAUTHORIZED'));
    }

    const company = await Company.findByPk(decoded.entityId);

    if (!company) {
      return res.status(401).json(errorResponse('Empresa não encontrada', 'UNAUTHORIZED'));
    }

    if (!company.active) {
      return res.status(403).json(errorResponse('Empresa inativa. Entre em contato com o administrador.', 'FORBIDDEN'));
    }

    req.companyAuth = {
      entityType: 'company',
      entityId: company.id,
      name: company.trade_name,
      email: company.responsible_email
    };

    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Token inválido ou expirado', 'UNAUTHORIZED'));
  }
};

module.exports = companyAuthMiddleware;
