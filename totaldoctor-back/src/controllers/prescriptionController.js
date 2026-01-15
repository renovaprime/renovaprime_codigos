const prescriptionService = require('../services/prescriptionService');
const { Patient } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

class PrescriptionController {
  async emit(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const { external_id } = req.body;

      const prescription = await prescriptionService.emitPrescription(appointmentId, external_id);
      return res.status(201).json(successResponse(prescription));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('finished') || error.message.includes('already exists')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  async listByPatient(req, res, next) {
    try {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id }
      });

      if (!patient) {
        return res.status(404).json(errorResponse('Patient profile not found', 'NOT_FOUND'));
      }

      const prescriptions = await prescriptionService.listByPatient(patient.id);
      return res.json(successResponse(prescriptions));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PrescriptionController();
