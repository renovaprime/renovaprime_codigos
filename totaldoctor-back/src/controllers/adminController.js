const adminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  async listPendingDoctors(req, res, next) {
    try {
      const doctors = await adminService.listPendingDoctors();
      return res.json(successResponse(doctors));
    } catch (error) {
      next(error);
    }
  }

  async approveDoctor(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await adminService.approveDoctor(doctorId, req.user.id);
      return res.json(successResponse(doctor));
    } catch (error) {
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('already approved')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_STATE'));
      }
      next(error);
    }
  }

  async rejectDoctor(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await adminService.rejectDoctor(doctorId, req.user.id);
      return res.json(successResponse(doctor));
    } catch (error) {
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async listAppointments(req, res, next) {
    try {
      const appointments = await adminService.listAllAppointments();
      return res.json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async createSpecialty(req, res, next) {
    try {
      const specialty = await adminService.createSpecialty(req.body);
      return res.status(201).json(successResponse(specialty));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Specialty already exists', 'CONFLICT'));
      }
      next(error);
    }
  }

  async updateSpecialty(req, res, next) {
    try {
      const specialtyId = parseInt(req.params.id);
      const specialty = await adminService.updateSpecialty(specialtyId, req.body);
      return res.json(successResponse(specialty));
    } catch (error) {
      if (error.message === 'Specialty not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async listSpecialties(req, res, next) {
    try {
      const specialties = await adminService.listSpecialties();
      return res.json(successResponse(specialties));
    } catch (error) {
      next(error);
    }
  }

  async toggleSpecialty(req, res, next) {
    try {
      const specialtyId = parseInt(req.params.id);
      const specialty = await adminService.toggleSpecialty(specialtyId);
      return res.json(successResponse(specialty));
    } catch (error) {
      if (error.message === 'Specialty not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteSpecialty(req, res, next) {
    try {
      const specialtyId = parseInt(req.params.id);
      await adminService.deleteSpecialty(specialtyId);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Specialty not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createDoctor(req, res, next) {
    try {
      const doctor = await adminService.createDoctor(req.body);
      return res.status(201).json(successResponse(doctor));
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email already in use', 'CONFLICT'));
      }
      if (error.message === 'Doctor role not found') {
        return res.status(500).json(errorResponse(error.message, 'SERVER_ERROR'));
      }
      next(error);
    }
  }

  async listActiveDoctors(req, res, next) {
    try {
      const doctors = await adminService.listActiveDoctors();
      // Debug: mostrar o primeiro resultado
      if (doctors.length > 0) {
        console.log('First doctor:', JSON.stringify(doctors[0], null, 2));
      }
      return res.json(successResponse(doctors));
    } catch (error) {
      next(error);
    }
  }

  async getDoctorById(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await adminService.getDoctorById(doctorId);
      return res.json(successResponse(doctor));
    } catch (error) {
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async updateDoctor(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await adminService.updateDoctor(doctorId, req.body);
      return res.json(successResponse(doctor));
    } catch (error) {
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(errorResponse('Email already in use', 'CONFLICT'));
      }
      next(error);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      await adminService.deleteDoctor(doctorId);
      return res.json(successResponse({ message: 'Doctor deleted successfully' }));
    } catch (error) {
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  // ==================== Beneficiários ====================

  async listBeneficiaries(req, res, next) {
    try {
      const filters = {
        name: req.query.name,
        cpf: req.query.cpf,
        type: req.query.type,
        status: req.query.status
      };
      
      const beneficiaries = await adminService.listBeneficiaries(filters);
      return res.json(successResponse(beneficiaries));
    } catch (error) {
      next(error);
    }
  }

  async getBeneficiaryById(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.id);
      const beneficiary = await adminService.getBeneficiaryById(beneficiaryId);
      return res.json(successResponse(beneficiary));
    } catch (error) {
      if (error.message === 'Beneficiary not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async createBeneficiary(req, res, next) {
    try {
      const beneficiary = await adminService.createBeneficiary(req.body, req.user.id);
      return res.status(201).json(successResponse(beneficiary));
    } catch (error) {
      if (error.message === 'CPF already registered') {
        return res.status(409).json(errorResponse(error.message, 'CONFLICT'));
      }
      if (error.message === 'Titular not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async updateBeneficiary(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.id);
      const beneficiary = await adminService.updateBeneficiary(beneficiaryId, req.body);
      return res.json(successResponse(beneficiary));
    } catch (error) {
      if (error.message === 'Beneficiary not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'CPF already registered') {
        return res.status(409).json(errorResponse(error.message, 'CONFLICT'));
      }
      if (error.message === 'Titular not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async toggleBeneficiaryStatus(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.id);
      const includeDependents = req.query.includeDependents === 'true';
      
      let beneficiary;
      if (includeDependents) {
        beneficiary = await adminService.toggleBeneficiaryStatusWithDependents(beneficiaryId, true);
      } else {
        beneficiary = await adminService.toggleBeneficiaryStatus(beneficiaryId);
      }
      
      return res.json(successResponse(beneficiary));
    } catch (error) {
      if (error.message === 'Beneficiary not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async listDependents(req, res, next) {
    try {
      const titularId = parseInt(req.params.id);
      const dependents = await adminService.listDependents(titularId);
      return res.json(successResponse(dependents));
    } catch (error) {
      if (error.message === 'Titular not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async deleteBeneficiary(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.id);
      await adminService.deleteBeneficiary(beneficiaryId);
      return res.json(successResponse({ message: 'Beneficiary deleted successfully' }));
    } catch (error) {
      if (error.message === 'Beneficiary not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('Cannot delete titular with dependents')) {
        return res.status(400).json(errorResponse(error.message, 'INVALID_OPERATION'));
      }
      next(error);
    }
  }
}

module.exports = new AdminController();
