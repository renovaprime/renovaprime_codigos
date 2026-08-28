const { Company } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { Op } = require('sequelize');

class CompanyAreaService {
  _sanitize(company) {
    const result = company.toJSON();
    delete result.password_hash;
    delete result.password;
    return result;
  }

  async getProfile(companyAuth) {
    const company = await Company.findByPk(companyAuth.entityId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    return this._sanitize(company);
  }

  async updateProfile(companyAuth, data) {
    const company = await Company.findByPk(companyAuth.entityId);

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (data.responsible_email && data.responsible_email !== company.responsible_email) {
      const existing = await Company.findOne({
        where: {
          responsible_email: data.responsible_email,
          id: { [Op.ne]: company.id }
        }
      });
      if (existing) {
        throw new Error('E-mail de login já cadastrado');
      }
    }

    const updateData = {};
    if (data.responsible_name !== undefined) updateData.responsible_name = data.responsible_name;
    if (data.responsible_email !== undefined) updateData.responsible_email = data.responsible_email;
    if (data.responsible_phone !== undefined) {
      updateData.responsible_phone = data.responsible_phone || null;
    }
    if (data.phone !== undefined) updateData.phone = data.phone;

    await company.update(updateData);
    return this._sanitize(company);
  }

  async changePassword(companyAuth, currentPassword, newPassword) {
    const company = await Company.findByPk(companyAuth.entityId);

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    const isValid = await comparePassword(currentPassword, company.password_hash);
    if (!isValid) {
      throw new Error('Senha atual incorreta');
    }

    const newHash = await hashPassword(newPassword);
    await company.update({ password_hash: newHash });
  }
}

module.exports = new CompanyAreaService();
