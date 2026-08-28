const sequelize = require('../config/database');
const {
  Company,
  CompanyBilling,
  CompanyBillingWebhookEvent
} = require('../models');
const companyContractService = require('./companyContractService');
const companyPlanService = require('./companyPlanService');
const companyPricingService = require('./companyPricingService');
const asaasCompanyService = require('./asaasCompanyService');

class CompanyBillingService {
  _todayInSaoPaulo() {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }

  _currentCompetenceInSaoPaulo() {
    const today = this._todayInSaoPaulo();
    return today.slice(0, 7);
  }

  _computeDueDate(contract, competence) {
    const [year, month] = competence.split('-').map(Number);
    const dueDay = contract.due_day || 5;
    const dueDate = `${competence}-${String(dueDay).padStart(2, '0')}`;

    const today = this._todayInSaoPaulo();
    if (dueDate < today) {
      return today;
    }

    return dueDate;
  }

  _formatBilling(billing) {
    const json = billing.toJSON ? billing.toJSON() : { ...billing };
    json.unit_price = Number(json.unit_price);
    json.total_amount = Number(json.total_amount);
    return json;
  }

  formatBillingForPortal(billing) {
    const json = this._formatBilling(billing);
    delete json.asaas_payment_id;
    delete json.error_message;

    if (json.status !== 'ISSUED' && json.status !== 'OVERDUE') {
      delete json.asaas_invoice_url;
    }

    return json;
  }

  async _assertCanBill(companyId, competence, { forGenerate = false } = {}) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    if (!company.active) {
      const error = new Error('Empresa inativa');
      error.code = 'COMPANY_INACTIVE';
      throw error;
    }

    const contract = await companyContractService.getActiveContract(companyId);
    if (!contract) {
      const error = new Error('Empresa sem contrato vigente');
      error.code = 'NO_CONTRACT';
      throw error;
    }

    const metrics = await companyPricingService.countActiveLives(companyId);
    if (metrics.lives_active === 0) {
      const error = new Error('Empresa sem vidas ativas');
      error.code = 'NO_LIVES';
      throw error;
    }

    const tiers = await companyPlanService.getActiveTiersWithPrice(contract.company_plan_id);
    if (tiers.length === 0) {
      const error = new Error('Plano sem faixas de preço ativas');
      error.code = 'NO_TIERS';
      throw error;
    }

    const existing = await CompanyBilling.findOne({
      where: { company_id: companyId, competence }
    });

    if (forGenerate) {
      if (existing && existing.status !== 'ERROR') {
        const error = new Error('Competência já faturada');
        error.code = 'ALREADY_BILLED';
        throw error;
      }

      if (existing && existing.asaas_payment_id) {
        const error = new Error('Competência já faturada');
        error.code = 'ALREADY_BILLED';
        throw error;
      }
    }

    let calculation;
    try {
      calculation = companyPricingService.calculateBilling(contract, metrics, tiers);
    } catch (err) {
      if (err.code === 'VOLUME_ABOVE_TIER') {
        const error = new Error(err.message);
        error.code = 'VOLUME_ABOVE_TIER';
        throw error;
      }
      throw err;
    }

    const dueDate = this._computeDueDate(contract, competence);

    return { company, contract, metrics, tiers, calculation, dueDate, existingBilling: existing };
  }

  async getBillingPreview(companyId, competence = null) {
    const comp = competence || this._currentCompetenceInSaoPaulo();
    const { contract, metrics, calculation, dueDate, existingBilling } =
      await this._assertCanBill(companyId, comp, { forGenerate: false });

    return {
      competence: comp,
      company_id: companyId,
      plan_id: contract.company_plan_id,
      billing_type: calculation.billing_type,
      lives_active: metrics.lives_active,
      titulars_active: metrics.titulars_active,
      total_lives: calculation.total_lives,
      total_families: calculation.total_families,
      unit_price: calculation.unit_price,
      total_amount: calculation.total_amount,
      due_date: dueDate,
      already_billed: !!existingBilling && existingBilling.status !== 'ERROR'
    };
  }

  async _issueAsaasPayment(billing, company) {
    try {
      const payment = await asaasCompanyService.createBillingPayment({
        billing,
        company,
        dueDate: billing.due_date
      });

      await billing.update({
        status: 'ISSUED',
        asaas_payment_id: payment.id,
        asaas_invoice_url: payment.invoiceUrl,
        error_message: null
      });

      console.log('[company_billing.generated]', {
        companyId: company.id,
        billingId: billing.id,
        competence: billing.competence,
        amount: billing.total_amount
      });
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.description || err.message;
      await billing.update({
        status: 'ERROR',
        error_message: message
      });
      console.error('[asaas.error]', {
        companyId: company.id,
        billingId: billing.id,
        message
      });
    }
  }

  async generateMonthlyBillingForCompany(companyId, competence = null) {
    const comp = competence || this._currentCompetenceInSaoPaulo();
    const {
      company,
      calculation,
      dueDate,
      existingBilling
    } = await this._assertCanBill(companyId, comp, { forGenerate: true });

    let billing;

    if (existingBilling) {
      await existingBilling.update({
        billing_type: calculation.billing_type,
        total_lives: calculation.total_lives,
        total_families: calculation.total_families,
        unit_price: calculation.unit_price,
        total_amount: calculation.total_amount,
        due_date: dueDate,
        status: 'PENDING',
        error_message: null
      });
      billing = existingBilling;
    } else {
      billing = await CompanyBilling.create({
        company_id: companyId,
        competence: comp,
        billing_type: calculation.billing_type,
        total_lives: calculation.total_lives,
        total_families: calculation.total_families,
        unit_price: calculation.unit_price,
        total_amount: calculation.total_amount,
        due_date: dueDate,
        status: 'PENDING'
      });
    }

    await this._issueAsaasPayment(billing, company);

    await billing.reload();
    return this._formatBilling(billing);
  }

  async listBillings(companyId) {
    const billings = await CompanyBilling.findAll({
      where: { company_id: companyId },
      order: [['competence', 'DESC']]
    });

    return billings.map((b) => this._formatBilling(b));
  }

  async listBillingsForPortal(companyId) {
    const billings = await this.listBillings(companyId);
    return billings.map((b) => this.formatBillingForPortal(b));
  }

  async getBillingByCompetenceForPortal(companyId, competence) {
    const billing = await CompanyBilling.findOne({
      where: { company_id: companyId, competence }
    });

    if (!billing) {
      throw new Error('Billing not found');
    }

    return this.formatBillingForPortal(billing);
  }

  async runMonthlyJobForAllCompanies() {
    const today = this._todayInSaoPaulo();
    const competence = today.slice(0, 7);

    const companies = await Company.findAll({
      where: { active: true }
    });

    const results = [];

    for (const company of companies) {
      const contract = await companyContractService.getActiveContract(company.id, today);
      if (!contract) {
        continue;
      }

      try {
        const billing = await this.generateMonthlyBillingForCompany(company.id, competence);
        results.push({ companyId: company.id, status: 'ok', billingId: billing.id });
      } catch (err) {
        if (err.code === 'ALREADY_BILLED') {
          continue;
        }
        console.error('[company_billing.job]', {
          companyId: company.id,
          error: err.message
        });
        results.push({ companyId: company.id, status: 'error', error: err.message });
      }
    }

    return results;
  }
}

module.exports = new CompanyBillingService();
