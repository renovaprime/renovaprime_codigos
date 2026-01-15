const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'Invalid credentials' || error.message === 'User is blocked') {
        return res.status(401).json(errorResponse(error.message, 'UNAUTHORIZED'));
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
