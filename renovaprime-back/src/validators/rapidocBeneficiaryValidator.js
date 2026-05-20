const { z } = require('zod');

const planItemSchema = z.object({
  paymentType: z.string().min(1, 'paymentType obrigatório'),
  plan: z.object({
    uuid: z.string().uuid('UUID do plano inválido')
  })
});

/** Campos cadastrais Rapidoc (POST /beneficiaries), sem escolha de plano */
const rapidocVitalScanBeneficiarySchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento use YYYY-MM-DD'),
  phone: z.string().regex(/^\d{10,13}$/, 'Telefone deve ter só dígitos (10 a 13)'),
  email: z.string().email('Email inválido'),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  address: z.string().min(5, 'Endereço obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado com 2 letras')
});

const rapidocCreateBeneficiarySchema = rapidocVitalScanBeneficiarySchema.extend({
  plans: z.array(planItemSchema).min(1, 'Informe ao menos um plano')
});

const faceScanCpfSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
});

module.exports = {
  rapidocCreateBeneficiarySchema,
  rapidocVitalScanBeneficiarySchema,
  faceScanCpfSchema
};
