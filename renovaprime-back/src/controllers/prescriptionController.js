const prescriptionService = require('../services/prescriptionService');
const { successResponse, errorResponse } = require('../utils/response');

class PrescriptionController {
  async emit(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const { memed_prescription_id, memed_uuid, memed_patient_id, memed_payload } = req.body;

      const prescription = await prescriptionService.emitPrescription(
        appointmentId,
        memed_prescription_id,
        memed_uuid,
        memed_patient_id,
        memed_payload
      );
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
      const prescriptions = await prescriptionService.listByBeneficiary(req.user.id);
      return res.json(successResponse(prescriptions));
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptionById(req, res, next) {
    try {
      const prescriptionId = parseInt(req.params.prescriptionId);

      const prescription = await prescriptionService.getPrescriptionById(prescriptionId);

      if (!prescription) {
        return res.status(404).json(errorResponse('Prescription not found', 'NOT_FOUND'));
      }

      return res.json(successResponse(prescription));
    } catch (error) {
      next(error);
    }
  }

  async getPatientLink(req, res, next) {
    try {
      const prescriptionId = parseInt(req.params.prescriptionId);

      const result = await prescriptionService.getPatientLink(prescriptionId);

      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'Prescription not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Failed to get prescription link from Memed') {
        return res.status(502).json(errorResponse(error.message, 'MEMED_ERROR'));
      }
      next(error);
    }
  }

  async updateSignStatus(req, res, next) {
    try {
      const prescriptionId = parseInt(req.params.prescriptionId);
      const { signed } = req.body;

      await prescriptionService.updatePrescriptionStatus(prescriptionId, signed);

      const prescription = await prescriptionService.getPrescriptionById(prescriptionId);
      return res.json(successResponse(prescription));
    } catch (error) {
      next(error);
    }
  }

  async markDeleted(req, res, next) {
    try {
      const memedPrescriptionId = parseInt(req.params.memedPrescriptionId);

      await prescriptionService.markAsDeleted(memedPrescriptionId);

      return res.json(successResponse({ message: 'Prescricao marcada como excluida' }));
    } catch (error) {
      if (error.message === 'Prescription not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }
}

module.exports = new PrescriptionController();
