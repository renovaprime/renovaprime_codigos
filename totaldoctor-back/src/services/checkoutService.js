const asaas = require('../config/asaas');
const { User, Role, Beneficiary } = require('../models');
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
          // Check if dependent CPF already exists
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

      await transaction.commit();

      return {
        success: true,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        message: 'Assinatura realizada com sucesso!'
      };

    } catch (error) {
      await transaction.rollback();

      // Handle Asaas specific errors
      if (error.response?.data?.errors) {
        const asaasError = error.response.data.errors[0];
        throw new Error(asaasError.description || 'Erro ao processar pagamento');
      }

      throw error;
    }
  }

  async upsertAsaasCustomer(data) {
    // Try to find existing customer by CPF
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

    // Create new customer
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
