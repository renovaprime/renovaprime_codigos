const { z } = require('zod');

const createPatientAppointmentSchema = z.object({
  specialty_id: z.number().positive('Specialty ID must be a positive number'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(dateStr => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Date cannot be in the past'),
  start_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format. Use HH:MM:SS'),
  beneficiary_id: z.number().positive().optional()
});

module.exports = {
  createPatientAppointmentSchema
};
