const sequelize = require('../config/database');
const {
  CompanyPlan,
  CompanyPlanPriceTier,
  CompanyContract
} = require('../models');
const {
  validateBillingServiceCoherence,
  validateTiers
} = require('../validators/companyPlanValidator');
const { Op } = require('sequelize');

class CompanyPlanService {
  _formatPlan(plan) {
    const json = plan.toJSON ? plan.toJSON() : { ...plan };
    if (json.CompanyPlanPriceTiers) {
      json.tiers = json.CompanyPlanPriceTiers.filter((t) => t.active);
      delete json.CompanyPlanPriceTiers;
    }
    if (json.tiers) {
      json.tiers.sort((a, b) => a.lives_from - b.lives_from);
    }
    return json;
  }

  async listPlans(filters = {}) {
    const where = {};
    if (filters.status === 'active') {
      where.active = true;
    } else if (filters.status === 'inactive') {
      where.active = false;
    }

    const plans = await CompanyPlan.findAll({
      where,
      include: [{
        model: CompanyPlanPriceTier,
        where: { active: true },
        required: false
      }],
      order: [['created_at', 'DESC'], [CompanyPlanPriceTier, 'lives_from', 'ASC']]
    });

    return plans.map((p) => this._formatPlan(p));
  }

  async getPlanById(id) {
    const plan = await CompanyPlan.findByPk(id, {
      include: [{
        model: CompanyPlanPriceTier,
        where: { active: true },
        required: false
      }]
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return this._formatPlan(plan);
  }

  async createPlan(data) {
    const coherenceError = validateBillingServiceCoherence(data.billing_type, data.service_type);
    if (coherenceError) {
      throw new Error(coherenceError);
    }

    if (data.tiers && data.tiers.length > 0) {
      const tiersError = validateTiers(data.tiers);
      if (tiersError) {
        throw new Error(tiersError);
      }
    }

    const transaction = await sequelize.transaction();

    try {
      const plan = await CompanyPlan.create({
        name: data.name,
        description: data.description || null,
        billing_type: data.billing_type,
        service_type: data.service_type,
        active: data.active !== false
      }, { transaction });

      if (data.tiers && data.tiers.length > 0) {
        await CompanyPlanPriceTier.bulkCreate(
          data.tiers.map((tier) => ({
            company_plan_id: plan.id,
            lives_from: tier.lives_from,
            lives_to: tier.lives_to,
            unit_price: tier.unit_price,
            active: true
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return this.getPlanById(plan.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updatePlan(id, data) {
    const plan = await CompanyPlan.findByPk(id);

    if (!plan) {
      throw new Error('Plan not found');
    }

    const billingType = data.billing_type ?? plan.billing_type;
    const serviceType = data.service_type ?? plan.service_type;

    const coherenceError = validateBillingServiceCoherence(billingType, serviceType);
    if (coherenceError) {
      throw new Error(coherenceError);
    }

    if (data.tiers) {
      const tiersError = validateTiers(data.tiers);
      if (tiersError) {
        throw new Error(tiersError);
      }
    }

    const transaction = await sequelize.transaction();

    try {
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.billing_type !== undefined) updateData.billing_type = data.billing_type;
      if (data.service_type !== undefined) updateData.service_type = data.service_type;

      if (Object.keys(updateData).length > 0) {
        await plan.update(updateData, { transaction });
      }

      if (data.tiers) {
        await CompanyPlanPriceTier.update(
          { active: false },
          { where: { company_plan_id: id, active: true }, transaction }
        );

        if (data.tiers.length > 0) {
          await CompanyPlanPriceTier.bulkCreate(
            data.tiers.map((tier) => ({
              company_plan_id: id,
              lives_from: tier.lives_from,
              lives_to: tier.lives_to,
              unit_price: tier.unit_price,
              active: true
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();
      return this.getPlanById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStatus(id, active) {
    const plan = await CompanyPlan.findByPk(id);

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!active) {
      const today = new Date().toISOString().slice(0, 10);
      const activeContract = await CompanyContract.findOne({
        where: {
          company_plan_id: id,
          active: true,
          starts_on: { [Op.lte]: today },
          [Op.or]: [
            { ends_on: null },
            { ends_on: { [Op.gte]: today } }
          ]
        }
      });

      if (activeContract) {
        throw new Error('Não é possível inativar plano com contrato vigente');
      }
    }

    await plan.update({ active });
    return this.getPlanById(id);
  }

  async getActiveTiersWithPrice(planId) {
    const tiers = await CompanyPlanPriceTier.findAll({
      where: {
        company_plan_id: planId,
        active: true,
        unit_price: { [Op.gt]: 0 }
      },
      order: [['lives_from', 'ASC']]
    });

    return tiers;
  }
}

module.exports = new CompanyPlanService();
