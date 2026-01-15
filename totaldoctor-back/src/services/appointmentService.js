const sequelize = require('../config/database');
const { Appointment, AppointmentLog, Doctor, DoctorSchedule, DoctorScheduleBlock, DoctorSpecialty } = require('../models');
const { Op } = require('sequelize');

class AppointmentService {
  async createAppointment(data, userId) {
    const transaction = await sequelize.transaction();

    try {
      await this.validateDoctorSpecialty(data.doctor_id, data.specialty_id);
      await this.validateDoctorAvailability(data);
      await this.validateScheduleConflict(data);

      const appointment = await Appointment.create({
        doctor_id: data.doctor_id,
        patient_id: data.patient_id,
        specialty_id: data.specialty_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        status: 'SCHEDULED'
      }, { transaction });

      await AppointmentLog.create({
        appointment_id: appointment.id,
        action: 'CREATED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      return appointment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async validateDoctorSpecialty(doctorId, specialtyId) {
    const hasSpecialty = await DoctorSpecialty.findOne({
      where: {
        doctor_id: doctorId,
        specialty_id: specialtyId
      }
    });

    if (!hasSpecialty) {
      throw new Error('Doctor does not have this specialty');
    }
  }

  async validateDoctorAvailability(data) {
    const appointmentDate = new Date(data.date);
    const weekday = appointmentDate.getDay();

    const schedule = await DoctorSchedule.findOne({
      where: {
        doctor_id: data.doctor_id,
        weekday: weekday
      }
    });

    if (!schedule) {
      throw new Error('Doctor is not available on this day');
    }

    if (data.start_time < schedule.start_time || data.end_time > schedule.end_time) {
      throw new Error('Appointment time outside doctor schedule');
    }

    const block = await DoctorScheduleBlock.findOne({
      where: {
        doctor_id: data.doctor_id,
        date: data.date,
        [Op.or]: [
          {
            start_time: { [Op.lte]: data.start_time },
            end_time: { [Op.gt]: data.start_time }
          },
          {
            start_time: { [Op.lt]: data.end_time },
            end_time: { [Op.gte]: data.end_time }
          }
        ]
      }
    });

    if (block) {
      throw new Error('Doctor has a schedule block at this time');
    }
  }

  async validateScheduleConflict(data) {
    const conflict = await Appointment.findOne({
      where: {
        doctor_id: data.doctor_id,
        date: data.date,
        status: { [Op.ne]: 'CANCELED' },
        [Op.or]: [
          {
            start_time: { [Op.lte]: data.start_time },
            end_time: { [Op.gt]: data.start_time }
          },
          {
            start_time: { [Op.lt]: data.end_time },
            end_time: { [Op.gte]: data.end_time }
          }
        ]
      }
    });

    if (conflict) {
      throw new Error('Schedule conflict detected');
    }
  }

  async startAppointment(appointmentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'SCHEDULED') {
        throw new Error('Only scheduled appointments can be started');
      }

      await appointment.update({ status: 'IN_PROGRESS' }, { transaction });

      await AppointmentLog.create({
        appointment_id: appointmentId,
        action: 'STARTED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      return appointment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async finishAppointment(appointmentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'IN_PROGRESS') {
        throw new Error('Only in-progress appointments can be finished');
      }

      await appointment.update({ status: 'FINISHED' }, { transaction });

      await AppointmentLog.create({
        appointment_id: appointmentId,
        action: 'FINISHED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      return appointment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cancelAppointment(appointmentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status === 'FINISHED' || appointment.status === 'CANCELED') {
        throw new Error('Cannot cancel finished or already canceled appointment');
      }

      await appointment.update({ status: 'CANCELED' }, { transaction });

      await AppointmentLog.create({
        appointment_id: appointmentId,
        action: 'CANCELED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      return appointment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new AppointmentService();
