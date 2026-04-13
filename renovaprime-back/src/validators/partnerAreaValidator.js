const { z } = require('zod');

const partnerLoginSchema = z.object({
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const updatePartnerProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  cnpj: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
  bank_digit: z.string().optional(),
  pix_key: z.string().optional(),
  website_url: z.string().optional(),
});

const updateBranchProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  alias: z.string().optional(),
  address: z.string().optional(),
});

const updateResellerProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  phone: z.string().optional(),
  pix_key: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

module.exports = {
  partnerLoginSchema,
  updatePartnerProfileSchema,
  updateBranchProfileSchema,
  updateResellerProfileSchema,
  changePasswordSchema
};
