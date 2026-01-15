const sequelize = require('../config/database');
const { User, Doctor, DoctorSchedule, DoctorScheduleBlock, Appointment, Patient, Specialty, AppointmentLog, Role } = require('../models');
const { hashPassword } = require('../utils/hash');

class DoctorService {
  async registerDoctor(data) {
    const transaction = await sequelize.transaction();

    try {
      const hashedPassword = await hashPassword(data.password);

      const doctorRole = await Role.findOne({
        where: { name: 'MEDICO' }
      });

      if (!doctorRole) {
        throw new Error('Doctor role not found');
      }

      const user = await User.create({
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        role_id: doctorRole.id,
        status: 'PENDING'
      }, { transaction });

      const doctor = await Doctor.create({
        user_id: user.id,
        crm: data.crm,
        crm_uf: data.crm_uf
      }, { transaction });

      await transaction.commit();

      return {
        id: doctor.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        crm: doctor.crm,
        crm_uf: doctor.crm_uf,
        status: user.status
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async approveDoctor(doctorId, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{ model: User }]
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      await doctor.update({
        approved_at: new Date()
      }, { transaction });

      await doctor.User.update({
        status: 'ACTIVE'
      }, { transaction });

      await transaction.commit();

      return doctor;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async configureSchedule(doctorId, schedules) {
    const transaction = await sequelize.transaction();

    try {
      await DoctorSchedule.destroy({
        where: { doctor_id: doctorId },
        transaction
      });

      const createdSchedules = await DoctorSchedule.bulkCreate(
        schedules.map(s => ({
          doctor_id: doctorId,
          weekday: s.weekday,
          start_time: s.start_time,
          end_time: s.end_time
        })),
        { transaction }
      );

      await transaction.commit();

      return createdSchedules;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getSchedules(doctorId) {
    return await DoctorSchedule.findAll({
      where: { doctor_id: doctorId },
      order: [['weekday', 'ASC'], ['start_time', 'ASC']]
    });
  }

  async getScheduleBlocks(doctorId) {
    return await DoctorScheduleBlock.findAll({
      where: { doctor_id: doctorId },
      order: [['date', 'DESC']]
    });
  }

  async createScheduleBlock(doctorId, data) {
    return await DoctorScheduleBlock.create({
      doctor_id: doctorId,
      date: data.date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      reason: data.reason || null
    });
  }

  async updateScheduleBlock(doctorId, blockId, data) {
    const block = await DoctorScheduleBlock.findOne({
      where: { 
        id: blockId,
        doctor_id: doctorId 
      }
    });

    if (!block) {
      throw new Error('Schedule block not found');
    }

    await block.update({
      date: data.date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      reason: data.reason || null
    });

    return block;
  }

  async deleteScheduleBlock(doctorId, blockId) {
    const block = await DoctorScheduleBlock.findOne({
      where: { 
        id: blockId,
        doctor_id: doctorId 
      }
    });

    if (!block) {
      throw new Error('Schedule block not found');
    }

    await block.destroy();
    return true;
  }

  async listAppointments(doctorId) {
    return await Appointment.findAll({
      where: { doctor_id: doctorId },
      include: [
        { model: Patient, include: [{ model: User }] },
        { model: Specialty }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  }
}

module.exports = new DoctorService();
