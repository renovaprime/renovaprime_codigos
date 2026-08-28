const { z } = require('zod');

const kinshipEnum = z.enum(['conjuge', 'filho', 'enteado', 'pai', 'mae', 'irmao', 'outro']);

const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido');
const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

const createCompanyTitularSchema = z.object({
  type: z.literal('TITULAR'),
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: cpfSchema,
  birth_date: birthDateSchema,
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  phone: z.string().optional(),
  cep: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  address: z.string().optional()
});

const createCompanyDependentSchema = z.object({
  type: z.literal('DEPENDENTE'),
  titular_id: z.number().int().positive(),
  kinship: kinshipEnum,
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: cpfSchema,
  birth_date: birthDateSchema,
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  address: z.string().optional()
});

const createCompanyBeneficiarySchema = z.discriminatedUnion('type', [
  createCompanyTitularSchema,
  createCompanyDependentSchema
]);

const updateCompanyBeneficiarySchema = z.object({
  name: z.string().min(3).optional(),
  cpf: cpfSchema.optional(),
  birth_date: birthDateSchema.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  cep: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional().or(z.literal('')),
  address: z.string().optional(),
  kinship: kinshipEnum.optional(),
  status: z.enum(['INACTIVE']).optional()
});

const grantCompanyDependentAccessSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres')
});

module.exports = {
  createCompanyBeneficiarySchema,
  updateCompanyBeneficiarySchema,
  grantCompanyDependentAccessSchema
};
