const express = require('express');
const app = express();
const resellersRoutes = require('./routes/resellersRoutes');

// Routes
app.use('/api', resellersRoutes);

// ... rest of the app configuration ... 