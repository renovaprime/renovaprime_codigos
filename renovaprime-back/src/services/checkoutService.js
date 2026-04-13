const { v4: uuidv4 } = require('uuid');
const asaas = require('../config/asaas');
const { User, Role, Beneficiary, Reseller, PartnerBranch, PlanCommission, ResellerSale } = require('../models');
const { hashPassword } = require('../utils/hash');
const sequelize = require('../config/database');

const PLAN_CONFIG = {
  1: { serviceType: 'CLINICO', price: 39.90, name: 'Individual' },
  2: { serviceType: 'PREMIUM', price: 59.90, name: 'Individual Premium' },
  3: { serviceType: 'FAMILIAR', price: 84.90, name: 'Familiar Master' }
};

class CheckoutService {
  async processCheckout(data) {
    const transaction = await sequelize.transaction();

    try {
      const planConfig = PLAN_CONFIG[data.planId];
      if (!planConfig) {
        throw new Error('Plano inválido');
      }

      // Resolve reseller chain if provided
      let resellerData = null;
      if (data.rev) {
        resellerData = await this.resolveReseller(data.rev);
      }

      // Validate CPF uniqueness
      const existingBeneficiary = await Beneficiary.findOne({
        where: { cpf: data.cpf }
      });
      if (existingBeneficiary) {
        throw new Error('CPF já cadastrado no sistema');
      }

      // Validate email uniqueness
      const existingUser = await User.findOne({
        where: { email: data.email }
      });
      if (existingUser) {
        throw new Error('Email já cadastrado no sistema');
      }

      // 1. Create or find Asaas customer
      const customerId = await this.upsertAsaasCustomer({
        name: data.name,
        cpfCnpj: data.cpf,
        email: data.email,
        phone: data.phone,
        postalCode: data.cep,
        address: data.address,
        addressNumber: data.addressNumber || 'S/N',
        province: data.neighborhood || '',
        city: data.city,
        state: data.state
      });

      // 2. Create subscription with credit card
      const subscription = await this.createAsaasSubscription({
        customerId,
        value: planConfig.price,
        planName: planConfig.name,
        creditCard: data.creditCard,
        creditCardHolderInfo: {
          name: data.creditCard.holderName,
          email: data.email,
          cpfCnpj: data.cpf,
          postalCode: data.cep,
          addressNumber: data.addressNumber || 'S/N',
          phone: data.phone
        },
        remoteIp: data.remoteIp
      });

      // 3. Get PACIENTE role
      const pacienteRole = await Role.findOne({ where: { name: 'PACIENTE' } });
      if (!pacienteRole) {
        throw new Error('Role PACIENTE não encontrada');
      }

      // 4. Create user with CPF as password
      const cpfOnlyNumbers = data.cpf.replace(/\D/g, '');
      const hashedPassword = await hashPassword(cpfOnlyNumbers);

      const user = await User.create({
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        role_id: pacienteRole.id,
        status: 'ACTIVE'
      }, { transaction });

      // 5. Create titular beneficiary
      const titular = await Beneficiary.create({
        user_id: user.id,
        type: 'TITULAR',
        name: data.name,
        cpf: data.cpf,
        birth_date: data.birthDate,
        phone: data.phone,
        email: data.email,
        cep: data.cep,
        city: data.city,
        state: data.state,
        address: data.address,
        service_type: planConfig.serviceType,
        status: 'ACTIVE'
      }, { transaction });

      // 6. Create dependents if FAMILIAR plan
      if (data.planId === 3 && data.dependents && data.dependents.length > 0) {
        for (const dep of data.dependents) {
          const existingDep = await Beneficiary.findOne({
            where: { cpf: dep.cpf }
          });
          if (existingDep) {
            throw new Error(`CPF do dependente ${dep.name} já cadastrado`);
          }

          await Beneficiary.create({
            type: 'DEPENDENTE',
            titular_id: titular.id,
            name: dep.name,
            cpf: dep.cpf,
            birth_date: dep.birthDate,
            phone: data.phone,
            email: data.email,
            cep: data.cep,
            city: data.city,
            state: data.state,
            address: data.address,
            service_type: planConfig.serviceType,
            status: 'ACTIVE'
          }, { transaction });
        }
      }

      // 7. Record the sale
      const commissions = resellerData
        ? await this.calculateCommissions(resellerData.partnerId, planConfig.serviceType, planConfig.price)
        : { partner: 0, branch: 0, reseller: 0 };

      const sale = await ResellerSale.create({
        uuid: uuidv4(),
        reseller_id: resellerData?.resellerId || null,
        branch_id: resellerData?.branchId || null,
        partner_id: resellerData?.partnerId || null,
        beneficiary_id: titular.id,
        cpf: data.cpf,
        plan_type: planConfig.serviceType,
        value: planConfig.price,
        gateway: 'asaas',
        gateway_subscription_id: subscription.id || null,
        status: subscription.status === 'ACTIVE' ? 'CONFIRMED' : 'PENDING',
        commission_partner: commissions.partner,
        commission_branch: commissions.branch,
        commission_reseller: commissions.reseller,
        confirmed_at: subscription.status === 'ACTIVE' ? new Date() : null
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        saleId: sale.uuid,
        message: 'Assinatura realizada com sucesso!'
      };

    } catch (error) {
      await transaction.rollback();

      if (error.response?.data?.errors) {
        const asaasError = error.response.data.errors[0];
        throw new Error(asaasError.description || 'Erro ao processar pagamento');
      }

      throw error;
    }
  }

  async resolveReseller(resellerId) {
    const reseller = await Reseller.findByPk(resellerId, {
      include: [{
        model: PartnerBranch,
        attributes: ['id', 'partner_id']
      }]
    });

    if (!reseller || !reseller.active) {
      return null;
    }

    return {
      resellerId: reseller.id,
      branchId: reseller.PartnerBranch?.id || null,
      partnerId: reseller.PartnerBranch?.partner_id || null
    };
  }

  async calculateCommissions(partnerId, planType, saleValue) {
    if (!partnerId) {
      return { partner: 0, branch: 0, reseller: 0 };
    }

    const commission = await PlanCommission.findOne({
      where: {
        partner_id: partnerId,
        plan_type: planType,
        active: true
      }
    });

    if (!commission) {
      return { partner: 0, branch: 0, reseller: 0 };
    }

    return {
      partner: Number(((saleValue * commission.partner_pct) / 100).toFixed(2)),
      branch: Number(((saleValue * commission.branch_pct) / 100).toFixed(2)),
      reseller: Number(((saleValue * commission.reseller_pct) / 100).toFixed(2))
    };
  }

  async upsertAsaasCustomer(data) {
    try {
      const { data: found } = await asaas.get('/customers', {
        params: { cpfCnpj: data.cpfCnpj }
      });

      if (found.totalCount > 0) {
        return found.data[0].id;
      }
    } catch (err) {
      // Customer not found, will create new one
    }

    const { data: created } = await asaas.post('/customers', {
      name: data.name,
      cpfCnpj: data.cpfCnpj,
      email: data.email,
      mobilePhone: data.phone,
      postalCode: data.postalCode,
      address: data.address,
      addressNumber: data.addressNumber,
      province: data.province,
      city: data.city,
      state: data.state
    });

    return created.id;
  }

  async createAsaasSubscription(data) {
    const { data: subscription } = await asaas.post('/subscriptions', {
      customer: data.customerId,
      billingType: 'CREDIT_CARD',
      value: data.value,
      cycle: 'MONTHLY',
      nextDueDate: new Date().toISOString().slice(0, 10),
      description: `Assinatura TotalDoctor - ${data.planName}`,
      creditCard: {
        holderName: data.creditCard.holderName,
        number: data.creditCard.number,
        expiryMonth: data.creditCard.expiryMonth,
        expiryYear: data.creditCard.expiryYear,
        ccv: data.creditCard.cvv
      },
      creditCardHolderInfo: data.creditCardHolderInfo,
      remoteIp: data.remoteIp
    });

    return subscription;
  }
}

module.exports = new CheckoutService();
