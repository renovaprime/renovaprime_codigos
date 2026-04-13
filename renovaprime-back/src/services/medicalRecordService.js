const sequelize = require('../config/database');
const {
  MedicalRecord,
  RecordAttachment,
  RecordAuditLog,
  Appointment,
  Beneficiary,
  Doctor,
  User,
  Specialty,
  Prescription,
} = require('../models');
const { Op } = require('sequelize');

class MedicalRecordService {
  // --------------- helpers ---------------

  async _logAudit(medicalRecordId, actorId, action, changesJson, req) {
    await RecordAuditLog.create({
      medical_record_id: medicalRecordId,
      actor_id: actorId,
      action,
      changes_json: changesJson || null,
      ip: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.headers?.['user-agent']?.substring(0, 500) || null,
    });
  }

  _buildChanges(oldData, newData, fields) {
    const changes = {};
    for (const field of fields) {
      const oldVal = oldData[field] ?? null;
      const newVal = newData[field] !== undefined ? newData[field] : undefined;
      if (newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[field] = { old: oldVal, new: newVal };
      }
    }
    return Object.keys(changes).length > 0 ? changes : null;
  }

  // --------------- CRUD ---------------

  async createRecord(data, userId, req) {
    const transaction = await sequelize.transaction();
    try {
      const appointment = await Appointment.findByPk(data.appointment_id, {
        include: [{ model: Doctor }, { model: Beneficiary }],
      });

      if (!appointment) throw new Error('Consulta não encontrada');
      if (appointment.status !== 'IN_PROGRESS' && appointment.status !== 'FINISHED') {
        throw new Error('Somente consultas em andamento ou finalizadas podem ter prontuário');
      }

      // Verificar se o doctor do user logado corresponde
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor || doctor.id !== appointment.doctor_id) {
        throw new Error('Você não é o médico desta consulta');
      }

      // Verificar se ja existe record para este appointment
      const existing = await MedicalRecord.findOne({ where: { appointment_id: data.appointment_id } });
      if (existing) throw new Error('Já existe um prontuário para esta consulta');

      const beneficiaryId = appointment.beneficiary_id || appointment.patient_id;
      if (!beneficiaryId) throw new Error('Nenhum paciente vinculado a esta consulta');

      const record = await MedicalRecord.create({
        appointment_id: data.appointment_id,
        beneficiary_id: beneficiaryId,
        doctor_id: doctor.id,
        chief_complaint: data.chief_complaint,
        hpi: data.hpi,
        personal_history: data.personal_history,
        surgical_history: data.surgical_history,
        allergies: data.allergies,
        current_medications: data.current_medications,
        comorbidities: data.comorbidities,
        habits: data.habits,
        family_history: data.family_history,
        vitals_json: data.vitals_json || null,
        physical_exam: data.physical_exam,
        assessment: data.assessment,
        diagnosis: data.diagnosis,
        cid10: data.cid10,
        plan: data.plan,
        guidance: data.guidance,
        return_instructions: data.return_instructions,
        red_flags: data.red_flags,
        referrals: data.referrals,
        exam_requests: data.exam_requests,
        status: 'DRAFT',
      }, { transaction });

      await transaction.commit();
      // Registrar audit após commit evita lock wait timeout por FK
      // (record_audit_logs.medical_record_id referencia medical_records.id).
      try {
        await this._logAudit(record.id, userId, 'CREATED', null, req);
      } catch (auditError) {
        // O prontuário já foi persistido; não devemos quebrar o request
        // apenas por falha no audit log.
        console.error('Audit log failed (CREATED):', auditError);
      }
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateRecord(recordId, data, userId, req) {
    const transaction = await sequelize.transaction();
    try {
      const record = await MedicalRecord.findByPk(recordId);
      if (!record) throw new Error('Prontuário não encontrado');
      if (record.status === 'SIGNED') throw new Error('Prontuário assinado não pode ser editado');

      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor || doctor.id !== record.doctor_id) {
        throw new Error('Você não é o médico deste prontuário');
      }

      const editableFields = [
        'chief_complaint', 'hpi', 'personal_history', 'surgical_history',
        'allergies', 'current_medications', 'comorbidities', 'habits',
        'family_history', 'vitals_json', 'physical_exam', 'assessment',
        'diagnosis', 'cid10', 'plan', 'guidance', 'return_instructions',
        'red_flags', 'referrals', 'exam_requests',
      ];

      const changes = this._buildChanges(record.toJSON(), data, editableFields);

      const updateData = {};
      for (const field of editableFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      }

      await record.update(updateData, { transaction });

      await transaction.commit();
      if (changes) {
        // Registrar audit após commit evita lock wait timeout por FK
        // (record_audit_logs.medical_record_id referencia medical_records.id).
        try {
          await this._logAudit(record.id, userId, 'UPDATED', changes, req);
        } catch (auditError) {
          // O prontuário já foi persistido; não devemos quebrar o request
          // apenas por falha no audit log.
          console.error('Audit log failed (UPDATED):', auditError);
        }
      }
      return await MedicalRecord.findByPk(recordId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async signRecord(recordId, userId, req) {
    const transaction = await sequelize.transaction();
    try {
      const record = await MedicalRecord.findByPk(recordId);
      if (!record) throw new Error('Prontuário não encontrado');
      if (record.status === 'SIGNED') throw new Error('Prontuário já está assinado');

      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor || doctor.id !== record.doctor_id) {
        throw new Error('Você não é o médico deste prontuário');
      }

      // Validar campos obrigatórios para assinatura
      if (!record.chief_complaint || !record.chief_complaint.trim()) {
        throw new Error('Queixa principal é obrigatória para assinar');
      }
      if (!record.assessment || !record.assessment.trim()) {
        throw new Error('Avaliação é obrigatória para assinar');
      }
      if (!record.plan || !record.plan.trim()) {
        throw new Error('Plano/conduta é obrigatório para assinar');
      }

      await record.update({
        status: 'SIGNED',
        signed_at: new Date(),
      }, { transaction });

      await transaction.commit();
      // Registrar audit após commit evita lock wait timeout por FK
      // (record_audit_logs.medical_record_id referencia medical_records.id).
      try {
        await this._logAudit(record.id, userId, 'SIGNED', null, req);
      } catch (auditError) {
        // O prontuário já foi persistido; não devemos quebrar o request
        // apenas por falha no audit log.
        console.error('Audit log failed (SIGNED):', auditError);
      }
      return await MedicalRecord.findByPk(recordId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --------------- Queries ---------------

  async getRecord(recordId, userId, userRole, req) {
    const record = await MedicalRecord.findByPk(recordId, {
      include: [
        {
          model: RecordAttachment,
          as: 'attachments',
        },
        {
          model: Appointment,
          include: [
            { model: Specialty },
            { model: Prescription },
          ],
        },
        {
          model: Beneficiary,
        },
        {
          model: Doctor,
          include: [{ model: User }],
        },
      ],
    });

    if (!record) throw new Error('Prontuário não encontrado');

    // Verificar permissão
    if (userRole === 'medico') {
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor) throw new Error('Médico não encontrado');
      // Qualquer médico pode visualizar prontuários para continuidade clínica
    } else if (userRole === 'paciente') {
      const beneficiaries = await Beneficiary.findAll({
        where: {
          [Op.or]: [{ user_id: userId }, { created_by: userId }],
        },
      });
      const beneficiaryIds = beneficiaries.map(b => b.id);
      if (!beneficiaryIds.includes(record.beneficiary_id)) {
        throw new Error('Acesso negado');
      }
      // Paciente só vê records SIGNED
      if (record.status !== 'SIGNED') {
        throw new Error('Acesso negado');
      }
    }
    // admin acessa tudo

    await this._logAudit(record.id, userId, 'VIEWED', null, req);
    return record;
  }

  async getPatientRecords(beneficiaryId, userId, userRole, req) {
    // Verificar permissão
    if (userRole === 'medico') {
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor) throw new Error('Médico não encontrado');
      // Médico vê todos os records do beneficiário para continuidade clínica
      const records = await MedicalRecord.findAll({
        where: { beneficiary_id: beneficiaryId },
        include: [
          { model: Appointment, include: [{ model: Specialty }] },
          { model: RecordAttachment, as: 'attachments' },
          { model: Doctor, include: [{ model: User }] },
        ],
        order: [['created_at', 'DESC']],
      });

      // Log de visualização apenas do primeiro (para não encher de logs)
      if (records.length > 0) {
        await this._logAudit(records[0].id, userId, 'VIEWED', null, req);
      }
      return records;
    }

    if (userRole === 'paciente') {
      const beneficiaries = await Beneficiary.findAll({
        where: {
          [Op.or]: [{ user_id: userId }, { created_by: userId }],
        },
      });
      const beneficiaryIds = beneficiaries.map(b => b.id);
      if (!beneficiaryIds.includes(parseInt(beneficiaryId))) {
        throw new Error('Acesso negado');
      }
    }

    // Admin ou paciente autorizado
    const whereClause = { beneficiary_id: beneficiaryId };
    if (userRole === 'paciente') {
      whereClause.status = 'SIGNED';
    }

    const records = await MedicalRecord.findAll({
      where: whereClause,
      include: [
        { model: Appointment, include: [{ model: Specialty }] },
        { model: RecordAttachment, as: 'attachments' },
        { model: Doctor, include: [{ model: User }] },
      ],
      order: [['created_at', 'DESC']],
    });

    return records;
  }

  async getPatientSummary(beneficiaryId, userId, userRole) {
    const beneficiary = await Beneficiary.findByPk(beneficiaryId);
    if (!beneficiary) throw new Error('Paciente não encontrado');

    // Permissão
    if (userRole === 'medico') {
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor) throw new Error('Médico não encontrado');
    }

    // Buscar todos os records SIGNED deste paciente
    const records = await MedicalRecord.findAll({
      where: { beneficiary_id: beneficiaryId, status: 'SIGNED' },
      order: [['created_at', 'DESC']],
    });

    // Agregar dados mais recentes
    const latestRecord = records[0] || null;

    // Contar atendimentos
    const totalAppointments = await Appointment.count({
      where: {
        beneficiary_id: beneficiaryId,
        status: { [Op.in]: ['FINISHED', 'IN_PROGRESS'] },
      },
    });

    return {
      beneficiary: {
        id: beneficiary.id,
        name: beneficiary.name,
        cpf: beneficiary.cpf,
        birth_date: beneficiary.birth_date,
        phone: beneficiary.phone,
        email: beneficiary.email,
        address: beneficiary.address,
        city: beneficiary.city,
        state: beneficiary.state,
        cep: beneficiary.cep,
      },
      clinical: {
        allergies: latestRecord?.allergies || null,
        current_medications: latestRecord?.current_medications || null,
        comorbidities: latestRecord?.comorbidities || null,
        personal_history: latestRecord?.personal_history || null,
        surgical_history: latestRecord?.surgical_history || null,
        habits: latestRecord?.habits || null,
        family_history: latestRecord?.family_history || null,
        last_diagnosis: latestRecord?.diagnosis || null,
        last_cid10: latestRecord?.cid10 || null,
      },
      stats: {
        total_appointments: totalAppointments,
        total_records: records.length,
        last_record_date: latestRecord?.created_at || null,
      },
    };
  }

  async getRecordByAppointment(appointmentId, userId, userRole) {
    const record = await MedicalRecord.findOne({
      where: { appointment_id: appointmentId },
      include: [
        { model: RecordAttachment, as: 'attachments' },
      ],
    });
    return record;
  }

  // --------------- Attachments ---------------

  async addAttachment(recordId, data, userId, req) {
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) throw new Error('Prontuário não encontrado');
    if (record.status === 'SIGNED') throw new Error('Não é possível adicionar anexos ao prontuário assinado');

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor || doctor.id !== record.doctor_id) {
      throw new Error('Você não é o médico deste prontuário');
    }

    const attachment = await RecordAttachment.create({
      medical_record_id: recordId,
      category: data.category,
      file_name: data.file_name,
      file_url: data.file_url,
      mime_type: data.mime_type || null,
      uploaded_by: userId,
    });

    await this._logAudit(recordId, userId, 'ATTACHMENT_ADDED', { file_name: data.file_name, category: data.category }, req);
    return attachment;
  }

  async getAttachments(recordId) {
    return await RecordAttachment.findAll({
      where: { medical_record_id: recordId },
      order: [['created_at', 'DESC']],
    });
  }

  async deleteAttachment(recordId, attachmentId, userId) {
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) throw new Error('Prontuário não encontrado');
    if (record.status === 'SIGNED') throw new Error('Não é possível remover anexos do prontuário assinado');

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor || doctor.id !== record.doctor_id) {
      throw new Error('Você não é o médico deste prontuário');
    }

    const attachment = await RecordAttachment.findOne({
      where: { id: attachmentId, medical_record_id: recordId },
    });
    if (!attachment) throw new Error('Anexo não encontrado');

    await attachment.destroy();
    return true;
  }

  // --------------- Audit ---------------

  async getAuditLogs(recordId) {
    return await RecordAuditLog.findAll({
      where: { medical_record_id: recordId },
      include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async getPatientAuditLogs(beneficiaryId) {
    const recordIds = await MedicalRecord.findAll({
      where: { beneficiary_id: beneficiaryId },
      attributes: ['id'],
    });
    const ids = recordIds.map(r => r.id);
    if (ids.length === 0) return [];

    return await RecordAuditLog.findAll({
      where: { medical_record_id: { [Op.in]: ids } },
      include: [
        { model: User, as: 'actor', attributes: ['id', 'name', 'email'] },
        { model: MedicalRecord, attributes: ['id', 'appointment_id'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  // --------------- Patient view ---------------

  async getMyRecords(userId) {
    const beneficiaries = await Beneficiary.findAll({
      where: {
        [Op.or]: [{ user_id: userId }, { created_by: userId }],
      },
    });
    const beneficiaryIds = beneficiaries.map(b => b.id);
    if (beneficiaryIds.length === 0) return [];

    return await MedicalRecord.findAll({
      where: {
        beneficiary_id: { [Op.in]: beneficiaryIds },
        status: 'SIGNED',
      },
      include: [
        { model: Appointment, include: [{ model: Specialty }] },
        { model: Doctor, include: [{ model: User }] },
        { model: Beneficiary, attributes: ['id', 'name'] },
        { model: RecordAttachment, as: 'attachments' },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}

module.exports = new MedicalRecordService();
