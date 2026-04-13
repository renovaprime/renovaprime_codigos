const { z } = require('zod');

const createAppointmentSchema = z.object({
  doctor_id: z.number().positive(),
  patient_id: z.number().positive(),
  specialty_id: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format')
});

module.exports = {
  createAppointmentSchema
};
