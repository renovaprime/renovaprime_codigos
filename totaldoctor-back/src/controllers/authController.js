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

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword } = req.body;
      const result = await authService.resetPassword(email, code, newPassword);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'Codigo invalido ou expirado') {
        return res.status(400).json(errorResponse(error.message, 'INVALID_CODE'));
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
