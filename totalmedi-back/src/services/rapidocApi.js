const axios = require('axios');
const config = require('../config');

const api = axios.create({
  baseURL: config.baseUrl,
  headers: config.headers
});

module.exports = api;