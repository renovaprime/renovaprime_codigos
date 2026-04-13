const { Doctor } = require('../models');
const { errorResponse } = require('../utils/response');

const doctorApprovedMiddleware = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { user_id: req.user.id }
    });

    if (!doctor) {
      return res.status(403).json(errorResponse('Doctor profile not found', 'FORBIDDEN'));
    }

    if (!doctor.approved_at) {
      return res.status(403).json(errorResponse('Doctor not yet approved', 'FORBIDDEN'));
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    return res.status(500).json(errorResponse('Doctor verification failed', 'INTERNAL_ERROR'));
  }
};

module.exports = doctorApprovedMiddleware;
