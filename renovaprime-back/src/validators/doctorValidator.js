const { z } = require('zod');

const registerDoctorSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  crm: z.string().min(4, 'CRM is required'),
  crm_uf: z.string().length(2, 'CRM UF must be 2 characters')
});

const configureScheduleSchema = z.object({
  schedules: z.array(z.object({
    weekday: z.number().min(0).max(6),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format')
  }))
});

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const scheduleBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(timeRegex, 'Invalid time format').optional(),
  end_time: z.string().regex(timeRegex, 'Invalid time format').optional(),
  reason: z.string().max(255, 'Reason is too long').optional()
}).refine(
  (data) => {
    const hasStart = !!data.start_time;
    const hasEnd = !!data.end_time;
    return hasStart === hasEnd;
  },
  { message: 'start_time and end_time must both be provided or both omitted', path: ['end_time'] }
).refine(
  (data) => {
    if (!data.start_time || !data.end_time) return true;
    const normalize = (t) => t.length === 5 ? `${t}:00` : t;
    return normalize(data.start_time) < normalize(data.end_time);
  },
  { message: 'start_time must be before end_time', path: ['start_time'] }
);

module.exports = {
  registerDoctorSchema,
  configureScheduleSchema,
  scheduleBlockSchema
};
