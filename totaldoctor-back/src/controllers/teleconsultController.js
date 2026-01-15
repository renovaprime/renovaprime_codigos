const teleconsultService = require('../services/teleconsultService');
const { successResponse, errorResponse } = require('../utils/response');

class TeleconsultController {
  async getAccess(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);

      const access = await teleconsultService.validateAccess(appointmentId, req.user.id);

      if (!access.hasAccess) {
        return res.status(403).json(errorResponse('Access denied', 'FORBIDDEN'));
      }

      const room = await teleconsultService.getOrCreateRoom(appointmentId);

      return res.json(successResponse({
        room_name: room.room_name,
        role: access.role
      }));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Access denied') {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }
}

module.exports = new TeleconsultController();
