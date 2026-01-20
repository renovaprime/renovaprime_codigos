const teleconsultService = require('./teleconsultService');
const { successResponse, errorResponse } = require('../../utils/response');

class TeleconsultController {
  /**
   * GET /teleconsult/health
   * Health check do módulo teleconsult
   */
  async health(req, res) {
    return res.json(successResponse({
      ok: true,
      module: 'teleconsult',
      peer_path: process.env.PEERJS_PATH || '/peerjs'
    }));
  }

  /**
   * GET /teleconsult/room/:appointmentId
   * Retorna dados da sala de teleconsulta
   */
  async getRoom(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.roleName.toLowerCase();

      const roomData = await teleconsultService.getRoomData(
        parseInt(appointmentId),
        userId,
        userRole
      );

      return res.json(successResponse(roomData));
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      if (error.message.includes('canceled') || error.message.includes('finished')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  /**
   * POST /teleconsult/appointments/:appointmentId/end
   * Finaliza a teleconsulta (apenas médico)
   */
  async endTeleconsultation(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;

      const result = await teleconsultService.endTeleconsultation(
        parseInt(appointmentId),
        userId
      );

      return res.json(successResponse(result));
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      if (error.message.includes('Cannot end')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  /**
   * GET /teleconsult/appointments/:appointmentId/availability
   * Verifica se a teleconsulta está disponível para o paciente
   */
  async checkAvailability(req, res, next) {
    try {
      const { appointmentId } = req.params;

      const result = await teleconsultService.checkTeleconsultAvailability(
        parseInt(appointmentId)
      );

      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teleconsult/appointments/:appointmentId/register-peer
   * Registra o peer ID do médico quando ele conecta
   */
  async registerPeerId(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { peerId } = req.body;
      const userId = req.user.id;

      if (!peerId) {
        return res.status(400).json(errorResponse('peerId is required', 'VALIDATION_ERROR'));
      }

      const result = await teleconsultService.registerDoctorPeerId(
        parseInt(appointmentId),
        peerId,
        userId
      );

      return res.json(successResponse(result));
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }
}

module.exports = new TeleconsultController();
