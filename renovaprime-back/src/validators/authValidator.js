const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
