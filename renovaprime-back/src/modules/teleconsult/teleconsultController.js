const teleconsultService = require('./teleconsultService');
const { successResponse, errorResponse } = require('../../utils/response');

const log = (...args) => console.log('[Teleconsult:HTTP]', ...args);

class TeleconsultController {
  /**
   * GET /teleconsult/health
   * Health check do módulo teleconsult
   */
  async health(req, res) {
    return res.json(successResponse({
      ok: true,
      module: 'teleconsult',
      provider: 'twilio'
    }));
  }

  /**
   * GET /teleconsult/room/:appointmentId
   * Retorna dados da sala de teleconsulta para Twilio
   */
  async getRoom(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.roleName.toLowerCase();

      log('GET /room/:appointmentId', { appointmentId, userId, userRole });

      const roomData = await teleconsultService.getRoomData(
        parseInt(appointmentId),
        userId,
        userRole
      );

      log('GET /room/:appointmentId -> 200', { appointmentId, roomName: roomData.roomName, role: roomData.role });
      return res.json(successResponse(roomData));
    } catch (error) {
      log('GET /room/:appointmentId -> error', { appointmentId: req.params.appointmentId, message: error.message });
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

      log('POST /appointments/:appointmentId/end', { appointmentId, userId });

      const result = await teleconsultService.endTeleconsultation(
        parseInt(appointmentId),
        userId
      );

      log('POST /appointments/:appointmentId/end -> 200', { appointmentId, result });
      return res.json(successResponse(result));
    } catch (error) {
      log('POST /appointments/:appointmentId/end -> error', { appointmentId: req.params.appointmentId, message: error.message });
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

      const noisyWait =
        result.available === false &&
        result.reason === 'Waiting for doctor to start the consultation';
      if (!noisyWait) {
        log('GET /appointments/:appointmentId/availability -> 200', {
          appointmentId,
          userId: req.user?.id,
          ...result
        });
      }
      return res.json(successResponse(result));
    } catch (error) {
      log('GET /appointments/:appointmentId/availability -> error', { appointmentId: req.params.appointmentId, message: error.message });
      next(error);
    }
  }
}

module.exports = new TeleconsultController();
