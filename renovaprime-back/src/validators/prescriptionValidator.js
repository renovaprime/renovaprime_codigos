const { z } = require('zod');

const emitPrescriptionSchema = z.object({
  memed_prescription_id: z.number().int().positive('memed_prescription_id must be a positive integer'),
  memed_uuid: z.string().min(1, 'memed_uuid is required').max(50),
  memed_patient_id: z.number().int().positive().nullable().optional(),
  memed_payload: z.record(z.any(), 'memed_payload must be a valid JSON object')
});

module.exports = {
  emitPrescriptionSchema
};
