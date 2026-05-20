const axios = require('axios');

const baseURL =
  process.env.RAPIDOC_BASE_URL ||
  process.env.BASE_URL ||
  'https://api.rapidoc.tech/tema/api';

const token = process.env.RAPIDOC_TOKEN || process.env.TOKEN || '';
const clientId = process.env.RAPIDOC_CLIENT_ID || process.env.CLIENT_ID || '';

const rapidocApi = axios.create({
  baseURL: baseURL.replace(/\/+$/, ''),
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    clientId,
    'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
  },
  timeout: 30000
});

module.exports = rapidocApi;
