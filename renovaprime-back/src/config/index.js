require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL,
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  headers: {
    'Authorization': `Bearer ${process.env.TOKEN}`,
    'clientId': process.env.CLIENT_ID,
    'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
  }
};