const medicalRecordService = require('../services/medicalRecordService');
const consentService = require('../services/consentService');
const { successResponse, errorResponse } = require('../utils/response');

class MedicalRecordController {
  // --------------- Records ---------------

  async create(req, res, next) {
    try {
      const record = await medicalRecordService.createRecord(req.body, req.user.id, req);
      return res.status(201).json(successResponse(record));
    } catch (error) {
      if (error.message.includes('nao encontrada') || error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Ja existe') || error.message.includes('Somente consultas')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      if (error.message.includes('nao e o medico') || error.message.includes('Acesso negado')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const record = await medicalRecordService.updateRecord(recordId, req.body, req.user.id, req);
      return res.json(successResponse(record));
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('assinado')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      if (error.message.includes('nao e o medico')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async sign(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const record = await medicalRecordService.signRecord(recordId, req.user.id, req);
      return res.json(successResponse(record));
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('ja esta assinado') || error.message.includes('obrigatoria') || error.message.includes('obrigatorio')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      if (error.message.includes('nao e o medico')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const userRole = req.user.roleName.toLowerCase();
      const record = await medicalRecordService.getRecord(recordId, req.user.id, userRole, req);
      return res.json(successResponse(record));
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Acesso negado') {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async getByAppointment(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const userRole = req.user.roleName.toLowerCase();
      const record = await medicalRecordService.getRecordByAppointment(appointmentId, req.user.id, userRole);
      return res.json(successResponse(record));
    } catch (error) {
      next(error);
    }
  }

  async getPatientRecords(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.beneficiaryId);
      const userRole = req.user.roleName.toLowerCase();
      const records = await medicalRecordService.getPatientRecords(beneficiaryId, req.user.id, userRole, req);
      return res.json(successResponse(records));
    } catch (error) {
      if (error.message === 'Acesso negado') {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async getPatientSummary(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.beneficiaryId);
      const userRole = req.user.roleName.toLowerCase();
      const summary = await medicalRecordService.getPatientSummary(beneficiaryId, req.user.id, userRole);
      return res.json(successResponse(summary));
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  // --------------- Attachments ---------------

  async addAttachment(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const attachment = await medicalRecordService.addAttachment(recordId, req.body, req.user.id, req);
      return res.status(201).json(successResponse(attachment));
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('assinado')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      if (error.message.includes('nao e o medico')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async getAttachments(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const attachments = await medicalRecordService.getAttachments(recordId);
      return res.json(successResponse(attachments));
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const recordId = parseInt(req.params.recordId);
      const attachmentId = parseInt(req.params.attachmentId);
      await medicalRecordService.deleteAttachment(recordId, attachmentId, req.user.id);
      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('nao encontrado')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('assinado')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      if (error.message.includes('nao e o medico')) {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  // --------------- Audit ---------------

  async getAuditLogs(req, res, next) {
    try {
      const recordId = parseInt(req.params.id);
      const logs = await medicalRecordService.getAuditLogs(recordId);
      return res.json(successResponse(logs));
    } catch (error) {
      next(error);
    }
  }

  async getPatientAuditLogs(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.beneficiaryId);
      const logs = await medicalRecordService.getPatientAuditLogs(beneficiaryId);
      return res.json(successResponse(logs));
    } catch (error) {
      next(error);
    }
  }

  // --------------- Consent ---------------

  async createConsent(req, res, next) {
    try {
      const consent = await consentService.createConsent(req.body, req.user.id, req);
      return res.status(201).json(successResponse(consent));
    } catch (error) {
      if (error.message.includes('nao encontrad')) {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Acesso negado') {
        return res.status(403).json(errorResponse(error.message, 'FORBIDDEN'));
      }
      next(error);
    }
  }

  async getConsent(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const consent = await consentService.getConsentByAppointment(appointmentId);
      return res.json(successResponse(consent));
    } catch (error) {
      next(error);
    }
  }

  // --------------- Patient view ---------------

  async getMyRecords(req, res, next) {
    try {
      const records = await medicalRecordService.getMyRecords(req.user.id);
      return res.json(successResponse(records));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MedicalRecordController();
