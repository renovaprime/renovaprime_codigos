const sequelize = require('../config/database');
const { Op } = require('sequelize');
const {
  Beneficiary,
  User,
  Role,
  Company
} = require('../models');
const companyContractService = require('./companyContractService');
const { hashPassword } = require('../utils/hash');

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function formatBeneficiary(beneficiary) {
  const json = beneficiary.toJSON ? beneficiary.toJSON() : { ...beneficiary };
  if (json.dependents) {
    json.dependents = json.dependents.map((d) => (d.toJSON ? d.toJSON() : d));
  }
  if (json.titular) {
    json.titular = json.titular.toJSON ? json.titular.toJSON() : json.titular;
  }
  if (json.User) {
    json.user = json.User;
    delete json.User;
  }
  return json;
}

class CompanyBeneficiaryService {
  async _assertCanManageLives(companyId, transaction = null) {
    const company = await Company.findByPk(companyId, { transaction });
    if (!company) {
      const err = new Error('Company not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (!company.active) {
      const err = new Error('Empresa inativa');
      err.code = 'UNPROCESSABLE';
      throw err;
    }

    const contract = await companyContractService.getActiveContract(companyId);
    if (!contract) {
      const err = new Error('Empresa sem contrato vigente');
      err.code = 'UNPROCESSABLE';
      throw err;
    }

    return { company, contract };
  }

  async _findCpfConflict(cpf, transaction) {
    const digits = normalizeCpf(cpf);
    return Beneficiary.findOne({
      where: sequelize.where(
        sequelize.fn(
          'REPLACE',
          sequelize.fn('REPLACE', sequelize.col('cpf'), '.', ''),
          '-',
          ''
        ),
        digits
      ),
      transaction
    });
  }

  async listBeneficiaries(companyId, filters = {}) {
    const where = { company_id: companyId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      const searchTerm = filters.search.replace(/\D/g, '');
      where[Op.or] = [{ name: { [Op.like]: `%${filters.search}%` } }];
      if (searchTerm.length > 0) {
        where[Op.or].push(
          sequelize.where(
            sequelize.fn(
              'REPLACE',
              sequelize.fn('REPLACE', sequelize.col('Beneficiary.cpf'), '.', ''),
              '-',
              ''
            ),
            { [Op.like]: `%${searchTerm}%` }
          )
        );
      }
    }

    const titulares = await Beneficiary.findAll({
      where: { ...where, type: 'TITULAR' },
      include: [{
        model: Beneficiary,
        as: 'dependents',
        required: false,
        where: filters.status ? { status: filters.status } : undefined
      }],
      order: [['name', 'ASC']]
    });

    if (filters.type === 'DEPENDENTE') {
      return Beneficiary.findAll({
        where: { ...where, type: 'DEPENDENTE' },
        include: [{ model: Beneficiary, as: 'titular', required: false }],
        order: [['name', 'ASC']]
      }).then((rows) => rows.map(formatBeneficiary));
    }

    return titulares.map(formatBeneficiary);
  }

  async getBeneficiaryById(companyId, beneficiaryId) {
    const beneficiary = await Beneficiary.findOne({
      where: { id: beneficiaryId, company_id: companyId },
      include: [
        { model: Beneficiary, as: 'dependents', required: false },
        { model: Beneficiary, as: 'titular', required: false }
      ]
    });

    if (!beneficiary) {
      const err = new Error('Beneficiary not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return formatBeneficiary(beneficiary);
  }

  async createBeneficiary(companyId, data, createdByUserId = null) {
    const transaction = await sequelize.transaction();

    try {
      const { contract } = await this._assertCanManageLives(companyId, transaction);
      const serviceType = contract.plan?.service_type || 'CLINICO';

      const cpfConflict = await this._findCpfConflict(data.cpf, transaction);
      if (cpfConflict) {
        const err = new Error('CPF already registered');
        err.code = 'CONFLICT';
        throw err;
      }

      if (data.type === 'TITULAR') {
        const emailInUse = await User.findOne({
          where: { email: data.email },
          transaction
        });
        if (emailInUse) {
          const err = new Error('Email already registered');
          err.code = 'CONFLICT';
          throw err;
        }

        const pacienteRole = await Role.findOne({
          where: { name: 'PACIENTE' },
          transaction
        });
        if (!pacienteRole) {
          throw new Error('Role PACIENTE not found');
        }

        const hashedPassword = await hashPassword(data.password);
        const user = await User.create({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          password_hash: hashedPassword,
          role_id: pacienteRole.id,
          status: 'ACTIVE',
          cpf: normalizeCpf(data.cpf) || null,
          birth_date: data.birth_date || null
        }, { transaction });

        const beneficiary = await Beneficiary.create({
          type: 'TITULAR',
          user_id: user.id,
          company_id: companyId,
          name: data.name,
          cpf: normalizeCpf(data.cpf),
          birth_date: data.birth_date,
          phone: data.phone || null,
          email: data.email,
          cep: data.cep || null,
          city: data.city || null,
          state: data.state || null,
          address: data.address || null,
          service_type: serviceType,
          status: 'ACTIVE',
          created_by: createdByUserId
        }, { transaction });

        await transaction.commit();
        return this.getBeneficiaryById(companyId, beneficiary.id);
      }

      const titular = await Beneficiary.findOne({
        where: {
          id: data.titular_id,
          company_id: companyId,
          type: 'TITULAR'
        },
        transaction
      });

      if (!titular) {
        const err = new Error('Titular not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      if (titular.status !== 'ACTIVE') {
        const err = new Error('Titular inativo');
        err.code = 'UNPROCESSABLE';
        throw err;
      }

      const dependent = await Beneficiary.create({
        type: 'DEPENDENTE',
        titular_id: titular.id,
        company_id: companyId,
        kinship: data.kinship,
        name: data.name,
        cpf: normalizeCpf(data.cpf),
        birth_date: data.birth_date,
        phone: data.phone || null,
        email: data.email || null,
        cep: data.cep || null,
        city: data.city || null,
        state: data.state || null,
        address: data.address || null,
        service_type: titular.service_type || serviceType,
        status: 'ACTIVE',
        user_id: null,
        created_by: createdByUserId
      }, { transaction });

      await transaction.commit();
      return this.getBeneficiaryById(companyId, dependent.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateBeneficiary(companyId, beneficiaryId, data) {
    const transaction = await sequelize.transaction();

    try {
      await this._assertCanManageLives(companyId, transaction);

      const beneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, company_id: companyId },
        transaction
      });

      if (!beneficiary) {
        const err = new Error('Beneficiary not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      if (data.cpf && normalizeCpf(data.cpf) !== normalizeCpf(beneficiary.cpf)) {
        const cpfConflict = await this._findCpfConflict(data.cpf, transaction);
        if (cpfConflict && cpfConflict.id !== beneficiary.id) {
          const err = new Error('CPF already registered');
          err.code = 'CONFLICT';
          throw err;
        }
      }

      const updateData = { ...data };
      if (updateData.cpf) updateData.cpf = normalizeCpf(updateData.cpf);
      delete updateData.password;
      delete updateData.type;
      delete updateData.titular_id;

      if (beneficiary.user_id && updateData.email) {
        const user = await User.findByPk(beneficiary.user_id, { transaction });
        if (user && user.email !== updateData.email) {
          const emailInUse = await User.findOne({
            where: { email: updateData.email, id: { [Op.ne]: user.id } },
            transaction
          });
          if (emailInUse) {
            const err = new Error('Email already registered');
            err.code = 'CONFLICT';
            throw err;
          }
          await user.update({ email: updateData.email }, { transaction });
        }
      }

      if (beneficiary.user_id && updateData.name) {
        const user = await User.findByPk(beneficiary.user_id, { transaction });
        if (user) {
          await user.update({ name: updateData.name }, { transaction });
        }
      }

      await beneficiary.update(updateData, { transaction });
      await transaction.commit();
      return this.getBeneficiaryById(companyId, beneficiaryId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async inactivateBeneficiary(companyId, beneficiaryId) {
    const transaction = await sequelize.transaction();

    try {
      await this._assertCanManageLives(companyId, transaction);

      const beneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, company_id: companyId },
        transaction
      });

      if (!beneficiary) {
        const err = new Error('Beneficiary not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      if (beneficiary.type === 'TITULAR') {
        const dependents = await Beneficiary.findAll({
          where: {
            titular_id: beneficiary.id,
            company_id: companyId,
            status: 'ACTIVE'
          },
          transaction
        });

        for (const dep of dependents) {
          await dep.update({ status: 'INACTIVE' }, { transaction });
          if (dep.user_id) {
            await User.update(
              { status: 'BLOCKED' },
              { where: { id: dep.user_id }, transaction }
            );
          }
        }

        await beneficiary.update({ status: 'INACTIVE' }, { transaction });
        if (beneficiary.user_id) {
          await User.update(
            { status: 'BLOCKED' },
            { where: { id: beneficiary.user_id }, transaction }
          );
        }
      } else {
        await beneficiary.update({ status: 'INACTIVE' }, { transaction });
        if (beneficiary.user_id) {
          await User.update(
            { status: 'BLOCKED' },
            { where: { id: beneficiary.user_id }, transaction }
          );
        }
      }

      await transaction.commit();
      return this.getBeneficiaryById(companyId, beneficiaryId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteBeneficiary(companyId, beneficiaryId) {
    const transaction = await sequelize.transaction();

    try {
      const beneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, company_id: companyId },
        transaction
      });

      if (!beneficiary) {
        const err = new Error('Beneficiary not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      if (beneficiary.type === 'TITULAR') {
        const dependentsCount = await Beneficiary.count({
          where: { titular_id: beneficiary.id, company_id: companyId },
          transaction
        });
        if (dependentsCount > 0) {
          const err = new Error('Remova os dependentes antes de excluir o titular');
          err.code = 'UNPROCESSABLE';
          throw err;
        }
      }

      const userId = beneficiary.user_id;
      await beneficiary.destroy({ transaction });

      if (userId) {
        await User.destroy({ where: { id: userId }, transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async grantDependentAccess(companyId, beneficiaryId, data) {
    const transaction = await sequelize.transaction();

    try {
      await this._assertCanManageLives(companyId, transaction);

      const dependent = await Beneficiary.findOne({
        where: {
          id: beneficiaryId,
          company_id: companyId,
          type: 'DEPENDENTE'
        },
        transaction
      });

      if (!dependent) {
        const err = new Error('Dependent not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      const titular = await Beneficiary.findByPk(dependent.titular_id, { transaction });
      if (!titular || titular.status !== 'ACTIVE') {
        const err = new Error('Titular inativo');
        err.code = 'UNPROCESSABLE';
        throw err;
      }

      const normalizedCpf = dependent.cpf ? normalizeCpf(dependent.cpf) : null;
      const hashedPassword = await hashPassword(data.password);

      if (dependent.user_id) {
        const existingUser = await User.findByPk(dependent.user_id, { transaction });
        if (!existingUser) {
          throw new Error('Linked user not found');
        }

        if (existingUser.email !== data.email) {
          const emailInUse = await User.findOne({
            where: { email: data.email, id: { [Op.ne]: existingUser.id } },
            transaction
          });
          if (emailInUse) {
            const err = new Error('Email already registered');
            err.code = 'CONFLICT';
            throw err;
          }
        }

        await existingUser.update({
          email: data.email,
          password_hash: hashedPassword,
          status: 'ACTIVE'
        }, { transaction });
      } else {
        const emailInUse = await User.findOne({
          where: { email: data.email },
          transaction
        });
        if (emailInUse) {
          const err = new Error('Email already registered');
          err.code = 'CONFLICT';
          throw err;
        }

        const patientRole = await Role.findOne({
          where: { name: 'PACIENTE' },
          transaction
        });
        if (!patientRole) {
          throw new Error('Patient role not found');
        }

        const newUser = await User.create({
          name: dependent.name,
          email: data.email,
          phone: dependent.phone || null,
          password_hash: hashedPassword,
          role_id: patientRole.id,
          status: 'ACTIVE',
          cpf: normalizedCpf || null,
          birth_date: dependent.birth_date || null
        }, { transaction });

        await dependent.update({ user_id: newUser.id }, { transaction });
      }

      await dependent.update({ email: data.email }, { transaction });
      await transaction.commit();

      return {
        beneficiary_id: dependent.id,
        has_access: true,
        email: data.email
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new CompanyBeneficiaryService();
