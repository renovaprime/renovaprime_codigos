const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/auth');
const doctorApprovedMiddleware = require('../middlewares/doctorApproved');
const permissionMiddleware = require('../middlewares/permission');
const validate = require('../validators/validate');
const { registerDoctorSchema, configureScheduleSchema, scheduleBlockSchema } = require('../validators/doctorValidator');

router.post('/register', validate(registerDoctorSchema), doctorController.register);

// Schedules routes
router.get(
  '/schedules',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  doctorController.getSchedules
);

router.post(
  '/schedules',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  validate(configureScheduleSchema),
  doctorController.configureSchedule
);

// Schedule blocks routes
router.get(
  '/schedule-blocks',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  doctorController.getScheduleBlocks
);

router.post(
  '/schedule-blocks',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  validate(scheduleBlockSchema),
  doctorController.createScheduleBlock
);

router.put(
  '/schedule-blocks/:id',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  validate(scheduleBlockSchema),
  doctorController.updateScheduleBlock
);

router.delete(
  '/schedule-blocks/:id',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  doctorController.deleteScheduleBlock
);

// Appointments route
router.get(
  '/appointments',
  authMiddleware,
  permissionMiddleware('medico'),
  doctorApprovedMiddleware,
  doctorController.listAppointments
);

module.exports = router;
