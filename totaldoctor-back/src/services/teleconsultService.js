const sequelize = require('../config/database');
const { TeleconsultRoom, Appointment, Doctor, Patient } = require('../models');
const { v4: uuidv4 } = require('crypto');

class TeleconsultService {
  async getOrCreateRoom(appointmentId) {
    const transaction = await sequelize.transaction();

    try {
      let room = await TeleconsultRoom.findOne({
        where: { appointment_id: appointmentId }
      });

      if (room) {
        return room;
      }

      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const roomName = `room-${appointmentId}-${Date.now()}`;

      room = await TeleconsultRoom.create({
        appointment_id: appointmentId,
        room_name: roomName,
        doctor_link: roomName,
        patient_link: roomName
      }, { transaction });

      await transaction.commit();

      return room;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async validateAccess(appointmentId, userId) {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Doctor, include: [{ model: require('../models').User }] },
        { model: Patient, include: [{ model: require('../models').User }] }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const isDoctorUser = appointment.Doctor.User.id === userId;
    const isPatientUser = appointment.Patient.User.id === userId;

    if (!isDoctorUser && !isPatientUser) {
      throw new Error('Access denied');
    }

    return {
      hasAccess: true,
      role: isDoctorUser ? 'doctor' : 'patient'
    };
  }
}

module.exports = new TeleconsultService();
