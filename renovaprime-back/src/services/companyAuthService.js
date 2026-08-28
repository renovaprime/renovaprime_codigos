const { Company } = require('../models');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

class CompanyAuthService {
  async login(email, password) {
    const company = await Company.findOne({ where: { responsible_email: email } });

    if (!company) {
      throw new Error('Credenciais inválidas');
    }

    if (!company.active) {
      throw new Error('Empresa inativa. Entre em contato com o administrador.');
    }

    const isPasswordValid = await comparePassword(password, company.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const token = generateToken({
      entityType: 'company',
      entityId: company.id
    });

    return {
      token,
      name: company.trade_name,
      email: company.responsible_email,
      entity: {
        id: company.id,
        name: company.trade_name,
        email: company.responsible_email
      }
    };
  }
}

module.exports = new CompanyAuthService();
