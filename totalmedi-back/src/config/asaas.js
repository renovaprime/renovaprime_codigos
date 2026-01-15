const axios = require('axios');
require('dotenv').config();

module.exports = axios.create({
  baseURL: process.env.ASAAS_BASE_URL,
  headers: { access_token: process.env.ASAAS_API_KEY }
});
