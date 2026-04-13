const { z } = require('zod');

const vitalsSchema = z.object({
  blood_pressure: z.string().optional(),
  heart_rate: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  spo2: z.number().optional(),
  respiratory_rate: z.number().optional(),
}).passthrough().optional();

const createRecordSchema = z.object({
  appointment_id: z.number().int().positive('appointment_id deve ser um inteiro positivo'),
  chief_complaint: z.string().optional(),
  hpi: z.string().optional(),
  personal_history: z.string().optional(),
  surgical_history: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  comorbidities: z.string().optional(),
  habits: z.string().optional(),
  family_history: z.string().optional(),
  vitals_json: vitalsSchema,
  physical_exam: z.string().optional(),
  assessment: z.string().optional(),
  diagnosis: z.string().optional(),
  cid10: z.string().max(10).optional(),
  plan: z.string().optional(),
  guidance: z.string().optional(),
  return_instructions: z.string().optional(),
  red_flags: z.string().optional(),
  referrals: z.string().optional(),
  exam_requests: z.string().optional(),
});

const updateRecordSchema = z.object({
  chief_complaint: z.string().optional(),
  hpi: z.string().optional(),
  personal_history: z.string().optional(),
  surgical_history: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  comorbidities: z.string().optional(),
  habits: z.string().optional(),
  family_history: z.string().optional(),
  vitals_json: vitalsSchema,
  physical_exam: z.string().optional(),
  assessment: z.string().optional(),
  diagnosis: z.string().optional(),
  cid10: z.string().max(10).optional(),
  plan: z.string().optional(),
  guidance: z.string().optional(),
  return_instructions: z.string().optional(),
  red_flags: z.string().optional(),
  referrals: z.string().optional(),
  exam_requests: z.string().optional(),
});

const addAttachmentSchema = z.object({
  category: z.enum(['EXAM', 'IMAGE', 'REPORT', 'CERTIFICATE', 'REFERRAL', 'OTHER']),
  file_name: z.string().min(1, 'file_name e obrigatorio'),
  file_url: z.string().min(1, 'file_url e obrigatorio'),
  mime_type: z.string().optional(),
});

const createConsentSchema = z.object({
  appointment_id: z.number().int().positive('appointment_id deve ser um inteiro positivo'),
  beneficiary_id: z.number().int().positive('beneficiary_id deve ser um inteiro positivo'),
  version: z.string().min(1, 'version e obrigatorio'),
  accepted: z.boolean(),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  addAttachmentSchema,
  createConsentSchema,
};
