const { errorResponse } = require('../utils/response');

const partnerPermission = (allowedTypes) => {
  return (req, res, next) => {
    try {
      const { entityType } = req.partnerAuth;
      const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

      if (!types.includes(entityType)) {
        return res.status(403).json(errorResponse('Acesso negado', 'FORBIDDEN'));
      }

      next();
    } catch (error) {
      return res.status(500).json(errorResponse('Falha na verificação de permissão', 'INTERNAL_ERROR'));
    }
  };
};

module.exports = partnerPermission;
