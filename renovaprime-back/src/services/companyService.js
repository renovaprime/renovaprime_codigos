const { Company, Beneficiary, CompanyBilling } = require('../models');
const { hashPassword } = require('../utils/hash');
const { normalizeDigits } = require('../validators/companyValidator');
const { Op } = require('sequelize');

class CompanyService {
  _sanitize(company) {
    const result = company.toJSON ? company.toJSON() : { ...company };
    delete result.password_hash;
    delete result.password;
    return result;
  }

  async listCompanies(filters = {}) {
    const where = {};

    if (filters.name) {
      where[Op.or] = [
        { trade_name: { [Op.like]: `%${filters.name}%` } },
        { legal_name: { [Op.like]: `%${filters.name}%` } }
      ];
    }
    if (filters.status === 'active') {
      where.active = true;
    } else if (filters.status === 'inactive') {
      where.active = false;
    }

    const companies = await Company.findAll({
      where,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    return companies;
  }

  async getCompanyById(id) {
    const company = await Company.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  async createCompany(data) {
    const hashedPassword = await hashPassword(data.password);

    const company = await Company.create({
      legal_name: data.legal_name,
      trade_name: data.trade_name,
      cnpj: normalizeDigits(data.cnpj),
      phone: normalizeDigits(data.phone),
      email: data.email,
      zip_code: normalizeDigits(data.zip_code),
      address: data.address,
      city: data.city,
      state: data.state.toUpperCase(),
      state_registration: data.state_registration || null,
      responsible_name: data.responsible_name,
      responsible_email: data.responsible_email,
      responsible_phone: data.responsible_phone ? normalizeDigits(data.responsible_phone) : null,
      password_hash: hashedPassword,
      notes: data.notes || null,
      active: data.active !== false
    });

    return this._sanitize(company);
  }

  async updateCompany(id, data) {
    const company = await Company.findByPk(id);

    if (!company) {
      throw new Error('Company not found');
    }

    if (data.email && data.responsible_email &&
        data.email.toLowerCase() === data.responsible_email.toLowerCase()) {
      throw new Error('E-mail corporativo deve ser diferente do e-mail de login');
    }

    const email = data.email ?? company.email;
    const responsibleEmail = data.responsible_email ?? company.responsible_email;
    if (email.toLowerCase() === responsibleEmail.toLowerCase()) {
      throw new Error('E-mail corporativo deve ser diferente do e-mail de login');
    }

    const updateData = { ...data };
    delete updateData.password;

    if (data.cnpj) updateData.cnpj = normalizeDigits(data.cnpj);
    if (data.phone) updateData.phone = normalizeDigits(data.phone);
    if (data.zip_code) updateData.zip_code = normalizeDigits(data.zip_code);
    if (data.state) updateData.state = data.state.toUpperCase();
    if (data.responsible_phone) {
      updateData.responsible_phone = normalizeDigits(data.responsible_phone);
    }

    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    await company.update(updateData);
    return this._sanitize(company);
  }

  async updateStatus(id, active) {
    const company = await Company.findByPk(id);

    if (!company) {
      throw new Error('Company not found');
    }

    await company.update({ active });
    return this._sanitize(company);
  }

  async deleteCompany(id) {
    const company = await Company.findByPk(id);

    if (!company) {
      throw new Error('Company not found');
    }

    if (Beneficiary.rawAttributes.company_id) {
      const livesCount = await Beneficiary.count({ where: { company_id: id } });
      if (livesCount > 0) {
        throw new Error('Não é possível excluir empresa com vidas cadastradas');
      }
    }

    const billingsCount = await CompanyBilling.count({ where: { company_id: id } });
    if (billingsCount > 0) {
      throw new Error('Não é possível excluir empresa com faturas');
    }

    await company.destroy();
  }
}

module.exports = new CompanyService();
