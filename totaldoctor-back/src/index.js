require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { teleconsultRoutes, createPeerServer } = require('./modules/teleconsult');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e parsing - ANTES do PeerServer
app.use(helmet({
  // Desabilitar algumas restrições para PeerServer/WebSocket funcionar
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar PeerServer - DEPOIS dos middlewares de CORS
const peerServer = createPeerServer(server);
const PEERJS_PATH = process.env.PEERJS_PATH || '/peerjs';
app.use(PEERJS_PATH, peerServer);

app.get('/health', async (req, res) => {
  const health = {
     status: 'UP',
     uptime: process.uptime(),
     timestamp: new Date().toISOString(),
     service: process.env.npm_package_name || 'totalmedi-backend',
     db_status: 'checking'
  };

  try {
     await sequelize.authenticate();
     health.db_status = 'CONNECTED';
     res.status(200).json(health);
  } catch (error) {
     health.status = 'DOWN';
     health.db_status = 'DISCONNECTED';
     health.error = error.message;
     res.status(503).json(health);
  }
});

app.use('/api/v1', routes);

// Rotas do módulo teleconsult
app.use('/api/v1/teleconsult', teleconsultRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API available at http://localhost:${PORT}/api/v1`);
      console.log(`PeerServer available at http://localhost:${PORT}${PEERJS_PATH}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
