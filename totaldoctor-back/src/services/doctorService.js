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

  async listAppointments(doctorId, filters = {}) {
    const { Op } = require('sequelize');
    const { TeleconsultRoom } = require('../models');

    const where = { doctor_id: doctorId };

    // Filtro por data específica
    if (filters.date) {
      where.date = filters.date;
    }

    // Filtro por intervalo de datas
    if (filters.from && filters.to) {
      where.date = {
        [Op.between]: [filters.from, filters.to]
      };
    } else if (filters.from) {
      where.date = {
        [Op.gte]: filters.from
      };
    } else if (filters.to) {
      where.date = {
        [Op.lte]: filters.to
      };
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    return await Appointment.findAll({
      where,
      include: [
        {
          model: Patient,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        },
        { model: Specialty },
        { model: TeleconsultRoom }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });
  }

  async listAppointmentsHistory(doctorId, filters = {}) {
    const { Op } = require('sequelize');
    const { Beneficiary } = require('../models');

    // Sempre filtra por FINISHED ou CANCELED
    const where = {
      doctor_id: doctorId,
      status: { [Op.in]: ['FINISHED', 'CANCELED'] }
    };

    // Filtro por status específico (FINISHED ou CANCELED)
    if (filters.status && ['FINISHED', 'CANCELED'].includes(filters.status)) {
      where.status = filters.status;
    }

    // Filtro por intervalo de datas
    if (filters.startDate && filters.endDate) {
      where.date = { [Op.between]: [filters.startDate, filters.endDate] };
    } else if (filters.startDate) {
      where.date = { [Op.gte]: filters.startDate };
    } else if (filters.endDate) {
      where.date = { [Op.lte]: filters.endDate };
    }

    // Filtro por especialidade
    if (filters.specialtyId) {
      where.specialty_id = filters.specialtyId;
    }

    // Paginação
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    // Query base
    const queryOptions = {
      where,
      include: [
        { model: Specialty, attributes: ['id', 'name'] },
        { model: Beneficiary, attributes: ['id', 'name', 'cpf'] }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']],
      limit,
      offset
    };

    // Filtro por busca (nome do beneficiário)
    if (filters.search) {
      queryOptions.include[1].where = {
        name: { [Op.like]: `%${filters.search}%` }
      };
      queryOptions.include[1].required = true;
    }

    const { count, rows } = await Appointment.findAndCountAll(queryOptions);

    // Buscar logs para obter finished_at e canceled_at
    const appointmentIds = rows.map(a => a.id);
    const logs = await AppointmentLog.findAll({
      where: {
        appointment_id: { [Op.in]: appointmentIds },
        action: { [Op.in]: ['FINISHED', 'CANCELED'] }
      },
      order: [['created_at', 'DESC']]
    });

    // Mapear logs por appointment_id
    const logsMap = {};
    logs.forEach(log => {
      if (!logsMap[log.appointment_id]) {
        logsMap[log.appointment_id] = {};
      }
      if (log.action === 'FINISHED') {
        logsMap[log.appointment_id].finished_at = log.created_at;
      } else if (log.action === 'CANCELED') {
        logsMap[log.appointment_id].canceled_at = log.created_at;
      }
    });

    // Formatar resposta
    const items = rows.map(appointment => {
      const logData = logsMap[appointment.id] || {};
      return {
        id: appointment.id,
        status: appointment.status,
        type: appointment.type,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        specialty: appointment.Specialty ? {
          id: appointment.Specialty.id,
          name: appointment.Specialty.name
        } : null,
        beneficiary: appointment.Beneficiary ? {
          id: appointment.Beneficiary.id,
          name: appointment.Beneficiary.name,
          cpf: appointment.Beneficiary.cpf
        } : null,
        finished_at: logData.finished_at || (appointment.status === 'FINISHED' ? appointment.updated_at : null),
        canceled_at: logData.canceled_at || (appointment.status === 'CANCELED' ? appointment.updated_at : null)
      };
    });

    return {
      items,
      page,
      limit,
      total: count
    };
  }
}

module.exports = new DoctorService();
