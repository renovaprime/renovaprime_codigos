const meService = require('../services/meService');
const { successResponse, errorResponse } = require('../utils/response');

class MeController {
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await meService.getMe(userId);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const payload = req.body;
      const result = await meService.updateMe(userId, payload);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Email already in use') {
        return res.status(400).json(errorResponse('Este email já está em uso', 'EMAIL_IN_USE'));
      }
      next(error);
    }
  }

  async updateMyPassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const result = await meService.updatePassword(userId, currentPassword, newPassword);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json(errorResponse('Senha atual incorreta', 'INVALID_PASSWORD'));
      }
      next(error);
    }
  }
}

module.exports = new MeController();
