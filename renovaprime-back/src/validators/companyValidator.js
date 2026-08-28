const { z } = require('zod');

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function preprocessDigits(minLength, message) {
  return z.preprocess(
    (val) => (val === undefined || val === null ? val : normalizeDigits(val)),
    z.string().min(minLength, message)
  );
}

function preprocessZipCode() {
  return z.preprocess(
    (val) => {
      if (val === undefined || val === null) return val;
      return normalizeDigits(val).padStart(8, '0').slice(-8);
    },
    z.string().length(8, 'CEP inválido')
  );
}

function cnpjCheckDigit(base, weights) {
  const sum = base.split('').reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(value) {
  const cnpj = normalizeDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const base = cnpj.slice(0, 12);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = cnpjCheckDigit(base, w1);
  const d2 = cnpjCheckDigit(`${base}${d1}`, w2);
  return cnpj === `${base}${d1}${d2}`;
}

const cnpjSchema = z.preprocess(
  (val) => (val === undefined || val === null ? val : normalizeDigits(val)),
  z.string().refine(isValidCnpj, 'CNPJ inválido')
);

const companyBaseFields = {
  legal_name: z.string().min(2, 'Razão social é obrigatória'),
  trade_name: z.string().min(2, 'Nome fantasia é obrigatório'),
  cnpj: cnpjSchema,
  phone: preprocessDigits(10, 'Telefone inválido'),
  email: z.string().email('E-mail corporativo inválido'),
  zip_code: preprocessZipCode(),
  address: z.string().min(3, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  state_registration: z.string().optional(),
  responsible_name: z.string().min(2, 'Nome do responsável é obrigatório'),
  responsible_email: z.string().email('E-mail de login inválido'),
  responsible_phone: z.string().optional(),
  notes: z.string().optional()
};

const createCompanySchema = z.object({
  ...companyBaseFields,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  active: z.boolean().optional()
}).refine((data) => data.email.toLowerCase() !== data.responsible_email.toLowerCase(), {
  message: 'E-mail corporativo deve ser diferente do e-mail de login',
  path: ['email']
});

const updateCompanySchema = z.object({
  legal_name: companyBaseFields.legal_name.optional(),
  trade_name: companyBaseFields.trade_name.optional(),
  cnpj: cnpjSchema.optional(),
  phone: preprocessDigits(10, 'Telefone inválido').optional(),
  email: companyBaseFields.email.optional(),
  zip_code: preprocessZipCode().optional(),
  address: companyBaseFields.address.optional(),
  city: companyBaseFields.city.optional(),
  state: companyBaseFields.state.optional(),
  state_registration: companyBaseFields.state_registration,
  responsible_name: companyBaseFields.responsible_name.optional(),
  responsible_email: companyBaseFields.responsible_email.optional(),
  responsible_phone: companyBaseFields.responsible_phone,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  notes: companyBaseFields.notes,
  active: z.boolean().optional()
});

const updateCompanyStatusSchema = z.object({
  active: z.boolean()
});

const companyLoginSchema = z.object({
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const updateCompanyProfileSchema = z.object({
  responsible_name: z.string().min(2, 'Nome do responsável é obrigatório').optional(),
  responsible_email: z.string().email('E-mail de login inválido').optional(),
  responsible_phone: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido').optional()
});

const changeCompanyPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

module.exports = {
  normalizeDigits,
  isValidCnpj,
  createCompanySchema,
  updateCompanySchema,
  updateCompanyStatusSchema,
  companyLoginSchema,
  updateCompanyProfileSchema,
  changeCompanyPasswordSchema
};
