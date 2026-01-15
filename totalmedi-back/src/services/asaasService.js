const asaas = require('../config/asaas');

exports.upsertCustomer = async data => {
  const { data: found } = await asaas.get('/customers', { params: { cpfCnpj: data.cpf } });
  if (found.totalCount) return found.data[0].id;

  const payload = {
    name: data.name,
    cpfCnpj: data.cpf,
    email: data.email,
    mobilePhone: data.phone,
    birthDate: data.birthday,
    postalCode: data.zipCode,
    address: data.address,
    city: data.city,
    province: data.state
  };
  const { data: created } = await asaas.post('/customers', payload);
  return created.id;
};

exports.createCardCharge = async opts => {
  const payload = {
    customer: opts.customerId,
    billingType: 'CREDIT_CARD',
    creditCardToken: opts.cardToken,
    value: opts.amount,
    dueDate: opts.dueDate,
    remoteIp: opts.remoteIp
  };
  const { data } = await asaas.post('/payments', payload);
  return data;
};

exports.tokenizeCard = async ({ customerId, cardNumber, holderName, expMonth, expYear, cvv, remoteIp }) => {
  const payload = {
    customer: customerId,
    creditCard: {
      number:        cardNumber,
      holderName,
      expirationMonth: expMonth,
      expirationYear:  expYear,
      ccv:            cvv
    },
    creditCardHolderInfo: {
      name:            holderName,
      cpfCnpj:         "",   // se já tiver, passe aqui
      billingAddress:  {}    // opcional
    },
    remoteIp
  };
  const { data } = await asaas.post('/creditCard/tokenizeCreditCard', payload);
  return data.token;         // ex.: "tok_abc123..."
};
