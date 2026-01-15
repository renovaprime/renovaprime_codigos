const { verifyToken } = require('../utils/jwt');
const { User, Role } = require('../models');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('No token provided', 'UNAUTHORIZED'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role }]
    });

    if (!user) {
      return res.status(401).json(errorResponse('User not found', 'UNAUTHORIZED'));
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json(errorResponse('User is blocked', 'FORBIDDEN'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.role_id,
      roleName: user.Role.name,
      status: user.status
    };

    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token', 'UNAUTHORIZED'));
  }
};

module.exports = authMiddleware;
