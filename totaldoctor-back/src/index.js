require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
