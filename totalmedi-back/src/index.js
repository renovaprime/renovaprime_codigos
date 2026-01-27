const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');
const AuthController = require('./controllers/authController');
const authController = require('./controllers/authController');
const checkoutRoutes = require('./routes/checkoutRoutes');
const tokenizeRoutes = require('./routes/tokenizeRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const branchRoutes = require('./routes/branchRoutes');
const resellersRoutes = require('./routes/resellersRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { initializeJobs } = require('./jobs');
const app = express();

// Middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: ['https://portal.totalmedi.com.br', 'http://localhost:5173', 'https://totalmedi.com.br'],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Serve public files (including depoimentos)
app.use('/public', express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// Specific route for depoimentos images to ensure proper CORS headers
app.get('/public/depoimentos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/depoimentos', filename);
  
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  res.sendFile(filePath);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', beneficiaryRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', professionalRoutes);
app.use('/api', settingsRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', tokenizeRoutes);
app.use('/api', partnerRoutes);
app.use('/api', branchRoutes);
app.use('/api', resellersRoutes);
app.use('/api', commissionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Inicializar jobs de cron após o servidor estar rodando
  initializeJobs();
});