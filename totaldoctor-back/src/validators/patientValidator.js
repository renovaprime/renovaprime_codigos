const { z } = require('zod');

const createPatientSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birth_date: z.string().optional(),
  phone: z.string().optional()
});

module.exports = {
  createPatientSchema
};
