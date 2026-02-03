const { z } = require('zod');

const createPartnerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
  bank_digit: z.string().optional(),
  pix_key: z.string().optional(),
  logo_url: z.string().optional(),
  website_url: z.string().optional(),
  active: z.boolean().optional()
});

const updatePartnerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
  bank_digit: z.string().optional(),
  pix_key: z.string().optional(),
  logo_url: z.string().optional(),
  website_url: z.string().optional(),
  active: z.boolean().optional()
});

const createBranchSchema = z.object({
  partner_id: z.number().int().positive('Partner ID inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  alias: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  active: z.boolean().optional()
});

const updateBranchSchema = z.object({
  partner_id: z.number().int().positive('Partner ID inválido').optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  alias: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  active: z.boolean().optional()
});

const createResellerSchema = z.object({
  branch_id: z.number().int().positive('Branch ID inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.string().optional(),
  pix_key: z.string().optional(),
  functional_unit: z.string().optional(),
  registration_code: z.string().optional(),
  active: z.boolean().optional()
});

const updateResellerSchema = z.object({
  branch_id: z.number().int().positive('Branch ID inválido').optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  cpf: z.string().min(11, 'CPF inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  role: z.string().optional(),
  pix_key: z.string().optional(),
  functional_unit: z.string().optional(),
  registration_code: z.string().optional(),
  active: z.boolean().optional()
});

module.exports = {
  createPartnerSchema,
  updatePartnerSchema,
  createBranchSchema,
  updateBranchSchema,
  createResellerSchema,
  updateResellerSchema
};
