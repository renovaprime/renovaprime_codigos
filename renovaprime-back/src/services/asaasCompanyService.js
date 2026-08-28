const asaas = require('../config/asaas');
const { Company } = require('../models');

class AsaasCompanyService {
  isSkipped() {
    return process.env.B2B_SKIP_ASAAS === '1';
  }

  async ensureCustomer(company) {
    if (this.isSkipped()) {
      return company.asaas_customer_id || `skip_cust_${company.id}`;
    }

    if (company.asaas_customer_id) {
      return company.asaas_customer_id;
    }

    const cnpj = company.cnpj;

    try {
      const { data: found } = await asaas.get('/customers', {
        params: { cpfCnpj: cnpj }
      });

      if (found.totalCount > 0) {
        const customerId = found.data[0].id;
        await company.update({ asaas_customer_id: customerId });
        return customerId;
      }
    } catch (err) {
      // Customer not found — will create
    }

    const { data: created } = await asaas.post('/customers', {
      name: company.legal_name || company.trade_name,
      cpfCnpj: cnpj,
      email: company.email,
      mobilePhone: company.phone,
      postalCode: company.zip_code,
      address: company.address,
      addressNumber: 'S/N',
      province: company.city,
      city: company.city,
      state: company.state,
      company: company.trade_name
    });

    await company.update({ asaas_customer_id: created.id });
    return created.id;
  }

  async createBillingPayment({ billing, company, dueDate }) {
    if (this.isSkipped()) {
      return {
        id: `skip_pay_${billing.id}`,
        invoiceUrl: null
      };
    }

    const customerId = await this.ensureCustomer(company);

    const { data: payment } = await asaas.post('/payments', {
      customer: customerId,
      billingType: 'UNDEFINED',
      value: Number(billing.total_amount),
      dueDate,
      description: `Faturamento B2B ${billing.competence} — ${company.trade_name}`,
      externalReference: `company_billing:${billing.id}`
    });

    return {
      id: payment.id,
      invoiceUrl: payment.invoiceUrl || payment.bankSlipUrl || null
    };
  }
}

module.exports = new AsaasCompanyService();
