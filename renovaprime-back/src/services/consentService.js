const { Consent, Appointment, Beneficiary } = require('../models');
const { Op } = require('sequelize');

class ConsentService {
  async createConsent(data, userId, req) {
    // Verificar que o appointment existe
    const appointment = await Appointment.findByPk(data.appointment_id);
    if (!appointment) throw new Error('Consulta nao encontrada');

    // Verificar que o beneficiary pertence ao user
    const beneficiary = await Beneficiary.findByPk(data.beneficiary_id);
    if (!beneficiary) throw new Error('Beneficiario nao encontrado');

    const userBeneficiaries = await Beneficiary.findAll({
      where: {
        [Op.or]: [{ user_id: userId }, { created_by: userId }],
      },
    });
    const beneficiaryIds = userBeneficiaries.map(b => b.id);
    if (!beneficiaryIds.includes(data.beneficiary_id)) {
      throw new Error('Acesso negado');
    }

    // Verificar se ja existe consent para este appointment
    const existing = await Consent.findOne({
      where: { appointment_id: data.appointment_id },
    });
    if (existing) return existing;

    const consent = await Consent.create({
      beneficiary_id: data.beneficiary_id,
      appointment_id: data.appointment_id,
      type: 'TELECONSULT',
      version: data.version,
      accepted: data.accepted,
      accepted_at: data.accepted ? new Date() : null,
      ip: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.headers?.['user-agent']?.substring(0, 500) || null,
    });

    return consent;
  }

  async getConsentByAppointment(appointmentId) {
    return await Consent.findOne({
      where: { appointment_id: appointmentId },
    });
  }
}

module.exports = new ConsentService();
