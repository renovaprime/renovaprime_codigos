const adminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await adminService.getDashboard();
      return res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }

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

  async listAdminAppointments(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        specialtyId: req.query.specialtyId,
        doctorId: req.query.doctorId,
        beneficiaryId: req.query.beneficiaryId,
        type: req.query.type,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await adminService.listAdminAppointments(filters);
      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async listAppointmentSpecialties(req, res, next) {
    try {
      const specialties = await adminService.listAppointmentSpecialties();
      return res.json(successResponse(specialties));
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentMonthAvailability(req, res, next) {
    try {
      const { specialtyId, yearMonth } = req.params;
      const [year, month] = yearMonth.split('-').map(Number);

      if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json(errorResponse('Invalid year-month format. Use YYYY-MM', 'VALIDATION_ERROR'));
      }

      const availableDays = await adminService.getAppointmentMonthAvailability(
        parseInt(specialtyId, 10),
        year,
        month
      );

      return res.json(successResponse(availableDays));
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentDaySlots(req, res, next) {
    try {
      const { specialtyId, date } = req.params;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json(errorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'));
      }

      const slots = await adminService.getAppointmentDaySlots(parseInt(specialtyId, 10), date);
      return res.json(successResponse(slots));
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const appointment = await adminService.createAppointmentForBeneficiary(req.body, req.user.id);
      return res.status(201).json(successResponse(appointment));
    } catch (error) {
      if (
        error.message.includes('past') ||
        error.message.includes('available') ||
        error.message.includes('not found') ||
        error.message.includes('inactive')
      ) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  }

  async listAdminAppointmentsHistory(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        specialtyId: req.query.specialtyId,
        doctorId: req.query.doctorId,
        beneficiaryId: req.query.beneficiaryId,
        type: req.query.type,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await adminService.listAdminAppointmentsHistory(filters);
      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getAdminAppointmentById(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await adminService.getAdminAppointmentById(appointmentId);
      return res.json(successResponse(appointment));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async cancelAdminAppointment(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id);
      const result = await adminService.cancelAdminAppointment(appointmentId, req.user.id);
      return res.json(successResponse(result));
    } catch (error) {
      if (error.message === 'Appointment not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message === 'Only scheduled appointments can be canceled') {
        return res.status(409).json(errorResponse(error.message, 'CONFLICT'));
      }
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
      if (error.original?.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json(errorResponse(
          'Não é possível excluir esta especialidade pois existem profissionais ou consultas vinculados a ela.',
          'SPECIALTY_IN_USE'
        ));
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
        // Verificar qual campo causou o conflito
        const field = error.fields ? Object.keys(error.fields)[0] : null;
        if (field && field.includes('cpf')) {
          return res.status(409).json(errorResponse('CPF já cadastrado para outro usuário', 'CPF_CONFLICT'));
        }
        if (field && field.includes('email')) {
          return res.status(409).json(errorResponse('Email já cadastrado para outro usuário', 'EMAIL_CONFLICT'));
        }
        return res.status(409).json(errorResponse('Dados duplicados encontrados', 'CONFLICT'));
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

  async syncDoctorWithMemed(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id);
      const result = await adminService.syncDoctorWithMemed(doctorId);
      return res.json(successResponse(result));
    } catch (error) {
      console.error('Error syncing doctor with Memed:', error);
      if (error.message === 'Doctor not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.message.includes('obrigatório') || error.message.includes('obrigatória')) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }
      if (error.message.includes('Falha ao sincronizar')) {
        return res.status(502).json(errorResponse(error.message, 'MEMED_SYNC_ERROR'));
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
        search: req.query.search,
        type: req.query.type,
        status: req.query.status,
        faceScan: req.query.faceScan,
        company_id: req.query.company_id
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

  async patchBeneficiaryFaceScan(req, res, next) {
    try {
      const beneficiaryId = parseInt(req.params.id, 10);
      const { enabled } = req.body;
      const beneficiary = await adminService.setBeneficiaryFaceScanEnabled(
        beneficiaryId,
        enabled
      );
      return res.json(successResponse(beneficiary));
    } catch (error) {
      if (error.message === 'Beneficiary not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      if (error.code === 'FACE_SCAN_INCOMPLETE_DATA') {
        return res.status(422).json(errorResponse(error.message, error.code));
      }
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.code || 'RAPIDOC_ERROR'));
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
