const { z } = require('zod');

const createPendingDoctorSchema = z.object({
  // Dados de acesso (todos obrigatórios)
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Formato de email inválido'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  
  // Dados profissionais (todos obrigatórios)
  profession: z.enum(['MEDICO', 'PSICOLOGO', 'NUTRICIONISTA'], {
    required_error: 'Profissão é obrigatória'
  }),
  registry_type: z.enum(['CRM', 'CRP', 'CFN'], {
    required_error: 'Tipo de registro é obrigatório'
  }),
  registry_number: z.string().min(1, 'Número do registro é obrigatório'),
  registry_uf: z.string().length(2, 'UF do registro deve ter 2 caracteres'),
  rqe: z.string().optional(),
  
  // Especialidades (obrigatório)
  specialty_ids: z.array(z.number()).min(1, 'Selecione pelo menos uma especialidade'),
  
  // URLs de documentos (todos obrigatórios)
  photo_url: z.string().url('URL da foto é obrigatória').min(1, 'Foto é obrigatória'),
  council_doc_url: z.string().url('Documento do conselho é obrigatório').min(1, 'Documento do conselho é obrigatório'),
  specialization_doc_url: z.string().url('Comprovante de especialização é obrigatório').min(1, 'Comprovante de especialização é obrigatório'),
  acceptance_term_url: z.string().url('Termo de aceite é obrigatório').min(1, 'Termo de aceite é obrigatório')
}).refine((data) => {
  // Validação condicional: UF obrigatório para Médico e Psicólogo
  if ((data.profession === 'MEDICO' || data.profession === 'PSICOLOGO') && !data.registry_uf) {
    return false;
  }
  return true;
}, {
  message: 'UF do registro é obrigatória para Médicos e Psicólogos',
  path: ['registry_uf']
});

module.exports = {
  createPendingDoctorSchema
};
