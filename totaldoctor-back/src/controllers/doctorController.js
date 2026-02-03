const doctorService = require('../services/doctorService');
const { successResponse, errorResponse } = require('../utils/response');

class DoctorController {
  async register(req, res, next) {
    try {
      const doctor = await doctorService.registerDoctor(req.body);
      return res.status(201).json(successResponse(doctor));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email already in use', 'CONFLICT'));
      }
      next(error);
    }
  }

  async configureSchedule(req, res, next) {
    try {
      const schedules = await doctorService.configureSchedule(req.doctor.id, req.body.schedules);
      return res.json(successResponse(schedules));
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req, res, next) {
    try {
      const schedules = await doctorService.getSchedules(req.doctor.id);
      return res.json(successResponse(schedules));
    } catch (error) {
      next(error);
    }
  }

  async getScheduleBlocks(req, res, next) {
    try {
      const blocks = await doctorService.getScheduleBlocks(req.doctor.id);
      return res.json(successResponse(blocks));
    } catch (error) {
      next(error);
    }
  }

  async createScheduleBlock(req, res, next) {
    try {
      const block = await doctorService.createScheduleBlock(req.doctor.id, req.body);
      return res.status(201).json(successResponse(block));
    } catch (error) {
      next(error);
    }
  }

  async updateScheduleBlock(req, res, next) {
    try {
      const block = await doctorService.updateScheduleBlock(
        req.doctor.id, 
        req.params.id, 
        req.body
      );
      return res.json(successResponse(block));
    } catch (error) {
      if (error.message === 'Schedule block not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteScheduleBlock(req, res, next) {
    try {
      await doctorService.deleteScheduleBlock(req.doctor.id, req.params.id);
      return res.json(successResponse({ message: 'Schedule block deleted successfully' }));
    } catch (error) {
      if (error.message === 'Schedule block not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async listAppointments(req, res, next) {
    try {
      const filters = {
        date: req.query.date,
        from: req.query.from,
        to: req.query.to,
        status: req.query.status
      };
      const appointments = await doctorService.listAppointments(req.doctor.id, filters);
      return res.json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await doctorService.getDashboard(req.doctor.id);
      return res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }

  async listAppointmentsHistory(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        specialtyId: req.query.specialtyId,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await doctorService.listAppointmentsHistory(req.doctor.id, filters);
      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DoctorController();
