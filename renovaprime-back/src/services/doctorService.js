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
    const { TeleconsultRoom, Beneficiary } = require('../models');

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
          required: false,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        },
        {
          model: Beneficiary,
          required: false,
          attributes: ['id', 'name', 'cpf', 'phone']
        },
        { model: Specialty },
        { model: TeleconsultRoom }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });
  }

  async getDashboard(doctorId) {
    const { QueryTypes, Op } = require('sequelize');
    const { Beneficiary, TeleconsultRoom } = require('../models');

    // Busca dados da view do dashboard
    const [dashboardData] = await sequelize.query(
      'SELECT * FROM vw_doctor_dashboard WHERE doctor_id = :doctorId',
      {
        replacements: { doctorId },
        type: QueryTypes.SELECT
      }
    );

    if (!dashboardData) {
      return {
        today: {
          total: 0,
          scheduled: 0,
          inProgress: 0,
          finished: 0
        },
        currentAppointment: null,
        nextAppointment: null,
        finishedAppointments: []
      };
    }

    let currentAppointment = null;
    let nextAppointment = null;

    // Busca detalhes da consulta em andamento
    if (dashboardData.current_appointment_id) {
      currentAppointment = await Appointment.findByPk(dashboardData.current_appointment_id, {
        include: [
          { model: Beneficiary, attributes: ['id', 'name', 'cpf', 'phone'] },
          { model: Specialty, attributes: ['id', 'name'] },
          { model: TeleconsultRoom }
        ]
      });
    }

    // Busca detalhes da próxima consulta
    if (dashboardData.next_appointment_id) {
      nextAppointment = await Appointment.findByPk(dashboardData.next_appointment_id, {
        include: [
          { model: Beneficiary, attributes: ['id', 'name', 'cpf', 'phone'] },
          { model: Specialty, attributes: ['id', 'name'] },
          { model: TeleconsultRoom }
        ]
      });
    }

    // Busca consultas finalizadas do dia
    const today = new Date().toISOString().split('T')[0];
    const finishedAppointmentsData = await Appointment.findAll({
      where: {
        doctor_id: doctorId,
        date: today,
        status: { [Op.in]: ['FINISHED', 'CANCELED'] }
      },
      include: [
        { model: Beneficiary, attributes: ['id', 'name', 'cpf', 'phone'] },
        { model: Specialty, attributes: ['id', 'name'] },
        { model: TeleconsultRoom }
      ],
      order: [['start_time', 'DESC']]
    });

    const formatAppointment = (appointment) => ({
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      type: appointment.type,
      status: appointment.status,
      beneficiary: appointment.Beneficiary ? {
        id: appointment.Beneficiary.id,
        name: appointment.Beneficiary.name,
        cpf: appointment.Beneficiary.cpf,
        phone: appointment.Beneficiary.phone
      } : null,
      specialty: appointment.Specialty ? {
        id: appointment.Specialty.id,
        name: appointment.Specialty.name
      } : null,
      teleconsultRoom: appointment.TeleconsultRoom ? {
        id: appointment.TeleconsultRoom.id,
        roomName: appointment.TeleconsultRoom.room_name,
        doctorLink: appointment.TeleconsultRoom.doctor_link
      } : null
    });

    return {
      today: {
        total: parseInt(dashboardData.today_total) || 0,
        scheduled: parseInt(dashboardData.today_scheduled) || 0,
        inProgress: parseInt(dashboardData.today_in_progress) || 0,
        finished: parseInt(dashboardData.today_finished) || 0
      },
      currentAppointment: currentAppointment ? formatAppointment(currentAppointment) : null,
      nextAppointment: nextAppointment ? formatAppointment(nextAppointment) : null,
      finishedAppointments: finishedAppointmentsData.map(formatAppointment)
    };
  }

  async listPatientsWithAppointments(doctorId) {
    const { Op } = require('sequelize');
    const { Beneficiary, Patient, User } = require('../models');

    const appointments = await Appointment.findAll({
      where: {
        doctor_id: doctorId,
        status: { [Op.in]: ['FINISHED', 'IN_PROGRESS'] }
      },
      include: [
        {
          model: Beneficiary,
          required: false,
          attributes: ['id', 'name', 'cpf']
        },
        {
          model: Patient,
          required: false,
          include: [{ model: User, attributes: ['id', 'name'] }]
        },
        { model: Specialty, attributes: ['id', 'name'] },
        { model: require('../models').Prescription, required: false }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });

    const patientsMap = {};

    appointments.forEach(appointment => {
      const beneficiary = appointment.Beneficiary;
      const patient = appointment.Patient;
      const specialty = appointment.Specialty;
      const hasPrescription = appointment.Prescription !== null;

      let patientKey;
      let name;
      let cpf;

      if (beneficiary) {
        patientKey = `beneficiary_${beneficiary.id}`;
        name = beneficiary.name;
        cpf = beneficiary.cpf;
      } else if (patient) {
        patientKey = `patient_${patient.id}`;
        name = patient.User?.name || null;
        cpf = patient.cpf || null;
      } else {
        return;
      }

      if (!patientsMap[patientKey]) {
        patientsMap[patientKey] = {
          name,
          cpf: cpf || 'N/A',
          lastAppointmentDate: appointment.date,
          lastAppointmentTime: appointment.start_time,
          specialty: specialty ? {
            id: specialty.id,
            name: specialty.name
          } : null,
          hasPrescription,
          beneficiaryId: beneficiary ? beneficiary.id : null,
          patientId: patient ? patient.id : null
        };
      }
    });

    return Object.values(patientsMap).sort((a, b) => {
      const dateA = new Date(`${a.lastAppointmentDate}T${a.lastAppointmentTime}`);
      const dateB = new Date(`${b.lastAppointmentDate}T${b.lastAppointmentTime}`);
      return dateB - dateA;
    });
  }

  async listPrescriptionsByPatient(doctorId, beneficiaryId, patientId) {
    const { Op } = require('sequelize');
    const { Beneficiary, Prescription } = require('../models');

    if (!beneficiaryId && !patientId) {
      throw new Error('Either beneficiaryId or patientId must be provided');
    }

    const whereCondition = {
      doctor_id: doctorId
    };

    if (beneficiaryId) {
      whereCondition.beneficiary_id = beneficiaryId;
    } else if (patientId) {
      whereCondition.patient_id = patientId;
    }

    const prescriptions = await Prescription.findAll({
      include: [{
        model: Appointment,
        where: whereCondition,
        include: [
          { model: Specialty, attributes: ['id', 'name'] }
        ]
      }],
      order: [['issued_at', 'DESC']]
    });

    return prescriptions.map(prescription => ({
      id: prescription.id,
      memed_prescription_id: prescription.memed_prescription_id,
      memed_uuid: prescription.memed_uuid,
      issued_at: prescription.issued_at,
      signed: prescription.signed,
      appointment: {
        date: prescription.Appointment.date,
        start_time: prescription.Appointment.start_time,
        specialty: prescription.Appointment.Specialty ? {
          id: prescription.Appointment.Specialty.id,
          name: prescription.Appointment.Specialty.name
        } : null
      }
    }));
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
