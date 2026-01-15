const { z } = require('zod');

const createDoctorSchema = z.object({
  // Dados de acesso
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'BLOCKED']).default('ACTIVE'),
  
  // Dados profissionais
  profession: z.enum(['MEDICO', 'PSICOLOGO', 'NUTRICIONISTA'], {
    required_error: 'Profession is required'
  }),
  registry_type: z.enum(['CRM', 'CRP', 'CFN']),
  registry_number: z.string().min(1, 'Registry number is required'),
  registry_uf: z.string().length(2, 'Registry UF must be 2 characters').optional(),
  rqe: z.string().optional(),
  
  // Especialidades
  specialty_ids: z.array(z.number()).min(1, 'At least one specialty is required'),
  
  // Aprovação
  approved: z.boolean().default(false),
  
  // URLs de documentos (opcionais)
  photo_url: z.string().url().optional().or(z.literal('')),
  council_doc_url: z.string().url().optional().or(z.literal('')),
  specialization_doc_url: z.string().url().optional().or(z.literal('')),
  acceptance_term_url: z.string().url().optional().or(z.literal(''))
}).refine((data) => {
  // Validação condicional: UF obrigatório para Médico e Psicólogo
  if ((data.profession === 'MEDICO' || data.profession === 'PSICOLOGO') && !data.registry_uf) {
    return false;
  }
  return true;
}, {
  message: 'Registry UF is required for Doctors and Psychologists',
  path: ['registry_uf']
});

const updateDoctorSchema = z.object({
  // Dados de acesso (todos opcionais)
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'PENDING', 'BLOCKED']).optional(),
  
  // Dados profissionais (todos opcionais)
  profession: z.enum(['MEDICO', 'PSICOLOGO', 'NUTRICIONISTA']).optional(),
  registry_type: z.enum(['CRM', 'CRP', 'CFN']).optional(),
  registry_number: z.string().min(1, 'Registry number is required').optional(),
  registry_uf: z.string().length(2, 'Registry UF must be 2 characters').optional(),
  rqe: z.string().optional(),
  
  // Especialidades
  specialty_ids: z.array(z.number()).min(1, 'At least one specialty is required').optional(),
  
  // Aprovação
  approved: z.boolean().optional(),
  
  // URLs de documentos (opcionais)
  photo_url: z.string().url().optional().or(z.literal('')).or(z.null()),
  council_doc_url: z.string().url().optional().or(z.literal('')).or(z.null()),
  specialization_doc_url: z.string().url().optional().or(z.literal('')).or(z.null()),
  acceptance_term_url: z.string().url().optional().or(z.literal('')).or(z.null())
}).refine((data) => {
  // Validação condicional: UF obrigatório para Médico e Psicólogo (se profissão fornecida)
  if (data.profession && (data.profession === 'MEDICO' || data.profession === 'PSICOLOGO') && !data.registry_uf) {
    return false;
  }
  return true;
}, {
  message: 'Registry UF is required for Doctors and Psychologists',
  path: ['registry_uf']
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema
};
