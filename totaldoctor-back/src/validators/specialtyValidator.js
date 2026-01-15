const { z } = require('zod');

const createSpecialtySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  active: z.boolean().optional()
});

const updateSpecialtySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  active: z.boolean().optional()
});

module.exports = {
  createSpecialtySchema,
  updateSpecialtySchema
};
