const { z } = require('zod');

const dependentSchema = z.object({
  name: z.string().min(3, 'Nome do dependente deve ter ao menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF do dependente deve ter 11 dígitos'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida')
});

const creditCardSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/, 'Número do cartão inválido'),
  holderName: z.string().min(3, 'Nome no cartão deve ter ao menos 3 caracteres'),
  expiryMonth: z.string().regex(/^\d{2}$/, 'Mês de validade inválido'),
  expiryYear: z.string().regex(/^\d{4}$/, 'Ano de validade inválido'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV inválido')
});

const checkoutSchema = z.object({
  // Plan selection
  planId: z.number().min(1).max(3, 'Plano inválido'),

  // Personal data
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida'),

  // Address
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  address: z.string().min(5, 'Endereço deve ter ao menos 5 caracteres'),
  addressNumber: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(2, 'Cidade deve ter ao menos 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),

  // Credit card
  creditCard: creditCardSchema,

  // Dependents (optional, only for FAMILIAR plan)
  dependents: z.array(dependentSchema).max(3, 'Máximo de 3 dependentes').optional()
}).refine((data) => {
  // FAMILIAR plan requires at least 1 dependent
  if (data.planId === 3) {
    return data.dependents && data.dependents.length >= 1;
  }
  return true;
}, {
  message: 'Plano familiar requer ao menos 1 dependente',
  path: ['dependents']
});

module.exports = {
  checkoutSchema
};
