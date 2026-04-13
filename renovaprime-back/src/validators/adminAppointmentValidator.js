const { z } = require('zod');

const createAdminAppointmentSchema = z.object({
  beneficiary_id: z.number().positive('Beneficiary ID must be a positive number'),
  specialty_id: z.number().positive('Specialty ID must be a positive number'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(dateStr => {
      const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
      return dateStr >= todayStr;
    }, 'Date cannot be in the past'),
  start_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format. Use HH:MM:SS')
});

module.exports = {
  createAdminAppointmentSchema
};
