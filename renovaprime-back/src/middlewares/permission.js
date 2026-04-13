const { errorResponse } = require('../utils/response');

const permissionMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { roleName } = req.user;

      // allowedRoles pode ser string ou array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // Comparação case-insensitive
      const userRole = roleName.toLowerCase();
      const normalizedRoles = roles.map(role => role.toLowerCase());
      
      if (!normalizedRoles.includes(userRole)) {
        return res.status(403).json(errorResponse('Acesso negado', 'FORBIDDEN'));
      }

      next();
    } catch (error) {
      return res.status(500).json(errorResponse('Falha na verificação de permissão', 'INTERNAL_ERROR'));
    }
  };
};

module.exports = permissionMiddleware;
