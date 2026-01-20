const { ExpressPeerServer } = require('peer');

/**
 * Configura e retorna o PeerServer para ser usado com Express
 * @param {http.Server} server - O servidor HTTP do Express
 * @returns {ExpressPeerServer} - Instância do PeerServer
 */
function createPeerServer(server) {
  const isDebug = process.env.NODE_ENV !== 'production' || process.env.PEERJS_DEBUG === 'true';

  const peerServer = ExpressPeerServer(server, {
    path: '/',
    proxied: true,
    debug: isDebug,
    allow_discovery: false,
    // Permitir que peers se desconectem e reconectem com mesmo ID
    alive_timeout: 60000,
    key: 'peerjs',
    concurrent_limit: 5000
  });

  console.log(`[PeerServer] Initialized with debug=${isDebug}`);

  // Log de conexões (opcional, útil para debug)
  peerServer.on('connection', (client) => {
    console.log(`[PeerServer] Client connected: ${client.getId()}`);
  });

  peerServer.on('disconnect', (client) => {
    console.log(`[PeerServer] Client disconnected: ${client.getId()}`);
  });

  peerServer.on('error', (error) => {
    console.error('[PeerServer] Error:', error);
  });

  return peerServer;
}

module.exports = { createPeerServer };
