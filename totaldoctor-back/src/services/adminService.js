const sequelize = require('../config/database');
const { Doctor, User, Appointment, Specialty, Patient, AppointmentLog, Role, DoctorSpecialty, Beneficiary } = require('../models');
const { hashPassword } = require('../utils/hash');
const crypto = require('crypto');
const { Op } = require('sequelize');

class AdminService {
  async createDoctor(data) {
    const transaction = await sequelize.transaction();

    try {
      // Buscar role de médico
      const doctorRole = await Role.findOne({ where: { name: 'MEDICO' } });
      
      if (!doctorRole) {
        throw new Error('Doctor role not found');
      }

      // Gerar senha temporária se não fornecida
      const password = data.password || crypto.randomBytes(8).toString('hex');
      const hashedPassword = await hashPassword(password);

      // Criar usuário
      const user = await User.create({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password_hash: hashedPassword,
        role_id: doctorRole.id,
        status: data.status || 'ACTIVE'
      }, { transaction });

      // Criar médico
      const doctor = await Doctor.create({
        user_id: user.id,
        profession: data.profession,
        registry_type: data.registry_type,
        registry_number: data.registry_number,
        registry_uf: data.registry_uf || null,
        rqe: data.rqe || null,
        photo_url: data.photo_url || null,
        council_doc_url: data.council_doc_url || null,
        specialization_doc_url: data.specialization_doc_url || null,
        acceptance_term_url: data.acceptance_term_url || null,
        approved_at: data.approved ? new Date() : null
      }, { transaction });

      // Criar associações com especialidades
      if (data.specialty_ids && data.specialty_ids.length > 0) {
        const specialtyRecords = data.specialty_ids.map(specialtyId => ({
          doctor_id: doctor.id,
          specialty_id: specialtyId
        }));
        
        await DoctorSpecialty.bulkCreate(specialtyRecords, { transaction });
      }

      // Se aprovado, atualizar status do usuário
      if (data.approved) {
        await user.update({ status: 'ACTIVE' }, { transaction });
      }

      await transaction.commit();

      // Retornar médico criado com relacionamentos
      const createdDoctor = await Doctor.findByPk(doctor.id, {
        include: [
          { model: User },
          { model: Specialty }
        ]
      });

      return {
        id: createdDoctor.id,
        user_id: createdDoctor.user_id,
        name: createdDoctor.User.name,
        email: createdDoctor.User.email,
        phone: createdDoctor.User.phone,
        status: createdDoctor.User.status,
        profession: createdDoctor.profession,
        registry_type: createdDoctor.registry_type,
        registry_number: createdDoctor.registry_number,
        registry_uf: createdDoctor.registry_uf,
        rqe: createdDoctor.rqe,
        photo_url: createdDoctor.photo_url,
        council_doc_url: createdDoctor.council_doc_url,
        specialization_doc_url: createdDoctor.specialization_doc_url,
        acceptance_term_url: createdDoctor.acceptance_term_url,
        approved_at: createdDoctor.approved_at,
        specialties: createdDoctor.Specialties,
        temporary_password: data.password ? undefined : password
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async listPendingDoctors() {
    const doctors = await Doctor.findAll({
      where: { approved_at: null },
      include: [
        {
          model: User,
          where: { status: 'PENDING' }
        },
        {
          model: Specialty
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Formatar os dados para o frontend
    return doctors.map(doctor => ({
      id: doctor.id,
      user_id: doctor.user_id,
      name: doctor.User?.name,
      email: doctor.User?.email,
      phone: doctor.User?.phone,
      status: doctor.User?.status,
      profession: doctor.profession,
      registry_type: doctor.registry_type,
      registry_number: doctor.registry_number,
      registry_uf: doctor.registry_uf,
      rqe: doctor.rqe,
      photo_url: doctor.photo_url,
      council_doc_url: doctor.council_doc_url,
      specialization_doc_url: doctor.specialization_doc_url,
      acceptance_term_url: doctor.acceptance_term_url,
      approved_at: doctor.approved_at,
      created_at: doctor.created_at,
      specialties: doctor.Specialties || []
    }));
  }

  async listActiveDoctors() {
    const Op = require('sequelize').Op;
    const doctors = await Doctor.findAll({
      where: { 
        approved_at: { [Op.ne]: null }
      },
      include: [
        {
          model: User,
          where: { status: 'ACTIVE' }
        },
        {
          model: Specialty
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Formatar os dados para o frontend
    return doctors.map(doctor => ({
      id: doctor.id,
      user_id: doctor.user_id,
      name: doctor.User?.name,
      email: doctor.User?.email,
      phone: doctor.User?.phone,
      status: doctor.User?.status,
      profession: doctor.profession,
      registry_type: doctor.registry_type,
      registry_number: doctor.registry_number,
      registry_uf: doctor.registry_uf,
      rqe: doctor.rqe,
      photo_url: doctor.photo_url,
      council_doc_url: doctor.council_doc_url,
      specialization_doc_url: doctor.specialization_doc_url,
      acceptance_term_url: doctor.acceptance_term_url,
      approved_at: doctor.approved_at,
      created_at: doctor.created_at,
      specialties: doctor.Specialties || []
    }));
  }

  async getDoctorById(doctorId) {
    const doctor = await Doctor.findByPk(doctorId, {
      include: [
        { model: User },
        { model: Specialty }
      ]
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Formatar dados igual ao listActiveDoctors
    return {
      id: doctor.id,
      user_id: doctor.user_id,
      name: doctor.User?.name,
      email: doctor.User?.email,
      phone: doctor.User?.phone,
      status: doctor.User?.status,
      profession: doctor.profession,
      registry_type: doctor.registry_type,
      registry_number: doctor.registry_number,
      registry_uf: doctor.registry_uf,
      rqe: doctor.rqe,
      photo_url: doctor.photo_url,
      council_doc_url: doctor.council_doc_url,
      specialization_doc_url: doctor.specialization_doc_url,
      acceptance_term_url: doctor.acceptance_term_url,
      approved_at: doctor.approved_at,
      created_at: doctor.created_at,
      specialties: doctor.Specialties || []
    };
  }

  async updateDoctor(doctorId, data) {
    const transaction = await sequelize.transaction();

    try {
      // Buscar profissional existente
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{ model: User }],
        transaction
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const user = doctor.User;

      // Atualizar dados do usuário
      const userUpdates = {};
      if (data.name !== undefined) userUpdates.name = data.name;
      if (data.email !== undefined) userUpdates.email = data.email;
      if (data.phone !== undefined) userUpdates.phone = data.phone;
      if (data.status !== undefined) userUpdates.status = data.status;

      // Atualizar senha apenas se fornecida
      if (data.password) {
        const hashedPassword = await hashPassword(data.password);
        userUpdates.password_hash = hashedPassword;
      }

      if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates, { transaction });
      }

      // Atualizar dados do médico
      const doctorUpdates = {};
      if (data.profession !== undefined) doctorUpdates.profession = data.profession;
      if (data.registry_type !== undefined) doctorUpdates.registry_type = data.registry_type;
      if (data.registry_number !== undefined) doctorUpdates.registry_number = data.registry_number;
      if (data.registry_uf !== undefined) doctorUpdates.registry_uf = data.registry_uf;
      if (data.rqe !== undefined) doctorUpdates.rqe = data.rqe;
      if (data.photo_url !== undefined) doctorUpdates.photo_url = data.photo_url || null;
      if (data.council_doc_url !== undefined) doctorUpdates.council_doc_url = data.council_doc_url || null;
      if (data.specialization_doc_url !== undefined) doctorUpdates.specialization_doc_url = data.specialization_doc_url || null;
      if (data.acceptance_term_url !== undefined) doctorUpdates.acceptance_term_url = data.acceptance_term_url || null;

      // Atualizar approved_at baseado no campo approved
      if (data.approved !== undefined) {
        doctorUpdates.approved_at = data.approved ? new Date() : null;
      }

      if (Object.keys(doctorUpdates).length > 0) {
        await doctor.update(doctorUpdates, { transaction });
      }

      // Atualizar especialidades se fornecidas
      if (data.specialty_ids && data.specialty_ids.length > 0) {
        // Deletar associações antigas
        await DoctorSpecialty.destroy({
          where: { doctor_id: doctorId },
          transaction
        });

        // Criar novas associações
        const specialtyRecords = data.specialty_ids.map(specialtyId => ({
          doctor_id: doctorId,
          specialty_id: specialtyId
        }));
        
        await DoctorSpecialty.bulkCreate(specialtyRecords, { transaction });
      }

      await transaction.commit();

      // Retornar profissional atualizado com relacionamentos
      const updatedDoctor = await Doctor.findByPk(doctorId, {
        include: [
          { model: User },
          { model: Specialty }
        ]
      });

      return {
        id: updatedDoctor.id,
        user_id: updatedDoctor.user_id,
        name: updatedDoctor.User?.name,
        email: updatedDoctor.User?.email,
        phone: updatedDoctor.User?.phone,
        status: updatedDoctor.User?.status,
        profession: updatedDoctor.profession,
        registry_type: updatedDoctor.registry_type,
        registry_number: updatedDoctor.registry_number,
        registry_uf: updatedDoctor.registry_uf,
        rqe: updatedDoctor.rqe,
        photo_url: updatedDoctor.photo_url,
        council_doc_url: updatedDoctor.council_doc_url,
        specialization_doc_url: updatedDoctor.specialization_doc_url,
        acceptance_term_url: updatedDoctor.acceptance_term_url,
        approved_at: updatedDoctor.approved_at,
        created_at: updatedDoctor.created_at,
        specialties: updatedDoctor.Specialties || []
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

      if (doctor.approved_at) {
        throw new Error('Doctor already approved');
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

  async rejectDoctor(doctorId, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{ model: User }]
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      await doctor.User.update({
        status: 'BLOCKED'
      }, { transaction });

      await transaction.commit();

      return doctor;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listAllAppointments() {
    return await Appointment.findAll({
      include: [
        { model: Doctor, include: [{ model: User }] },
        { model: Patient, include: [{ model: User }] },
        { model: require('../models').Specialty }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  }

  /**
   * Lista consultas pendentes/em andamento com filtros e paginação (Admin)
   */
  async listAdminAppointments(filters = {}) {
    // Por padrão, lista SCHEDULED e IN_PROGRESS
    const statusList = filters.status
      ? filters.status.split(',')
      : ['SCHEDULED', 'IN_PROGRESS'];

    const where = {
      status: { [Op.in]: statusList }
    };

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

    // Filtro por médico
    if (filters.doctorId) {
      where.doctor_id = filters.doctorId;
    }

    // Filtro por beneficiário
    if (filters.beneficiaryId) {
      where.beneficiary_id = filters.beneficiaryId;
    }

    // Filtro por tipo
    if (filters.type) {
      where.type = filters.type;
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
      order: [['date', 'ASC'], ['start_time', 'ASC']],
      limit,
      offset
    };

    // Filtro por busca (nome do médico ou beneficiário)
    if (filters.search) {
      const searchConditions = [];

      // Busca no nome do beneficiário
      queryOptions.include[2].where = {
        name: { [Op.like]: `%${filters.search}%` }
      };
      queryOptions.include[2].required = false;

      // Para buscar também no nome do médico, precisamos de uma subquery
      // Por simplicidade, vamos buscar apenas no beneficiário ou fazer OR
      // Usando subquery para buscar no nome do médico também
      const doctorIds = await Doctor.findAll({
        include: [{
          model: User,
          where: { name: { [Op.like]: `%${filters.search}%` } },
          attributes: []
        }],
        attributes: ['id'],
        raw: true
      });

      const beneficiaryIds = await Beneficiary.findAll({
        where: { name: { [Op.like]: `%${filters.search}%` } },
        attributes: ['id'],
        raw: true
      });

      if (doctorIds.length > 0 || beneficiaryIds.length > 0) {
        where[Op.or] = [];
        if (doctorIds.length > 0) {
          where[Op.or].push({ doctor_id: { [Op.in]: doctorIds.map(d => d.id) } });
        }
        if (beneficiaryIds.length > 0) {
          where[Op.or].push({ beneficiary_id: { [Op.in]: beneficiaryIds.map(b => b.id) } });
        }
      } else {
        // Nenhum resultado encontrado
        return { items: [], page, limit, total: 0 };
      }

      // Remover o where do include pois já estamos filtrando pelo where principal
      delete queryOptions.include[2].where;
      delete queryOptions.include[2].required;
    }

    const { count, rows } = await Appointment.findAndCountAll(queryOptions);

    // Formatar resposta
    const items = rows.map(appointment => ({
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
      } : null
    }));

    return {
      items,
      page,
      limit,
      total: count
    };
  }

  /**
   * Lista histórico de consultas (FINISHED/CANCELED) com filtros e paginação (Admin)
   */
  async listAdminAppointmentsHistory(filters = {}) {
    // Por padrão, lista FINISHED e CANCELED
    const validStatuses = ['FINISHED', 'CANCELED'];
    const statusList = filters.status && validStatuses.includes(filters.status)
      ? [filters.status]
      : validStatuses;

    const where = {
      status: { [Op.in]: statusList }
    };

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

    // Filtro por médico
    if (filters.doctorId) {
      where.doctor_id = filters.doctorId;
    }

    // Filtro por beneficiário
    if (filters.beneficiaryId) {
      where.beneficiary_id = filters.beneficiaryId;
    }

    // Filtro por tipo
    if (filters.type) {
      where.type = filters.type;
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

    // Filtro por busca
    if (filters.search) {
      const doctorIds = await Doctor.findAll({
        include: [{
          model: User,
          where: { name: { [Op.like]: `%${filters.search}%` } },
          attributes: []
        }],
        attributes: ['id'],
        raw: true
      });

      const beneficiaryIds = await Beneficiary.findAll({
        where: { name: { [Op.like]: `%${filters.search}%` } },
        attributes: ['id'],
        raw: true
      });

      if (doctorIds.length > 0 || beneficiaryIds.length > 0) {
        where[Op.or] = [];
        if (doctorIds.length > 0) {
          where[Op.or].push({ doctor_id: { [Op.in]: doctorIds.map(d => d.id) } });
        }
        if (beneficiaryIds.length > 0) {
          where[Op.or].push({ beneficiary_id: { [Op.in]: beneficiaryIds.map(b => b.id) } });
        }
      } else {
        return { items: [], page, limit, total: 0 };
      }
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

  /**
   * Obter detalhes de uma consulta com logs (Admin)
   */
  async getAdminAppointmentById(appointmentId) {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Specialty, attributes: ['id', 'name'] },
        {
          model: Doctor,
          attributes: ['id', 'photo_url'],
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        },
        { model: Beneficiary },
        {
          model: AppointmentLog,
          include: [{
            model: User,
            as: 'performer',
            attributes: ['id', 'name']
          }],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Formatar resposta
    return {
      id: appointment.id,
      status: appointment.status,
      type: appointment.type,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      specialty: appointment.Specialty ? {
        id: appointment.Specialty.id,
        name: appointment.Specialty.name
      } : null,
      doctor: appointment.Doctor ? {
        id: appointment.Doctor.id,
        name: appointment.Doctor.User ? appointment.Doctor.User.name : null,
        email: appointment.Doctor.User ? appointment.Doctor.User.email : null,
        photo_url: appointment.Doctor.photo_url
      } : null,
      beneficiary: appointment.Beneficiary ? {
        id: appointment.Beneficiary.id,
        name: appointment.Beneficiary.name,
        cpf: appointment.Beneficiary.cpf,
        email: appointment.Beneficiary.email,
        phone: appointment.Beneficiary.phone
      } : null,
      logs: (appointment.AppointmentLogs || []).map(log => ({
        id: log.id,
        action: log.action,
        performed_by: log.performer ? {
          id: log.performer.id,
          name: log.performer.name
        } : null,
        created_at: log.created_at
      }))
    };
  }

  /**
   * Cancelar consulta (Admin) - Apenas SCHEDULED
   */
  async cancelAdminAppointment(appointmentId, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'SCHEDULED') {
        throw new Error('Only scheduled appointments can be canceled');
      }

      await appointment.update({ status: 'CANCELED' }, { transaction });

      await AppointmentLog.create({
        appointment_id: appointmentId,
        action: 'CANCELED',
        performed_by: adminId
      }, { transaction });

      await transaction.commit();

      return { ok: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createSpecialty(data) {
    return await Specialty.create({
      name: data.name,
      active: data.active !== undefined ? data.active : true
    });
  }

  async updateSpecialty(id, data) {
    const specialty = await Specialty.findByPk(id);

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    await specialty.update(data);

    return specialty;
  }

  async listSpecialties() {
    console.log('listSpecialties');
    return await Specialty.findAll({
      order: [['name', 'ASC']]
    });
  }

  async toggleSpecialty(id) {
    const specialty = await Specialty.findByPk(id);

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    await specialty.update({ active: !specialty.active });

    return specialty;
  }

  async deleteSpecialty(id) {
    const specialty = await Specialty.findByPk(id);

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    await specialty.destroy();
  }

  async deleteDoctor(doctorId) {
    const transaction = await sequelize.transaction();

    try {
      // Buscar profissional existente
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{ model: User }],
        transaction
      });

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const userId = doctor.user_id;

      // Deletar especialidades associadas
      await DoctorSpecialty.destroy({
        where: { doctor_id: doctorId },
        transaction
      });

      // Deletar registro do médico
      await doctor.destroy({ transaction });

      // Deletar usuário associado
      await User.destroy({
        where: { id: userId },
        transaction
      });

      await transaction.commit();

      return { message: 'Doctor deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ==================== Beneficiários ====================

  async listBeneficiaries(filters = {}) {
    const where = {};
    
    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.cpf) {
      where.cpf = { [Op.like]: `%${filters.cpf}%` };
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    // Se filtrar por tipo DEPENDENTE, buscar todos
    if (filters.type === 'DEPENDENTE') {
      return await Beneficiary.findAll({
        where,
        include: [{
          model: Beneficiary,
          as: 'titular',
          required: false
        }],
        order: [['name', 'ASC']]
      });
    }

    // Buscar apenas titulares com seus dependentes
    const titulares = await Beneficiary.findAll({
      where: { ...where, type: 'TITULAR' },
      include: [{
        model: Beneficiary,
        as: 'dependents',
        required: false,
        where: filters.status ? { status: filters.status } : undefined
      }],
      order: [
        ['name', 'ASC'],
        [{ model: Beneficiary, as: 'dependents' }, 'name', 'ASC']
      ]
    });

    return titulares;
  }

  async getBeneficiaryById(id) {
    const beneficiary = await Beneficiary.findByPk(id, {
      include: [
        {
          model: Beneficiary,
          as: 'titular',
          required: false
        },
        {
          model: Beneficiary,
          as: 'dependents',
          required: false
        }
      ]
    });

    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    return beneficiary;
  }

  async createBeneficiary(data, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Validar se CPF já existe
      const existingBeneficiary = await Beneficiary.findOne({
        where: { cpf: data.cpf }
      });

      if (existingBeneficiary) {
        throw new Error('CPF already registered');
      }

      // Se for dependente, validar se titular existe
      if (data.type === 'DEPENDENTE' && data.titular_id) {
        const titular = await Beneficiary.findOne({
          where: { id: data.titular_id, type: 'TITULAR' }
        });

        if (!titular) {
          throw new Error('Titular not found');
        }
      }

      // Validar se email já existe (se fornecido)
      if (data.email) {
        const existingUser = await User.findOne({
          where: { email: data.email }
        });

        if (existingUser) {
          throw new Error('Email already registered');
        }
      }

      // Buscar role PACIENTE
      const pacienteRole = await Role.findOne({ where: { name: 'PACIENTE' } });
      if (!pacienteRole) {
        throw new Error('Role PACIENTE not found');
      }

      // Criar usuário
      const hashedPassword = await hashPassword(data.password);
      const user = await User.create({
        name: data.name,
        email: data.email || `${data.cpf.replace(/\D/g, '')}@beneficiario.totaldoctor.com`,
        phone: data.phone,
        password_hash: hashedPassword,
        role_id: pacienteRole.id,
        status: 'ACTIVE'
      }, { transaction });

      // Criar beneficiário
      const { password, ...beneficiaryData } = data;
      const beneficiary = await Beneficiary.create({
        ...beneficiaryData,
        user_id: user.id,
        created_by: userId
      }, { transaction });

      await transaction.commit();

      // Retornar com relacionamentos
      return await this.getBeneficiaryById(beneficiary.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateBeneficiary(id, data) {
    const transaction = await sequelize.transaction();

    try {
      const beneficiary = await Beneficiary.findByPk(id);

      if (!beneficiary) {
        throw new Error('Beneficiary not found');
      }

      // Validar CPF único se for alterado
      if (data.cpf && data.cpf !== beneficiary.cpf) {
        const existingBeneficiary = await Beneficiary.findOne({
          where: { cpf: data.cpf, id: { [Op.ne]: id } }
        });

        if (existingBeneficiary) {
          throw new Error('CPF already registered');
        }
      }

      // Se alterar para dependente, validar titular
      if (data.type === 'DEPENDENTE' && data.titular_id) {
        const titular = await Beneficiary.findOne({
          where: { id: data.titular_id, type: 'TITULAR' }
        });

        if (!titular) {
          throw new Error('Titular not found');
        }
      }

      // Se alterar para titular, remover titular_id
      if (data.type === 'TITULAR') {
        data.titular_id = null;
      }

      // Atualizar usuário se existir
      if (beneficiary.user_id) {
        const user = await User.findByPk(beneficiary.user_id);
        if (user) {
          const userUpdateData = {};
          
          if (data.name) userUpdateData.name = data.name;
          if (data.email) {
            // Validar email único
            const existingUser = await User.findOne({
              where: { 
                email: data.email,
                id: { [Op.ne]: user.id }
              }
            });
            if (existingUser) {
              throw new Error('Email already registered');
            }
            userUpdateData.email = data.email;
          }
          if (data.phone) userUpdateData.phone = data.phone;
          
          // Atualizar senha se fornecida
          if (data.password) {
            userUpdateData.password_hash = await hashPassword(data.password);
          }

          if (Object.keys(userUpdateData).length > 0) {
            await user.update(userUpdateData, { transaction });
          }
        }
      }

      // Remover password dos dados do beneficiário
      const { password, ...beneficiaryData } = data;
      await beneficiary.update(beneficiaryData, { transaction });

      await transaction.commit();

      return await this.getBeneficiaryById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async toggleBeneficiaryStatus(id) {
    const beneficiary = await Beneficiary.findByPk(id, {
      include: [{
        model: Beneficiary,
        as: 'dependents',
        required: false
      }]
    });

    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    const newStatus = beneficiary.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await beneficiary.update({ status: newStatus });

    return await this.getBeneficiaryById(id);
  }

  async toggleBeneficiaryStatusWithDependents(id, includeDependents = false) {
    const transaction = await sequelize.transaction();

    try {
      const beneficiary = await Beneficiary.findByPk(id, {
        include: [{
          model: Beneficiary,
          as: 'dependents',
          required: false
        }],
        transaction
      });

      if (!beneficiary) {
        throw new Error('Beneficiary not found');
      }

      const newStatus = beneficiary.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await beneficiary.update({ status: newStatus }, { transaction });

      // Se for titular e incluir dependentes
      if (includeDependents && beneficiary.type === 'TITULAR' && beneficiary.dependents?.length > 0) {
        await Beneficiary.update(
          { status: newStatus },
          {
            where: { titular_id: id },
            transaction
          }
        );
      }

      await transaction.commit();

      return await this.getBeneficiaryById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listDependents(titularId) {
    const titular = await Beneficiary.findOne({
      where: { id: titularId, type: 'TITULAR' }
    });

    if (!titular) {
      throw new Error('Titular not found');
    }

    return await Beneficiary.findAll({
      where: { titular_id: titularId },
      order: [['name', 'ASC']]
    });
  }

  async deleteBeneficiary(id) {
    const beneficiary = await Beneficiary.findByPk(id, {
      include: [{
        model: Beneficiary,
        as: 'dependents',
        required: false
      }]
    });

    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    // Verificar se é titular com dependentes
    if (beneficiary.type === 'TITULAR' && beneficiary.dependents?.length > 0) {
      throw new Error('Cannot delete titular with dependents. Please remove or reassign dependents first.');
    }

    await beneficiary.destroy();

    return { message: 'Beneficiary deleted successfully' };
  }
}

module.exports = new AdminService();
