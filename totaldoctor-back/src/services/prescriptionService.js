const sequelize = require('../config/database');
const { Prescription, Appointment, Patient } = require('../models');

class PrescriptionService {
  async emitPrescription(appointmentId, externalId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'FINISHED') {
        throw new Error('Only finished appointments can have prescriptions');
      }

      const existingPrescription = await Prescription.findOne({
        where: { appointment_id: appointmentId }
      });

      if (existingPrescription) {
        throw new Error('Prescription already exists for this appointment');
      }

      const prescription = await Prescription.create({
        appointment_id: appointmentId,
        external_id: externalId,
        issued_at: new Date()
      }, { transaction });

      await transaction.commit();

      return prescription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listByPatient(patientId) {
    return await Prescription.findAll({
      include: [{
        model: Appointment,
        where: { patient_id: patientId },
        include: [
          { model: require('../models').Doctor, include: [{ model: require('../models').User }] },
          { model: require('../models').Specialty }
        ]
      }],
      order: [['issued_at', 'DESC']]
    });
  }
}

module.exports = new PrescriptionService();
