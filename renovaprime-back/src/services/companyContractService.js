const sequelize = require('../config/database');
const {
  Company,
  CompanyPlan,
  CompanyPlanPriceTier,
  CompanyContract
} = require('../models');
const companyPlanService = require('./companyPlanService');
const { Op } = require('sequelize');

class CompanyContractService {
  _todayInSaoPaulo() {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }

  _formatContract(contract) {
    const json = contract.toJSON ? contract.toJSON() : { ...contract };
    if (json.CompanyPlan) {
      json.plan = json.CompanyPlan;
      if (json.plan.CompanyPlanPriceTiers) {
        json.plan.tiers = json.plan.CompanyPlanPriceTiers.filter((t) => t.active);
        delete json.plan.CompanyPlanPriceTiers;
      }
      delete json.CompanyPlan;
    }
    return json;
  }

  async getActiveContract(companyId, date = null) {
    const refDate = date || this._todayInSaoPaulo();

    const contract = await CompanyContract.findOne({
      where: {
        company_id: companyId,
        active: true,
        starts_on: { [Op.lte]: refDate },
        [Op.or]: [
          { ends_on: null },
          { ends_on: { [Op.gte]: refDate } }
        ]
      },
      include: [{
        model: CompanyPlan,
        include: [{
          model: CompanyPlanPriceTier,
          where: { active: true },
          required: false
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    if (!contract) {
      return null;
    }

    return this._formatContract(contract);
  }

  async getContract(companyId) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const contract = await this.getActiveContract(companyId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    return contract;
  }

  async createContract(companyId, data) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const plan = await CompanyPlan.findByPk(data.company_plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    if (!plan.active) {
      throw new Error('Plano inativo não pode ser vinculado');
    }

    const tiers = await companyPlanService.getActiveTiersWithPrice(plan.id);
    if (tiers.length === 0) {
      throw new Error('Plano deve ter faixas ativas com preço maior que zero');
    }

    const existingActive = await CompanyContract.findOne({
      where: {
        company_id: companyId,
        active: true
      }
    });

    if (existingActive && !data.force) {
      const error = new Error('Já existe contrato ativo para esta empresa');
      error.code = 'CONTRACT_CONFLICT';
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      if (existingActive) {
        await existingActive.update({ active: false }, { transaction });
      }

      const contract = await CompanyContract.create({
        company_id: companyId,
        company_plan_id: plan.id,
        billing_type: plan.billing_type,
        due_day: data.due_day ?? 5,
        starts_on: data.starts_on,
        ends_on: data.ends_on ?? null,
        active: true
      }, { transaction });

      await transaction.commit();

      const full = await CompanyContract.findByPk(contract.id, {
        include: [{
          model: CompanyPlan,
          include: [{
            model: CompanyPlanPriceTier,
            where: { active: true },
            required: false
          }]
        }]
      });

      return this._formatContract(full);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateContractStatus(companyId, active) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const contract = await CompanyContract.findOne({
      where: {
        company_id: companyId,
        active: true
      }
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    await contract.update({ active });
    return this._formatContract(contract);
  }
}

module.exports = new CompanyContractService();
