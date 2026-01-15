const { validationResult } = require('express-validator');
const svc = require('../services/asaasService');
const api = require('../services/rapidocApi');
const db = require('../config/database');

exports.pay = async (req, res, next) => {
  try {
    //const errors = validationResult(req);
    //if (!errors.isEmpty()) {
    //  return res.status(422).json({ success: false, errors: errors.array() });
    //}

    if(req.body.cvv !== "123"){
      return res.status(400).json({
        success: false,
        error: "CVV inválido"
      });
    }

    const beneficiary = {
      name: req.body.name,
      cpf: req.body.cpf,
      birthday: '1990-01-01',
      beneficiaryType: "titular",
      phone: req.body.phone,
      email: req.body.email,
      zipCode: req.body.zipCode,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      paymentType: "A",
      serviceType: "G",
      holder: "",
      general: ""
    }

    const response = await api.post("/beneficiaries", [beneficiary]);  
    console.log(response.data);

    return res.json({
      success: true,
      beneficiaryId: response.data.id,
      paymentId: "1234567890",
      status: "PENDING"          // PENDING ou CONFIRMED
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
};

// src/controllers/paymentController.js
const axios = require("axios");

// Configure o cliente axios do Asaas
const asaas = axios.create({
  baseURL: "https://www.asaas.com/api/v3", // troque para produção quando for o caso
  headers: {
    access_token: process.env.ASAAS_API_KEY, // ou ASAAS_PROD_KEY
    "Content-Type": "application/json",
  },
});

exports.createCustomerAndPay = async (req, res) => {
  try {
    
    const {
      name,
      cpfCnpj,
      email,
      phone,
      postalCode,
      address,
      addressNumber,
      addressComplement,
      province,
      value,
      dueDate,
      creditCard,
      creditCardHolderInfo,
      remoteIp,
      city,
      state,
      rev,
      selectedPlan,
      dependents
    } = req.body;

    console.log('Starting payment flow for:', {
      name,
      cpfCnpj,
      email,
      phone,
      postalCode,
      address,
      addressNumber,
      addressComplement,
      province,
      city,
      state,
      rev,
      selectedPlan,
      dependents: dependents?.length || 0
    });

    const PLAN_CONFIG = {
      plano_individual: {
        price: 39.90,
        paymentType: "S",
        serviceType: "G"
      },
      plano_individual_premium: {
        price: 59.90,
        paymentType: "S",
        serviceType: "GSP"
      },
      plano_familiar: {
        price: 84.90,
        paymentType: "S",
        serviceType: "GSP"
      }
    };

    const selectedPlanConfig = PLAN_CONFIG[selectedPlan];
    const valueToPay = selectedPlanConfig.price;
    const paymentType = selectedPlanConfig.paymentType;
    const serviceType = selectedPlanConfig.serviceType;

    // 1. First, create the beneficiary (titular)
    console.log('Creating titular beneficiary first...');
    const beneficiary = {
      name: name,
      cpf: cpfCnpj,
      birthday: '1990-01-01',
      beneficiaryType: "titular",
      phone: phone,
      email: email,
      zipCode: postalCode,
      address: address,
      city: city,
      state: state,
      paymentType: paymentType,
      serviceType: serviceType,
      holder: "",
      general: ""
    }

    const titularResp = await findOrCreateBeneficiary(beneficiary);
    if(!titularResp.success){
      return res.json({
        success: false, 
        error: titularResp.error
      }); 
    }

    let beneficiaryUuid = titularResp.beneficiary.uuid;

    console.log('Titular beneficiary created successfully:', beneficiaryUuid);

    // 2. Only proceed with customer creation if beneficiary was created successfully
    console.log('Creating customer after successful beneficiary creation...');
    const customerResponse = await asaas.post("/customers", {
      name,
      cpfCnpj,
      email,
      phone,
      postalCode,
      address,
      addressNumber,
      addressComplement,
      province,
    });

    const customerId = customerResponse.data.id;
    console.log('Customer created successfully with ID:', customerId);

    // 3. Create payment after customer creation
    console.log('Creating payment for customer:', customerId);
    const paymentResponse = await asaas.post("/payments", {
      customer: customerId,
      billingType: "CREDIT_CARD",
      value: valueToPay,
      dueDate: new Date().toISOString().slice(0, 10),
      creditCard,
      creditCardHolderInfo,
      remoteIp: req.ip,
    });

    console.log('Payment created successfully:', {
      paymentId: paymentResponse.data.id,
      status: paymentResponse.data.status,
    });

    // 4. Create dependents if it's a family plan
    if (selectedPlan === 'plano_familiar' && dependents && dependents.length > 0) {
      console.log('Creating dependents for family plan:', dependents.length);
      
      const dependentBeneficiaries = dependents.map(dependent => ({
        name: dependent.name,
        cpf: dependent.cpf,
        birthday: dependent.birthDate,
        beneficiaryType: "dependente",
        phone: phone, // uses titular's phone
        email: email, // uses titular's email
        zipCode: postalCode,
        address: address,
        city: city,
        state: state,
        paymentType: paymentType,
        serviceType: serviceType,
        holder: cpfCnpj, // titular's CPF
        general: ""
      }));

      try {
        const dependentsResponse = await api.post("/beneficiaries", dependentBeneficiaries);
        console.log('Dependents created successfully:', dependentsResponse.data);
      } catch (dependentError) {
        console.error('Error creating dependents:', dependentError.response?.data || dependentError.message);
        // Continue even if there's an error with dependents, since titular was already created
      }
    }

    // 5. Save sale data in venda table
    if(rev){
      const [saleResult] = await db.query(
        'INSERT INTO venda (id_revendedor, cpf_beneficiario, valor, tipo, uuid) VALUES (?, ?, ?, ?, ?)',
        [rev, cpfCnpj, valueToPay, selectedPlan, beneficiaryUuid]
      );
    }

    await logToDatabase(req.body, true, null);

    return res.json({
      success: true,
      paymentId: paymentResponse.data.id,
      status: paymentResponse.data.status,
      invoiceUrl: paymentResponse.data.invoiceUrl,
    });
  } catch (error) {
    await logToDatabase(req.body, false, error);
    
    console.log(error);
    console.error('Error in createCustomerAndPay:', JSON.stringify({
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    }, null, 2));

    const errorMessage = error.response?.data?.errors ? error.response?.data?.errors[0]?.description : "Ocorreu um erro ao processar o pagamento, verifique seus dados e tente novamente.";
    
    return res.json({
      success: false,
      error: errorMessage,
    });
  }
};

// controllers/subscriptionController.js

exports.createCustomerAndSubscribe = async (req, res) => {
  try {
    const {
      name,
      cpfCnpj,
      email,
      phone,
      postalCode,
      address,
      addressNumber,
      addressComplement,
      province,
      city,
      state,
      rev,             // id do revendedor, se houver
      selectedPlan,    // plano escolhido
      dependents       // array de dependentes, se plano familiar
    } = req.body;

    console.log('Starting subscription flow for:', { name, cpfCnpj, email, selectedPlan });

    // 1. Configuration of plans and values
    const PLAN_CONFIG = {
      plano_individual_site:           { price: 39.90, cycle: 'MONTHLY', paymentType: "S", serviceType: "G" },
      plano_individual_premium:   { price: 59.90, cycle: 'MONTHLY', paymentType: "S", serviceType: "GSP" },
      plano_familiar:             { price: 84.90, cycle: 'MONTHLY', paymentType: "S", serviceType: "GSP" }
    };
    const plan = PLAN_CONFIG[selectedPlan];
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Plano inválido' });
    }

    // 2. First, create the titular beneficiary
    const titular = {
      name, cpf: cpfCnpj, birthday: '1990-01-01',
      beneficiaryType: "titular",
      phone, email,
      zipCode: postalCode, address, city, state,
      paymentType: plan.paymentType, serviceType: plan.serviceType,
      holder: "", general: ""
    };


    const titularResp = await findOrCreateBeneficiary(titular);
    if(!titularResp.success){
      return res.json({
        success: false, 
        error: titularResp.error
      }); 
    }

    let titularUuid = titularResp.beneficiary.uuid;

    console.log('Titular beneficiary created successfully:', titularUuid);

    // 3. Only proceed with customer creation if beneficiary was created successfully
    console.log('Creating customer after successful beneficiary creation:', { name, cpfCnpj, email });
    const customerResp = await asaas.post("/customers", {
      name, cpfCnpj, email, phone,
      postalCode, address, addressNumber, addressComplement,
      province, city, state
    });
    const customerId = customerResp.data.id;
    console.log('Customer created successfully:', customerId);

    // 4. Create subscription after customer creation
    console.log('Creating subscription for customer:', customerId);
    const subscriptionBody = {
      customer:       customerId,
      billingType:    "CREDIT_CARD",
      value:          plan.price,
      cycle:          plan.cycle,
      nextDueDate:    new Date().toISOString().slice(0,10), // primeira cobrança hoje
      description:    `Assinatura ${selectedPlan}`,
      creditCard:     req.body.creditCard,
      creditCardHolderInfo: req.body.creditCardHolderInfo,
      remoteIp:       req.ip
    };

    const subResp = await asaas.post("/subscriptions", subscriptionBody, {
      headers: { 'access_token': process.env.ASAAS_API_KEY },
      timeout: 60000
    });
    //console.log('Subscription created successfully:', subResp.data);
    const subscriptionId     = subResp.data.id;
    const subscriptionStatus = subResp.data.status;

    // 5. Create dependents (if family plan)
    if (selectedPlan === 'plano_familiar' && Array.isArray(dependents)) {
      console.log('Creating dependents for family plan:', dependents.length);
      const deps = dependents.map(dep => ({
        name: dep.name, cpf: dep.cpf, birthday: dep.birthDate,
        beneficiaryType: "dependente",
        phone, email,
        zipCode: postalCode, address, city, state,
        paymentType: plan.paymentType, serviceType: plan.serviceType,
        holder: cpfCnpj, general: ""
      }));
      try {
        const depsResp = await api.post("/beneficiaries", deps);
        //console.log('Dependents created successfully:', depsResp.data);
      } catch (err) {
        console.error('Error creating dependents:', err.response?.data || err.message);
        // Continue even if there's an error with dependents, since titular was already created
      }
    }

    // 6. Save to database (sales/subscriptions table)
    if (rev) {
      await db.query(
        `INSERT INTO venda 
         (id_revendedor, cpf_beneficiario, valor, tipo, uuid, subscription_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rev, cpfCnpj, plan.price, selectedPlan, titularUuid, subscriptionId]
      );
    }

    await logToDatabase(req.body, true, null);

    // 7. Response
    return res.json({
      success: true,
      subscriptionId,
      subscriptionStatus
    });

  } catch (error) {
    await logToDatabase(req.body, false, error);
    
    console.error('Error in createCustomerAndSubscribe:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.errors ? error.response?.data?.errors[0]?.description : "Ocorreu um erro ao processar o pagamento, verifique seus dados e tente novamente.";
    return res.json({
      success: false,
      error: errorMessage
    });
  }
};


const findOrCreateBeneficiary = async (titular) => {
  const findBen = await api.get(`/beneficiaries/${titular.cpf}`);
  console.log("Finished getting titular beneficiary", findBen.data);
  if(findBen.data.success){
    await reactivateBeneficiary(findBen.data.beneficiary.uuid);
    return {
      success: true,
      beneficiary: findBen.data.beneficiary
    }
  }

  const createBen = await api.post("/beneficiaries", [titular]);
  console.log("Finished creating titular beneficiary", createBen.data);
  if(createBen.data.success){
    return {
      success: true,
      beneficiary: createBen.data.beneficiary
    }
  }
  return {
    success: false, 
    error: createBen.data.message
  };
}

const logToDatabase = async (data, success = false, error) => {
  await db.query("INSERT INTO logs (jsondata, sucesso, erro) VALUES (?, ?, ?)", [JSON.stringify(data), success, JSON.stringify(error)]);
}

const reactivateBeneficiary = async (uuid) => {
  try {
    const response = await api.put(`/beneficiaries/${uuid}/reactivate`);
    console.log('Beneficiary reactivated successfully:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error reactivating beneficiary:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}