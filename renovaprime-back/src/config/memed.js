const axios = require('axios');

const memedApi = axios.create({
  baseURL: process.env.MEMED_API_URL || 'https://integrations.api.memed.com.br/v1',
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// log the request
memedApi.interceptors.request.use(request => {
  console.log('Request:', process.env.MEMED_API_URL, request.url);
  return request;
});

// log the response
memedApi.interceptors.response.use(response => {
  console.log('Response:', response.data);
  return response;
});

const MEMED_API_KEY = process.env.MEMED_API_KEY;
const MEMED_SECRET_KEY = process.env.MEMED_SECRET_KEY;

module.exports = { memedApi, MEMED_API_KEY, MEMED_SECRET_KEY };
