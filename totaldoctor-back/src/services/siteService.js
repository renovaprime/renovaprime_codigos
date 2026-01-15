const sequelize = require('../config/database');
const { Doctor, User, Specialty, Role, DoctorSpecialty } = require('../models');
const { hashPassword } = require('../utils/hash');
const crypto = require('crypto');

class SiteService {
  async createPendingDoctor(data) {
    const transaction = await sequelize.transaction();

    try {
      // Buscar role de médico
      const doctorRole = await Role.findOne({ where: { name: 'MEDICO' } });
      
      if (!doctorRole) {
        throw new Error('Doctor role not found');
      }

      // Gerar senha temporária aleatória (usuário não recebe imediatamente)
      const password = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(password);

      // Criar usuário com status PENDING
      const user = await User.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password_hash: hashedPassword,
        role_id: doctorRole.id,
        status: 'PENDING'
      }, { transaction });

      // Criar médico sem aprovação
      const doctor = await Doctor.create({
        user_id: user.id,
        profession: data.profession,
        registry_type: data.registry_type,
        registry_number: data.registry_number,
        registry_uf: data.registry_uf,
        rqe: data.rqe || null,
        photo_url: data.photo_url,
        council_doc_url: data.council_doc_url,
        specialization_doc_url: data.specialization_doc_url,
        acceptance_term_url: data.acceptance_term_url,
        approved_at: null // Pendente de aprovação
      }, { transaction });

      // Criar associações com especialidades
      if (data.specialty_ids && data.specialty_ids.length > 0) {
        const specialtyRecords = data.specialty_ids.map(specialtyId => ({
          doctor_id: doctor.id,
          specialty_id: specialtyId
        }));
        
        await DoctorSpecialty.bulkCreate(specialtyRecords, { transaction });
      }

      await transaction.commit();

      // Retornar apenas informações não sensíveis
      return {
        id: doctor.id,
        name: user.name,
        email: user.email,
        status: 'PENDING',
        message: 'Cadastro enviado com sucesso! Você receberá um email quando for aprovado.'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listActiveSpecialties() {
    return await Specialty.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new SiteService();
