const { z } = require('zod');

const emitPrescriptionSchema = z.object({
  external_id: z.string().min(1, 'External ID is required')
});

module.exports = {
  emitPrescriptionSchema
};
