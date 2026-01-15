// src/controllers/tokenizeController.js
const { validationResult } = require('express-validator');
const svc = require('../services/asaasService');

exports.tokenize = async (req, res) => {
  console.log(req.body);
  //const errors = validationResult(req);
  //console.log(errors);
  //if (!errors.isEmpty()) {
  //  return res.status(422).json({ success: false, errors: errors.array() });
  //}

  try {
    // 1. Criar ou localizar cliente
    const customerId = await svc.upsertCustomer({
      name:     req.body.name,
      cpf:      req.body.cpf,
      birthday: req.body.birthday,
      email:    req.body.email,
      phone:    req.body.phone,
      zipCode:  req.body.zipCode,
      address:  req.body.address,
      city:     req.body.city,
      state:    req.body.state
    });

    // 2. Tokenizar cartão já associando ao customerId
    const token = await svc.tokenizeCard({
      customerId,
      cardNumber: req.body.cardNumber,
      holderName: req.body.holderName,
      expMonth:   req.body.expMonth,
      expYear:    req.body.expYear,
      cvv:        req.body.cvv,
      remoteIp:   req.ip
    });

    return res.json({ success: true, token, customerId });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
};
