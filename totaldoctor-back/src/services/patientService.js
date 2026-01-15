const sequelize = require('../config/database');
const { User, Patient, Appointment, Doctor, Specialty, Role } = require('../models');
const { hashPassword } = require('../utils/hash');

class PatientService {
  async createPatient(data) {
    const transaction = await sequelize.transaction();

    try {
      const hashedPassword = await hashPassword(data.password);

      const patientRole = await Role.findOne({
        where: { name: 'PACIENTE' }
      });

      if (!patientRole) {
        throw new Error('Patient role not found');
      }

      const user = await User.create({
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        role_id: patientRole.id,
        status: 'ACTIVE'
      }, { transaction });

      const patient = await Patient.create({
        user_id: user.id,
        birth_date: data.birth_date,
        phone: data.phone
      }, { transaction });

      await transaction.commit();

      return {
        id: patient.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        birth_date: patient.birth_date,
        phone: patient.phone
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listAppointments(patientId) {
    return await Appointment.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Doctor, include: [{ model: User }] },
        { model: Specialty }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  }
}

module.exports = new PatientService();
