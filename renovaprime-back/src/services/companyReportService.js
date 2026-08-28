const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Company, CompanyContract, CompanyPlan } = require('../models');
const companyPricingService = require('./companyPricingService');
const companyBeneficiaryService = require('./companyBeneficiaryService');
const companyBillingService = require('./companyBillingService');

class CompanyReportService {
  _todayInSaoPaulo() {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }

  async listReports(filters = {}) {
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
      order: [['trade_name', 'ASC']],
      attributes: { exclude: ['password_hash'] }
    });

    if (companies.length === 0) {
      return [];
    }

    const ids = companies.map((company) => company.id);
    const today = this._todayInSaoPaulo();

    const [contracts, liveCounts, lastBillings] = await Promise.all([
      CompanyContract.findAll({
        where: {
          company_id: { [Op.in]: ids },
          active: true,
          starts_on: { [Op.lte]: today },
          [Op.or]: [{ ends_on: null }, { ends_on: { [Op.gte]: today } }]
        },
        include: [{
          model: CompanyPlan,
          attributes: ['id', 'name', 'service_type']
        }],
        order: [['created_at', 'DESC']]
      }),
      sequelize.query(
        `SELECT
           company_id,
           COALESCE(SUM(status = 'ACTIVE'), 0) AS lives_active,
           COALESCE(SUM(status = 'ACTIVE' AND type = 'TITULAR'), 0) AS titulars_active
         FROM beneficiaries
         WHERE company_id IN (:ids)
         GROUP BY company_id`,
        { replacements: { ids }, type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT cb.id, cb.company_id, cb.competence, cb.status, cb.total_amount, cb.due_date
         FROM company_billings cb
         INNER JOIN (
           SELECT company_id, MAX(competence) AS max_comp
           FROM company_billings
           WHERE company_id IN (:ids)
           GROUP BY company_id
         ) latest
           ON latest.company_id = cb.company_id
          AND latest.max_comp = cb.competence`,
        { replacements: { ids }, type: QueryTypes.SELECT }
      )
    ]);

    const contractByCompanyId = new Map();
    for (const contract of contracts) {
      if (!contractByCompanyId.has(contract.company_id)) {
        contractByCompanyId.set(contract.company_id, contract);
      }
    }

    const metricsByCompanyId = new Map();
    for (const row of liveCounts) {
      metricsByCompanyId.set(Number(row.company_id), {
        lives_active: Number(row.lives_active) || 0,
        titulars_active: Number(row.titulars_active) || 0
      });
    }

    const billingByCompanyId = new Map();
    for (const row of lastBillings) {
      billingByCompanyId.set(Number(row.company_id), {
        id: Number(row.id),
        competence: row.competence,
        status: row.status,
        total_amount: Number(row.total_amount),
        due_date: row.due_date
      });
    }

    return companies.map((company) => {
      const contract = contractByCompanyId.get(company.id);
      const plan = contract
        ? contract.CompanyPlan || contract.plan || null
        : null;
      const metrics = metricsByCompanyId.get(company.id) || {
        lives_active: 0,
        titulars_active: 0
      };
      const lastBilling = billingByCompanyId.get(company.id) || null;

      return {
        id: company.id,
        trade_name: company.trade_name,
        legal_name: company.legal_name,
        cnpj: company.cnpj,
        active: company.active,
        plan: contract
          ? {
              id: contract.company_plan_id,
              name: plan?.name || null,
              billing_type: contract.billing_type,
              service_type: plan?.service_type || null
            }
          : null,
        lives_active: metrics.lives_active,
        titulars_active: metrics.titulars_active,
        last_billing: lastBilling
      };
    });
  }

  async getCompanyLives(companyId, filters = {}) {
    const company = await Company.findByPk(companyId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const metrics = await companyPricingService.countActiveLives(companyId);
    const beneficiaries = await companyBeneficiaryService.listBeneficiaries(companyId, filters);

    return {
      company_id: companyId,
      company_name: company.trade_name,
      lives_active: metrics.lives_active,
      titulars_active: metrics.titulars_active,
      beneficiaries
    };
  }

  async getCompanyBillings(companyId) {
    const company = await Company.findByPk(companyId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const billings = await companyBillingService.listBillings(companyId);

    return {
      company_id: companyId,
      company_name: company.trade_name,
      billings
    };
  }
}

module.exports = new CompanyReportService();
