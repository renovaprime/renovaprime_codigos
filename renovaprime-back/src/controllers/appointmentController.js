const appointmentService = require('../services/appointmentService');
const { successResponse, errorResponse } = require('../utils/response');

class AppointmentController {
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(req.body, req.user.id);
      return res.status(201).json(successResponse(appointment));
    } catch (error) {
      if (error.message.includes('specialty') || error.message.includes('available') || error.message.includes('conflict')) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async start(req, res, next) {
    try {
      const appointment = await appointmentService.startAppointment(req.params.id, req.user.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      if (error.message.includes('scheduled')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  async finish(req, res, next) {
    try {
      const appointment = await appointmentService.finishAppointment(req.params.id, req.user.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      if (error.message.includes('progress')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('cancel')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }
}

module.exports = new AppointmentController();
