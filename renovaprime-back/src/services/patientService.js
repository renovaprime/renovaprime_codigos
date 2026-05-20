const sequelize = require('../config/database');
const { Appointment, AppointmentLog, Doctor, Specialty, Beneficiary, User, TeleconsultRoom, ResellerSale, Role } = require('../models');
const { Op } = require('sequelize');
const availabilityService = require('./availabilityService');
const { hashPassword } = require('../utils/hash');

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

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

    const appointments = await Appointment.findAll({
      where: {
        beneficiary_id: beneficiary.id,
        status: { [Op.in]: ['SCHEDULED', 'IN_PROGRESS'] }
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
      // Validar data/horário não está no passado
      const now = new Date();
      const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(now);
      if (data.date < todayStr) {
        throw new Error('Cannot schedule appointments in the past');
      }

      // Se for hoje, validar que o horário ainda não passou
      if (data.date === todayStr) {
        const nowTime = new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);
        if (data.start_time <= nowTime) {
          throw new Error('Cannot schedule appointments for a time that has already passed');
        }
      }

      // Buscar beneficiário do usuário
      let beneficiaryId = data.beneficiary_id;
      
      if (!beneficiaryId) {
        const beneficiary = await Beneficiary.findOne({
          where: { user_id: userId, status: 'ACTIVE' }
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
    const selfBeneficiary = await Beneficiary.findOne({
      where: {
        user_id: userId,
        status: 'ACTIVE'
      }
    });

    if (!selfBeneficiary) {
      return [];
    }

    if (selfBeneficiary.type === 'DEPENDENTE') {
      return [selfBeneficiary];
    }

    const dependents = await Beneficiary.findAll({
      where: {
        titular_id: selfBeneficiary.id,
        status: 'ACTIVE'
      },
      order: [['name', 'ASC']]
    });

    return [selfBeneficiary, ...dependents];
  }

  /**
   * Beneficiário ativo cujo CPF pertence ao usuário (titular da rede ou dependente com login ou titular).
   */
  async findOwnedBeneficiaryByCpf(userId, cpfDigits) {
    const digits = normalizeCpf(cpfDigits);
    if (digits.length !== 11) {
      return null;
    }

    const selfBeneficiary = await Beneficiary.findOne({
      where: {
        user_id: userId,
        status: 'ACTIVE'
      }
    });

    if (!selfBeneficiary) {
      return null;
    }

    if (normalizeCpf(selfBeneficiary.cpf) === digits) {
      return selfBeneficiary;
    }

    if (selfBeneficiary.type !== 'TITULAR') {
      return null;
    }

    const network = await Beneficiary.findAll({
      where: {
        status: 'ACTIVE',
        [Op.or]: [{ id: selfBeneficiary.id }, { titular_id: selfBeneficiary.id }]
      }
    });

    return network.find((b) => normalizeCpf(b.cpf) === digits) || null;
  }

  /**
   * Marca pedido de liberação do Face Scan (admin vê face_scan_requested).
   */
  async requestFaceScanAccess(userId, cpfDigits) {
    const local = await this.findOwnedBeneficiaryByCpf(userId, cpfDigits);
    if (!local) {
      const err = new Error('Beneficiário não encontrado ou sem permissão');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (local.face_scan_enabled) {
      return {
        alreadyEnabled: true,
        message: 'Face Scan já está ativado para este beneficiário.'
      };
    }

    await local.update({ face_scan_requested: true });
    return {
      alreadyEnabled: false,
      message: 'Solicitação registrada. Nossa equipe irá analisar e liberar em breve.'
    };
  }

  async createDependent(userId, data) {
    const transaction = await sequelize.transaction();

    try {
      const titular = await Beneficiary.findOne({
        where: {
          user_id: userId,
          type: 'TITULAR',
          status: 'ACTIVE'
        },
        transaction
      });

      if (!titular) {
        throw new Error('Titular not found');
      }

      const dependentsCount = await Beneficiary.count({
        where: {
          titular_id: titular.id,
          type: 'DEPENDENTE',
          status: 'ACTIVE'
        },
        transaction
      });

      if (dependentsCount >= 3) {
        throw new Error('Dependent limit reached');
      }

      const cpfAlreadyExists = await Beneficiary.findOne({
        where: { cpf: data.cpf },
        transaction
      });

      if (cpfAlreadyExists) {
        throw new Error('CPF already registered');
      }

      const dependent = await Beneficiary.create(
        {
          type: 'DEPENDENTE',
          titular_id: titular.id,
          name: data.name,
          cpf: data.cpf,
          birth_date: data.birth_date,
          phone: data.phone || null,
          email: data.email || null,
          cep: data.cep || null,
          city: data.city || null,
          state: data.state || null,
          address: data.address || null,
          service_type: data.service_type || titular.service_type || 'CLINICO',
          status: 'ACTIVE',
          created_by: titular.id
        },
        { transaction }
      );

      await transaction.commit();
      return dependent;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async manageDependentAccess(dependentId, userId, data) {
    const transaction = await sequelize.transaction();

    try {
      const titular = await Beneficiary.findOne({
        where: {
          user_id: userId,
          type: 'TITULAR',
          status: 'ACTIVE'
        },
        transaction
      });

      if (!titular) {
        throw new Error('Titular not found');
      }

      const dependent = await Beneficiary.findOne({
        where: {
          id: dependentId,
          titular_id: titular.id,
          type: 'DEPENDENTE'
        },
        transaction
      });

      if (!dependent) {
        throw new Error('Dependent not found');
      }

      const normalizedCpf = dependent.cpf ? dependent.cpf.replace(/\D/g, '') : null;
      const hashedPassword = await hashPassword(data.password);

      if (dependent.user_id) {
        const existingUser = await User.findByPk(dependent.user_id, { transaction });
        if (!existingUser) {
          throw new Error('Linked user not found');
        }

        if (existingUser.email !== data.email) {
          const emailInUse = await User.findOne({
            where: {
              email: data.email,
              id: { [Op.ne]: existingUser.id }
            },
            transaction
          });

          if (emailInUse) {
            throw new Error('Email already registered');
          }
        }

        await existingUser.update(
          {
            email: data.email,
            password_hash: hashedPassword
          },
          { transaction }
        );
      } else {
        const emailInUse = await User.findOne({
          where: { email: data.email },
          transaction
        });

        if (emailInUse) {
          throw new Error('Email already registered');
        }

        const patientRole = await Role.findOne({
          where: { name: 'PACIENTE' },
          transaction
        });

        if (!patientRole) {
          throw new Error('Patient role not found');
        }

        const newUser = await User.create(
          {
            name: dependent.name,
            email: data.email,
            phone: dependent.phone || null,
            password_hash: hashedPassword,
            role_id: patientRole.id,
            status: 'ACTIVE',
            cpf: normalizedCpf || null,
            birth_date: dependent.birth_date || null
          },
          { transaction }
        );

        await dependent.update({ user_id: newUser.id }, { transaction });
      }

      await dependent.update({ email: data.email }, { transaction });

      await transaction.commit();

      return {
        beneficiary_id: dependent.id,
        has_access: true,
        email: data.email
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
   * Retorna dados da assinatura do paciente
   */
  async getMySubscription(userId) {
    const PLAN_MAP = {
      CLINICO:  { name: 'Individual', price: 39.90 },
      PREMIUM:  { name: 'Individual Premium', price: 59.90 },
      FAMILIAR: { name: 'Familiar Master', price: 84.90 }
    };

    const titular = await Beneficiary.findOne({
      where: { user_id: userId, type: 'TITULAR' }
    });

    if (!titular) {
      return null;
    }

    const dependents = await Beneficiary.findAll({
      where: { titular_id: titular.id },
      order: [['name', 'ASC']]
    });

    const sale = await ResellerSale.findOne({
      where: { beneficiary_id: titular.id },
      order: [['created_at', 'DESC']]
    });

    const planInfo = PLAN_MAP[titular.service_type] || { name: titular.service_type, price: 0 };

    const beneficiaries = [titular, ...dependents].map(b => ({
      id: b.id,
      name: b.name,
      type: b.type,
      cpf: b.cpf,
      status: b.status
    }));

    return {
      plan: {
        name: planInfo.name,
        type: titular.service_type,
        price: planInfo.price
      },
      status: titular.status,
      payment_status: sale ? sale.status : null,
      subscribed_at: sale ? sale.created_at : titular.created_at,
      beneficiaries
    };
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
      // Se nao informar beneficiaryId, usar o beneficiario vinculado ao usuario logado.
      // Isso garante historico tanto para titular quanto para dependente.
      const selfBeneficiary = await Beneficiary.findOne({
        where: { user_id: userId, status: 'ACTIVE' }
      });

      if (!selfBeneficiary) {
        return { items: [], page: 1, limit: 10, total: 0 };
      }

      beneficiaryId = selfBeneficiary.id;
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
