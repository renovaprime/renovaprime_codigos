const { z } = require('zod');

const tierSchema = z.object({
  lives_from: z.number().int().min(1),
  lives_to: z.number().int().min(1),
  unit_price: z.number().positive()
});

const billingTypeSchema = z.enum(['PER_LIFE', 'PER_FAMILY']);
const serviceTypeSchema = z.enum(['CLINICO', 'PREMIUM', 'FAMILIAR']);

const createCompanyPlanSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  billing_type: billingTypeSchema,
  service_type: serviceTypeSchema,
  tiers: z.array(tierSchema).optional().default([])
});

const updateCompanyPlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  billing_type: billingTypeSchema.optional(),
  service_type: serviceTypeSchema.optional(),
  tiers: z.array(tierSchema).optional()
});

const updateCompanyPlanStatusSchema = z.object({
  active: z.boolean()
});

const createCompanyContractSchema = z.object({
  company_plan_id: z.number().int().positive(),
  due_day: z.number().int().min(1).max(28).optional().default(5),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  force: z.boolean().optional().default(false)
});

const updateCompanyContractStatusSchema = z.object({
  active: z.boolean()
});

function validateBillingServiceCoherence(billingType, serviceType) {
  if (billingType === 'PER_FAMILY' && serviceType !== 'FAMILIAR') {
    return 'PER_FAMILY exige service_type FAMILIAR';
  }
  if (serviceType === 'FAMILIAR' && billingType !== 'PER_FAMILY') {
    return 'FAMILIAR exige billing_type PER_FAMILY';
  }
  if ((serviceType === 'CLINICO' || serviceType === 'PREMIUM') && billingType !== 'PER_LIFE') {
    return `${serviceType} exige billing_type PER_LIFE`;
  }
  return null;
}

function validateTiers(tiers) {
  if (!tiers || tiers.length === 0) {
    return null;
  }

  const sorted = [...tiers].sort((a, b) => a.lives_from - b.lives_from);

  for (const tier of sorted) {
    if (tier.lives_from < 1) {
      return 'lives_from deve ser >= 1';
    }
    if (tier.lives_from > tier.lives_to) {
      return 'lives_from deve ser <= lives_to';
    }
    if (tier.unit_price <= 0) {
      return 'unit_price deve ser maior que zero';
    }
  }

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].lives_from <= sorted[i - 1].lives_to) {
      return 'Faixas de preço não podem se sobrepor';
    }
  }

  return null;
}

module.exports = {
  createCompanyPlanSchema,
  updateCompanyPlanSchema,
  updateCompanyPlanStatusSchema,
  createCompanyContractSchema,
  updateCompanyContractStatusSchema,
  validateBillingServiceCoherence,
  validateTiers
};
