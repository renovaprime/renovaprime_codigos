const { z } = require('zod');

const createPatientAppointmentSchema = z.object({
  specialty_id: z.number().positive('Specialty ID must be a positive number'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(dateStr => {
      const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
      return dateStr >= todayStr;
    }, 'Date cannot be in the past'),
  start_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format. Use HH:MM:SS'),
  beneficiary_id: z.number().positive().optional()
});

const manageDependentAccessSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const createDependentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF must contain 11 digits'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format'),
  phone: z.string().min(8).max(20).optional(),
  email: z.string().email('Invalid email format').optional(),
  cep: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  address: z.string().max(255).optional(),
  service_type: z.enum(['CLINICO', 'PREMIUM', 'FAMILIAR']).optional()
});

module.exports = {
  createPatientAppointmentSchema,
  manageDependentAccessSchema,
  createDependentSchema
};
