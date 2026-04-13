const sequelize = require('../config/database');
const { Prescription, Appointment, Beneficiary } = require('../models');
const { Op } = require('sequelize');

class PrescriptionService {
  async emitPrescription(appointmentId, memed_prescription_id, memed_uuid, memed_patient_id, memed_payload) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'IN_PROGRESS' && appointment.status !== 'FINISHED') {
        throw new Error('Only in-progress or finished appointments can have prescriptions');
      }

      const prescription = await Prescription.create({
        appointment_id: appointmentId,
        memed_prescription_id,
        memed_uuid,
        memed_patient_id: memed_patient_id || null,
        signed: false,
        memed_payload,
        issued_at: new Date()
      }, { transaction });

      await transaction.commit();

      return prescription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listByBeneficiary(userId) {
    return await Prescription.findAll({
      include: [{
        model: Appointment,
        // Garante que só retorne Prescription quando houver Appointment
        // associado ao Beneficiary correto. Sem isso, o Appointment pode vir `null`
        // e os relacionamentos de médico/especialidade ficam indisponíveis no front.
        required: true,
        include: [{
          model: Beneficiary,
          required: true,
          where: {
            [Op.or]: [
              // Alguns fluxos vinculam o usuário logado em `user_id`
              { user_id: userId },
              // Outros fluxos usam `created_by` para titular/dependentes
              { created_by: userId }
            ]
          }
        },
        { model: require('../models').Doctor, include: [{ model: require('../models').User }], required: true },
        { model: require('../models').Specialty, required: true }
        ]
      }],
      order: [['issued_at', 'DESC']]
    });
  }

  async getPrescriptionByUuid(memed_uuid) {
    return await Prescription.findOne({
      where: { memed_uuid }
    });
  }

  async updatePrescriptionStatus(prescriptionId, signed) {
    return await Prescription.update(
      { signed },
      { where: { id: prescriptionId } }
    );
  }

  async getPatientLink(prescriptionId) {
    const prescription = await Prescription.findByPk(prescriptionId);

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Se já tem link em cache, retorna do DB
    if (prescription.memed_patient_link) {
      return {
        link: prescription.memed_patient_link,
        digits: prescription.memed_patient_digits
      };
    }

    // Senão, busca na API da Memed
    const memedService = require('./memedService');
    const result = await memedService.getDigitalPrescriptionLink(prescription.memed_prescription_id);

    if (!result || !result.link) {
      throw new Error('Failed to get prescription link from Memed');
    }

    // Salva em cache no DB
    await Prescription.update(
      {
        memed_patient_link: result.link,
        memed_patient_digits: result.digits
      },
      { where: { id: prescriptionId } }
    );

    return {
      link: result.link,
      digits: result.digits
    };
  }

  async getPrescriptionById(prescriptionId) {
    return await Prescription.findByPk(prescriptionId, {
      include: [{
        model: Appointment,
        include: [
          { model: require('../models').Doctor, include: [{ model: require('../models').User }] },
          { model: require('../models').Specialty }
        ]
      }]
    });
  }

  async markAsDeleted(memedPrescriptionId) {
    const prescription = await Prescription.findOne({
      where: { memed_prescription_id: memedPrescriptionId }
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    await prescription.update({ deleted_at: new Date() });

    return prescription;
  }
}

module.exports = new PrescriptionService();
