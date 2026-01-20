const teleconsultRoutes = require('./teleconsultRoutes');
const { createPeerServer } = require('./peerServer');
const teleconsultService = require('./teleconsultService');
const teleconsultController = require('./teleconsultController');

module.exports = {
  teleconsultRoutes,
  createPeerServer,
  teleconsultService,
  teleconsultController
};
