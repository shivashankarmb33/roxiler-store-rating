const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server if executed directly
if (require.main === module) {
  (async () => {
    try {
      await testConnection();
      await initializeDatabase();
      app.listen(PORT, () => {
        console.log(`🚀 Roxiler Store Rating API is running on port ${PORT}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
      });
    } catch (err) {
      console.error('Failed to initialize server:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;

