const crypto = require('crypto');
const sequelize = require('../../config/database');
const { Appointment, AppointmentLog, Doctor, Patient, TeleconsultRoom, Beneficiary } = require('../../models');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

class TeleconsultService {
  /**
   * Gera um nome de sala único para Twilio
   * Formato: teleconsult-{appointmentId}-{hash}
   */
  generateRoomName(appointmentId) {
    const hash = crypto.randomBytes(4).toString('hex');
    return `teleconsult-${appointmentId}-${hash}`;
  }

  /**
   * Gera Access Token do Twilio para um usuário entrar na sala
   */
  generateAccessToken(roomName, identity) {
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity }
    );

    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    return token.toJwt();
  }

  /**
   * Obtém ou cria a sala de teleconsulta e retorna os dados para o Twilio
   * Médico e paciente recebem o mesmo roomName mas tokens diferentes
   */
  async getRoomData(appointmentId, userId, userRole) {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Doctor },
        { model: Patient }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Obter nome do usuário para exibir
    let displayName = '';
    let identity = '';

    // Validar acesso baseado no role
    if (userRole === 'medico') {
      const doctor = await Doctor.findOne({
        where: { user_id: userId },
        include: [{ model: require('../../models').User, attributes: ['name'] }]
      });
      if (!doctor || appointment.doctor_id !== doctor.id) {
        throw new Error('Access denied: This appointment does not belong to you');
      }
      displayName = doctor.User?.name ? `Dr. ${doctor.User.name}` : 'Médico';
      identity = `doctor-${userId}`;
    } else if (userRole === 'paciente') {
      let hasAccess = false;

      // Verificar acesso via Patient (patient_id)
      if (appointment.patient_id) {
        const patient = await Patient.findByPk(appointment.patient_id, {
          include: [{ model: require('../../models').User, attributes: ['name'] }]
        });
        if (patient && patient.user_id === userId) {
          hasAccess = true;
          displayName = patient.User?.name || 'Paciente';
          identity = `patient-${userId}`;
        }
      }

      // Verificar acesso via Beneficiary (beneficiary_id)
      if (!hasAccess && appointment.beneficiary_id) {
        const beneficiary = await Beneficiary.findByPk(appointment.beneficiary_id);
        if (beneficiary) {
          // Acesso direto: beneficiário tem user_id do usuário logado
          if (beneficiary.user_id === userId) {
            hasAccess = true;
            displayName = beneficiary.name || 'Paciente';
            identity = `beneficiary-${userId}`;
          }
          // Acesso como titular: dependente pertence ao titular logado
          if (!hasAccess && beneficiary.type === 'DEPENDENTE' && beneficiary.titular_id) {
            const titular = await Beneficiary.findByPk(beneficiary.titular_id);
            if (titular && titular.user_id === userId) {
              hasAccess = true;
              displayName = beneficiary.name || 'Paciente';
              identity = `beneficiary-${userId}`;
            }
          }
        }
      }

      if (!hasAccess) {
        throw new Error('Access denied: This appointment does not belong to you');
      }
    } else {
      throw new Error('Access denied: Invalid role for teleconsultation');
    }

    // Verificar status da consulta
    if (appointment.status === 'CANCELED') {
      throw new Error('This appointment has been canceled');
    }

    if (appointment.status === 'FINISHED') {
      throw new Error('This appointment has already been finished');
    }

    // Buscar ou criar a sala
    let teleconsultRoom = await TeleconsultRoom.findOne({
      where: { appointment_id: appointmentId }
    });

    if (!teleconsultRoom) {
      // Criar nova sala com nome único
      teleconsultRoom = await TeleconsultRoom.create({
        appointment_id: appointmentId,
        room_name: this.generateRoomName(appointmentId),
        doctor_link: null,
        patient_link: null,
        started_at: new Date()
      });

      // Atualizar status do appointment para IN_PROGRESS se ainda estiver SCHEDULED
      if (appointment.status === 'SCHEDULED') {
        await appointment.update({ status: 'IN_PROGRESS' });
      }
    }

    // Gerar Access Token do Twilio para este usuário
    const accessToken = this.generateAccessToken(teleconsultRoom.room_name, identity);

    return {
      appointment_id: appointmentId,
      appointment_status: appointment.status === 'SCHEDULED' ? 'IN_PROGRESS' : appointment.status,
      roomName: teleconsultRoom.room_name,
      accessToken,
      displayName,
      role: userRole === 'medico' ? 'doctor' : 'patient'
    };
  }

  /**
   * Finaliza a teleconsulta (apenas médico pode chamar)
   * Marca o appointment como FINISHED
   */
  async endTeleconsultation(appointmentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const appointment = await Appointment.findByPk(appointmentId);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Verificar se o médico é o dono do appointment
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor || appointment.doctor_id !== doctor.id) {
        throw new Error('Access denied: You can only end your own appointments');
      }

      // Se já estiver FINISHED, retornar ok (idempotência)
      if (appointment.status === 'FINISHED') {
        await transaction.commit();
        return { ok: true, message: 'Appointment already finished' };
      }

      // Só pode finalizar se estiver SCHEDULED ou IN_PROGRESS
      if (appointment.status === 'CANCELED') {
        throw new Error('Cannot end a canceled appointment');
      }

      // Atualizar status para FINISHED
      await appointment.update({ status: 'FINISHED' }, { transaction });

      // Atualizar teleconsult_room se existir
      const teleconsultRoom = await TeleconsultRoom.findOne({
        where: { appointment_id: appointmentId }
      });
      if (teleconsultRoom) {
        await teleconsultRoom.update({ ended_at: new Date() }, { transaction });
      }

      // Criar log
      await AppointmentLog.create({
        appointment_id: appointmentId,
        action: 'FINISHED',
        performed_by: userId
      }, { transaction });

      await transaction.commit();

      return { ok: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Verifica se a teleconsulta está disponível para o paciente entrar
   */
  async checkTeleconsultAvailability(appointmentId) {
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      return { available: false, reason: 'Appointment not found' };
    }

    if (appointment.status === 'SCHEDULED') {
      return { available: false, reason: 'Waiting for doctor to start the consultation' };
    }

    if (appointment.status === 'CANCELED') {
      return { available: false, reason: 'Appointment has been canceled' };
    }

    if (appointment.status === 'FINISHED') {
      return { available: false, reason: 'Appointment has been finished' };
    }

    if (appointment.status === 'IN_PROGRESS') {
      return { available: true };
    }

    return { available: false, reason: 'Unknown status' };
  }
}

module.exports = new TeleconsultService();
