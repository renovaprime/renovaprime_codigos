const { z } = require('zod');

const createBeneficiarySchema = z.object({
  type: z.enum(['TITULAR', 'DEPENDENTE']).default('TITULAR'),
  titular_id: z.number().optional(),
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  cep: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  address: z.string().optional(),
  service_type: z.enum(['CLINICO', 'PREMIUM', 'FAMILIAR']).default('CLINICO')
}).refine((data) => {
  // Dependente deve ter titular_id
  if (data.type === 'DEPENDENTE' && !data.titular_id) return false;
  // Titular não deve ter titular_id
  if (data.type === 'TITULAR' && data.titular_id) return false;
  return true;
}, { 
  message: 'Dependente deve ter titular associado',
  path: ['titular_id']
});

const updateBeneficiarySchema = z.object({
  type: z.enum(['TITULAR', 'DEPENDENTE']).optional(),
  titular_id: z.number().optional(),
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido').optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional(),
  cep: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  address: z.string().optional(),
  service_type: z.enum(['CLINICO', 'PREMIUM', 'FAMILIAR']).optional()
}).refine((data) => {
  // Se tipo for alterado para dependente, deve ter titular_id
  if (data.type === 'DEPENDENTE' && data.titular_id === undefined) return true; // Permitir se não mudar titular
  if (data.type === 'DEPENDENTE' && !data.titular_id) return false;
  // Titular não deve ter titular_id
  if (data.type === 'TITULAR' && data.titular_id) return false;
  return true;
}, { 
  message: 'Dependente deve ter titular associado',
  path: ['titular_id']
});

module.exports = {
  createBeneficiarySchema,
  updateBeneficiarySchema
};
