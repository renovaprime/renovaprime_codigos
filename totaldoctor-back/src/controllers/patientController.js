const patientService = require('../services/patientService');
const { Patient } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

class PatientController {
  async create(req, res, next) {
    try {
      const patient = await patientService.createPatient(req.body);
      return res.status(201).json(successResponse(patient));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email already in use', 'CONFLICT'));
      }
      next(error);
    }
  }

  async listAppointments(req, res, next) {
    try {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id }
      });

      if (!patient) {
        return res.status(404).json(errorResponse('Patient profile not found', 'NOT_FOUND'));
      }

      const appointments = await patientService.listAppointments(patient.id);
      return res.json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientController();
