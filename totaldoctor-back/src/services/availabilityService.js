const { Op } = require('sequelize');
const { Doctor, DoctorSpecialty, DoctorSchedule, DoctorScheduleBlock, Appointment, User, Specialty } = require('../models');

class AvailabilityService {
  /**
   * Retorna os dias do mês que têm horários disponíveis para uma especialidade
   * @param {number} specialtyId - ID da especialidade
   * @param {number} year - Ano (ex: 2026)
   * @param {number} month - Mês (1-12)
   * @returns {Promise<number[]>} Array de dias disponíveis [1, 3, 5, 10, ...]
   */
  async getAvailableMonthDays(specialtyId, year, month) {
    // Buscar médicos que atendem essa especialidade e estão aprovados
    const doctors = await this.getDoctorsBySpecialty(specialtyId);
    
    if (doctors.length === 0) {
      return [];
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const availableDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Para cada dia do mês, verificar se há pelo menos 1 horário disponível
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      
      // Não mostrar dias no passado
      if (date < today) {
        continue;
      }

      const weekday = date.getDay();
      
      // Verificar se algum médico trabalha neste dia da semana
      const hasSchedule = await this.hasAnyDoctorScheduleForDay(doctors, weekday);
      
      if (hasSchedule) {
        availableDays.push(day);
      }
    }

    return availableDays;
  }

  /**
   * Retorna os horários disponíveis para um dia específico
   * @param {number} specialtyId - ID da especialidade
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de slots disponíveis
   */
  async getAvailableSlotsForDay(specialtyId, date) {
    const doctors = await this.getDoctorsBySpecialty(specialtyId);
    
    if (doctors.length === 0) {
      return [];
    }

    const appointmentDate = new Date(date);
    const weekday = appointmentDate.getDay();
    const slots = [];

    // Para cada médico, gerar slots disponíveis
    for (const doctor of doctors) {
      const doctorSlots = await this.generateDoctorSlots(doctor.id, weekday, date);
      slots.push(...doctorSlots);
    }

    // Agrupar slots por horário (se múltiplos médicos têm o mesmo horário livre)
    const groupedSlots = this.groupSlotsByTime(slots);

    return groupedSlots;
  }

  /**
   * Encontra o melhor médico disponível para um slot específico
   * @param {number} specialtyId - ID da especialidade
   * @param {string} date - Data no formato YYYY-MM-DD
   * @param {string} startTime - Horário de início (HH:MM:SS)
   * @returns {Promise<number|null>} ID do médico ou null se não houver disponível
   */
  async findBestDoctorForSlot(specialtyId, date, startTime) {
    const doctors = await this.getDoctorsBySpecialty(specialtyId);
    const appointmentDate = new Date(date);
    const weekday = appointmentDate.getDay();

    for (const doctor of doctors) {
      const isAvailable = await this.isDoctorAvailableForSlot(
        doctor.id,
        weekday,
        date,
        startTime
      );

      if (isAvailable) {
        return doctor.id;
      }
    }

    return null;
  }

  /**
   * Busca médicos aprovados que atendem uma especialidade
   */
  async getDoctorsBySpecialty(specialtyId) {
    const doctors = await Doctor.findAll({
      where: { 
        approved_at: { [Op.ne]: null }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status'],
          where: { status: 'ACTIVE' }
        },
        {
          model: Specialty,
          through: { attributes: [] },
          where: { id: specialtyId },
          attributes: []
        }
      ]
    });

    return doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.User.name
    }));
  }

  /**
   * Verifica se algum médico trabalha em um dia da semana específico
   */
  async hasAnyDoctorScheduleForDay(doctors, weekday) {
    const doctorIds = doctors.map(d => d.id);
    
    const schedule = await DoctorSchedule.findOne({
      where: {
        doctor_id: { [Op.in]: doctorIds },
        weekday: weekday
      }
    });

    return !!schedule;
  }

  /**
   * Gera slots disponíveis para um médico em um dia específico
   */
  async generateDoctorSlots(doctorId, weekday, date) {
    // Buscar horário de trabalho do médico neste dia da semana
    const schedule = await DoctorSchedule.findOne({
      where: { doctor_id: doctorId, weekday: weekday }
    });

    if (!schedule) {
      return [];
    }

    // Buscar bloqueios do médico para esta data
    const blocks = await DoctorScheduleBlock.findAll({
      where: { doctor_id: doctorId, date: date }
    });

    // Buscar agendamentos já marcados
    const appointments = await Appointment.findAll({
      where: {
        doctor_id: doctorId,
        date: date,
        status: { [Op.ne]: 'CANCELED' }
      }
    });

    // Gerar slots de 30 minutos
    const slots = [];
    const startMinutes = this.timeToMinutes(schedule.start_time);
    const endMinutes = this.timeToMinutes(schedule.end_time);
    const slotDuration = 30; // minutos

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const slotTime = this.minutesToTime(minutes);
      const slotEndTime = this.minutesToTime(minutes + slotDuration);

      // Verificar se está bloqueado
      const isBlocked = this.isTimeBlocked(slotTime, slotEndTime, blocks);
      
      // Verificar se já está agendado
      const isBooked = this.isTimeBooked(slotTime, slotEndTime, appointments);

      if (!isBlocked && !isBooked) {
        slots.push({
          time: slotTime,
          doctor_id: doctorId,
          duration: slotDuration
        });
      }
    }

    return slots;
  }

  /**
   * Verifica se médico está disponível para um slot específico
   */
  async isDoctorAvailableForSlot(doctorId, weekday, date, startTime) {
    const slots = await this.generateDoctorSlots(doctorId, weekday, date);
    return slots.some(slot => slot.time === startTime);
  }

  /**
   * Agrupa slots por horário
   */
  groupSlotsByTime(slots) {
    const grouped = {};

    for (const slot of slots) {
      if (!grouped[slot.time]) {
        grouped[slot.time] = slot;
      }
    }

    return Object.values(grouped).sort((a, b) => a.time.localeCompare(b.time));
  }

  /**
   * Verifica se um horário está bloqueado
   */
  isTimeBlocked(slotTime, slotEndTime, blocks) {
    return blocks.some(block => {
      return this.timesOverlap(
        slotTime,
        slotEndTime,
        block.start_time,
        block.end_time
      );
    });
  }

  /**
   * Verifica se um horário já está agendado
   */
  isTimeBooked(slotTime, slotEndTime, appointments) {
    return appointments.some(appointment => {
      return this.timesOverlap(
        slotTime,
        slotEndTime,
        appointment.start_time,
        appointment.end_time
      );
    });
  }

  /**
   * Verifica se dois intervalos de tempo se sobrepõem
   */
  timesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Converte horário HH:MM:SS para minutos desde meia-noite
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converte minutos desde meia-noite para HH:MM:SS
   */
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  }
}

module.exports = new AvailabilityService();
