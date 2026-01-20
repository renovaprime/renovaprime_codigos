const patientService = require('../services/patientService');
const availabilityService = require('../services/availabilityService');
const { successResponse, errorResponse } = require('../utils/response');

class PatientController {
  async getMyAppointments(req, res, next) {
    try {
      const appointments = await patientService.getMyAppointments(req.user.id);
      return res.json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const appointment = await patientService.createAppointment(req.body, req.user.id);
      return res.status(201).json(successResponse(appointment));
    } catch (error) {
      if (
        error.message.includes('past') ||
        error.message.includes('available') ||
        error.message.includes('not found') ||
        error.message.includes('does not belong')
      ) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async cancelMyAppointment(req, res, next) {
    try {
      const appointment = await patientService.cancelMyAppointment(req.params.id, req.user.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (
        error.message.includes('permission') ||
        error.message.includes('Only scheduled')
      ) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  async getMyBeneficiaries(req, res, next) {
    try {
      const beneficiaries = await patientService.getMyBeneficiaries(req.user.id);
      return res.json(successResponse(beneficiaries));
    } catch (error) {
      next(error);
    }
  }

  async getMonthAvailability(req, res, next) {
    try {
      const { specialtyId, yearMonth } = req.params;
      const [year, month] = yearMonth.split('-').map(Number);

      if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json(errorResponse('Invalid year-month format. Use YYYY-MM', 'VALIDATION_ERROR'));
      }

      const availableDays = await availabilityService.getAvailableMonthDays(
        parseInt(specialtyId),
        year,
        month
      );

      return res.json(successResponse(availableDays));
    } catch (error) {
      next(error);
    }
  }

  async getDaySlots(req, res, next) {
    try {
      const { specialtyId, date } = req.params;

      // Validar formato de data
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json(errorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'));
      }

      const slots = await availabilityService.getAvailableSlotsForDay(
        parseInt(specialtyId),
        date
      );

      return res.json(successResponse(slots));
    } catch (error) {
      next(error);
    }
  }

  async listSpecialties(req, res, next) {
    try {
      const specialties = await patientService.listSpecialties();
      return res.json(successResponse(specialties));
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentsHistory(req, res, next) {
    try {
      const filters = {
        beneficiaryId: req.query.beneficiaryId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        specialtyId: req.query.specialtyId,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await patientService.getAppointmentsHistory(req.user.id, filters);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message.includes('FORBIDDEN')) {
        return res.status(403).json(errorResponse('Beneficiary does not belong to this user', 'FORBIDDEN'));
      }
      next(error);
    }
  }
}

module.exports = new PatientController();
