const axios = require('axios');

const asaas = axios.create({
  baseURL: process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

module.exports = asaas;
