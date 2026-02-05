const sequelize = require('../../config/database');
const { Appointment, AppointmentLog, Doctor, Patient, TeleconsultRoom, Beneficiary } = require('../../models');

class TeleconsultService {
  /**
   * Gera os IDs da sala baseado no appointmentId
   * Nota: peer_id agora é gerado dinamicamente pelo cliente
   */
  generateRoomIds(appointmentId) {
    return {
      room_id: `appointment-${appointmentId}`
    };
  }

  /**
   * Registra o peer ID do médico quando ele conecta
   * Salva no campo doctor_link da TeleconsultRoom
   * Idempotente: se já registrado, retorna sucesso sem erro
   */
  async registerDoctorPeerId(appointmentId, peerId, userId) {
    const transaction = await sequelize.transaction();
  
    try {
      const doctor = await Doctor.findOne({
        where: { user_id: userId },
        transaction
      });
  
      if (!doctor) {
        throw new Error('Doctor not found');
      }
  
      const appointment = await Appointment.findByPk(appointmentId, {
        transaction
      });
  
      if (!appointment || appointment.doctor_id !== doctor.id) {
        throw new Error('Access denied');
      }
  
      const [teleconsultRoom] = await TeleconsultRoom.findOrCreate({
        where: { appointment_id: appointmentId },
        defaults: {
          appointment_id: appointmentId,
          room_name: `room-${appointmentId}`,
          patient_link: null,
          started_at: new Date()
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
  
      // ✅ SEMPRE sobrescrever
      await teleconsultRoom.update(
        {
          doctor_link: peerId,
          updated_at: new Date()
        },
        { transaction }
      );
  
      await transaction.commit();
  
      return {
        ok: true,
        doctor_peer_id: peerId
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  

  /**
   * Obtém o peer ID atual do médico para uma consulta
   */
  async getDoctorPeerId(appointmentId) {
    const teleconsultRoom = await TeleconsultRoom.findOne({
      where: { appointment_id: appointmentId }
    });

    if (!teleconsultRoom || !teleconsultRoom.doctor_link) {
      return null;
    }

    return teleconsultRoom.doctor_link;
  }

  /**
   * Obtém dados da sala de teleconsulta para um appointment
   * Valida se o usuário tem permissão para acessar
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

    // Validar acesso baseado no role
    if (userRole === 'medico') {
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (!doctor || appointment.doctor_id !== doctor.id) {
        throw new Error('Access denied: This appointment does not belong to you');
      }
    } else if (userRole === 'paciente') {
      let hasAccess = false;

      // Verificar acesso via Patient (patient_id)
      if (appointment.patient_id) {
        const patient = await Patient.findByPk(appointment.patient_id);
        if (patient && patient.user_id === userId) {
          hasAccess = true;
        }
      }

      // Verificar acesso via Beneficiary (beneficiary_id)
      if (!hasAccess && appointment.beneficiary_id) {
        const beneficiary = await Beneficiary.findByPk(appointment.beneficiary_id);
        if (beneficiary) {
          // Acesso direto: beneficiário tem user_id do usuário logado
          if (beneficiary.user_id === userId) {
            hasAccess = true;
          }
          // Acesso como titular: dependente pertence ao titular logado
          if (!hasAccess && beneficiary.type === 'DEPENDENTE' && beneficiary.titular_id) {
            const titular = await Beneficiary.findByPk(beneficiary.titular_id);
            if (titular && titular.user_id === userId) {
              hasAccess = true;
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

    const roomIds = this.generateRoomIds(appointmentId);

    // Buscar peer ID do médico se paciente estiver requisitando
    let doctorPeerId = null;
    if (userRole === 'paciente') {
      doctorPeerId = await this.getDoctorPeerId(appointmentId);
    }

    return {
      appointment_id: appointmentId,
      appointment_status: appointment.status,
      ...roomIds,
      doctor_peer_id: doctorPeerId, // Será null para médico, preenchido para paciente
      peer_server: {
        path: process.env.PEERJS_PATH || '/peerjs',
        secure: process.env.NODE_ENV === 'production'
      }
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
   * (médico precisa ter iniciado a consulta E estar conectado ao PeerServer)
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
      // Verificar se o médico está conectado (tem peer ID registrado)
      const doctorPeerId = await this.getDoctorPeerId(appointmentId);
      if (!doctorPeerId) {
        return { available: false, reason: 'Waiting for doctor to connect to the video room' };
      }
      return { available: true };
    }

    return { available: false, reason: 'Unknown status' };
  }
}

module.exports = new TeleconsultService();
