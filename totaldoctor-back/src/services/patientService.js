const sequelize = require('../config/database');
const { Appointment, AppointmentLog, Doctor, Specialty, Beneficiary, User, TeleconsultRoom } = require('../models');
const { Op } = require('sequelize');
const availabilityService = require('./availabilityService');

class PatientService {
  /**
   * Lista consultas pendentes do beneficiário logado
   */
  async getMyAppointments(userId) {
    // Buscar beneficiário associado ao user_id
    const beneficiary = await Beneficiary.findOne({
      where: { user_id: userId }
    });

    if (!beneficiary) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.findAll({
      where: {
        beneficiary_id: beneficiary.id,
        status: { [Op.in]: ['SCHEDULED', 'IN_PROGRESS'] },
        date: { [Op.gte]: today }
      },
      include: [
        {
          model: Doctor,
          attributes: ['id', 'photo_url'],
          include: [
            {
              model: User,
              attributes: ['name']
            }
          ]
        },
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: TeleconsultRoom,
          attributes: ['id', 'patient_link'],
          required: false
        }
      ],
      order: [
        ['date', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    // Formatar resposta
    return appointments.map(apt => ({
      id: apt.id,
      doctor_id: apt.doctor_id,
      patient_id: apt.patient_id,
      beneficiary_id: apt.beneficiary_id,
      specialty_id: apt.specialty_id,
      date: apt.date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      type: apt.type,
      status: apt.status,
      created_at: apt.created_at,
      updated_at: apt.updated_at,
      doctor: apt.Doctor ? {
        id: apt.Doctor.id,
        name: apt.Doctor.User ? apt.Doctor.User.name : null,
        photo_url: apt.Doctor.photo_url
      } : null,
      specialty: apt.Specialty ? {
        id: apt.Specialty.id,
        name: apt.Specialty.name
      } : null,
      teleconsult_room: apt.TeleconsultRoom ? {
        id: apt.TeleconsultRoom.id,
        patient_link: apt.TeleconsultRoom.patient_link
      } : null
    }));
  }

  /**
   * Cria novo agendamento para o beneficiário
   */
  async createAppointment(data, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Validar data não está no passado
      const appointmentDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error('Cannot schedule appointments in the past');
      }

      // Buscar beneficiário do usuário
      let beneficiaryId = data.beneficiary_id;
      
      if (!beneficiaryId) {
        const beneficiary = await Beneficiary.findOne({
          where: { user_id: userId, type: 'TITULAR' }
        });

        if (!beneficiary) {
          throw new Error('Beneficiary not found for this user');
        }

        beneficiaryId = beneficiary.id;
      } else {
        // Verificar se o beneficiary_id pertence ao user
        const beneficiary = await Beneficiary.findOne({
          where: { 
            id: beneficiaryId,
            [Op.or]: [
              { user_id: userId },
              { 
                titular_id: {
                  [Op.in]: sequelize.literal(
                    `(SELECT id FROM beneficiaries WHERE user_id = ${userId} AND type = 'TITULAR')`
                  )
                }
              }
            ]
          }
        });

        if (!beneficiary) {
          throw new Error('Beneficiary does not belong to this user');
        }
      }

      // Encontrar melhor médico disponível
      const doctorId = await availabilityService.findBestDoctorForSlot(
        data.specialty_id,
        data.date,
        data.start_time
      );

      if (!doctorId) {
        throw new Error('No doctor available for this time slot');
      }

      // Calcular end_time (30 minutos padrão)
      const startMinutes = availabilityService.timeToMinutes(data.start_time);
      const endTime = availabilityService.minutesToTime(startMinutes + 30);

      // Criar appointment
      const appointment = await Appointment.create({
        doctor_id: doctorId,
        patient_id: null, // Novo sistema usa beneficiary_id
        beneficiary_id: beneficiaryId,
        specialty_id: data.specialty_id,
        date: data.date,
        start_time: data.start_time,
        end_time: endTime,
        type: 'ONLINE',
        status: 'SCHEDULED'
      }, { transaction });

      // Criar log
      await AppointmentLog.create({
        appointment_id: appointment.id,
        action: 'CREATED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      // Retornar appointment com relacionamentos
      return this.getAppointmentById(appointment.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancela consulta do beneficiário
   */
  async cancelMyAppointment(appointmentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Verificar se o appointment pertence ao usuário
      const beneficiary = await Beneficiary.findOne({
        where: { 
          id: appointment.beneficiary_id,
          [Op.or]: [
            { user_id: userId },
            { 
              titular_id: {
                [Op.in]: sequelize.literal(
                  `(SELECT id FROM beneficiaries WHERE user_id = ${userId} AND type = 'TITULAR')`
                )
              }
            }
          ]
        }
      });

      if (!beneficiary) {
        throw new Error('You do not have permission to cancel this appointment');
      }

      if (appointment.status !== 'SCHEDULED') {
        throw new Error('Only scheduled appointments can be canceled');
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

  /**
   * Lista beneficiários do usuário (titular + dependentes)
   */
  async getMyBeneficiaries(userId) {
    // Buscar titular
    const titular = await Beneficiary.findOne({
      where: { 
        user_id: userId,
        type: 'TITULAR',
        status: 'ACTIVE'
      }
    });

    if (!titular) {
      return [];
    }

    // Buscar dependentes
    const dependents = await Beneficiary.findAll({
      where: {
        titular_id: titular.id,
        status: 'ACTIVE'
      },
      order: [['name', 'ASC']]
    });

    return [titular, ...dependents];
  }

  /**
   * Busca appointment por ID com relacionamentos
   */
  async getAppointmentById(id) {
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Doctor,
          attributes: ['id', 'photo_url'],
          include: [
            {
              model: User,
              attributes: ['name']
            }
          ]
        },
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: TeleconsultRoom,
          attributes: ['id', 'patient_link'],
          required: false
        }
      ]
    });

    if (!appointment) {
      return null;
    }

    return {
      id: appointment.id,
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      beneficiary_id: appointment.beneficiary_id,
      specialty_id: appointment.specialty_id,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      type: appointment.type,
      status: appointment.status,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      doctor: appointment.Doctor ? {
        id: appointment.Doctor.id,
        name: appointment.Doctor.User ? appointment.Doctor.User.name : null,
        photo_url: appointment.Doctor.photo_url
      } : null,
      specialty: appointment.Specialty ? {
        id: appointment.Specialty.id,
        name: appointment.Specialty.name
      } : null,
      teleconsult_room: appointment.TeleconsultRoom ? {
        id: appointment.TeleconsultRoom.id,
        patient_link: appointment.TeleconsultRoom.patient_link
      } : null
    };
  }

  /**
   * Lista especialidades ativas (para pacientes consultar)
   */
  async listSpecialties() {
    try {
      const specialties = await Specialty.findAll({
        where: { active: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      return specialties;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Valida se o beneficiary pertence ao usuário logado
   */
  async validateBeneficiaryOwnership(beneficiaryId, userId) {
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        [Op.or]: [
          { user_id: userId },
          {
            titular_id: {
              [Op.in]: sequelize.literal(
                `(SELECT id FROM beneficiaries WHERE user_id = ${userId} AND type = 'TITULAR')`
              )
            }
          }
        ]
      }
    });

    return beneficiary;
  }

  /**
   * Lista histórico de consultas do beneficiário (FINISHED/CANCELED)
   */
  async getAppointmentsHistory(userId, filters = {}) {
    // Validar se beneficiaryId foi informado e pertence ao usuário
    let beneficiaryId = filters.beneficiaryId;

    if (beneficiaryId) {
      const beneficiary = await this.validateBeneficiaryOwnership(beneficiaryId, userId);
      if (!beneficiary) {
        throw new Error('FORBIDDEN: Beneficiary does not belong to this user');
      }
    } else {
      // Se não informar beneficiaryId, buscar o titular do usuário
      const titular = await Beneficiary.findOne({
        where: { user_id: userId, type: 'TITULAR' }
      });

      if (!titular) {
        return { items: [], page: 1, limit: 10, total: 0 };
      }

      beneficiaryId = titular.id;
    }

    // Sempre filtra por FINISHED ou CANCELED
    const where = {
      beneficiary_id: beneficiaryId,
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
        {
          model: Doctor,
          attributes: ['id', 'photo_url'],
          include: [{ model: User, attributes: ['name'] }]
        },
        { model: Beneficiary, attributes: ['id', 'name', 'cpf'] }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']],
      limit,
      offset
    };

    // Filtro por busca (nome do médico)
    if (filters.search) {
      queryOptions.include[1].include[0].where = {
        name: { [Op.like]: `%${filters.search}%` }
      };
      queryOptions.include[1].required = true;
      queryOptions.include[1].include[0].required = true;
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
        doctor: appointment.Doctor ? {
          id: appointment.Doctor.id,
          name: appointment.Doctor.User ? appointment.Doctor.User.name : null,
          photo_url: appointment.Doctor.photo_url
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

module.exports = new PatientService();
