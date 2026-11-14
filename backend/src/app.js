const express = require('express');
const cors = require('cors');
const taxGroupRoutes = require('./routes/taxGroupRoutes');
const taxDetailRoutes = require('./routes/taxDetailRoutes');
const workMasterRoutes = require('./routes/workMasterRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CA ProFlow API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Tax Group routes
app.use('/api/tax-groups', taxGroupRoutes);

// Mount Tax Detail routes
app.use('/api/tax-details', taxDetailRoutes);

// Mount Work Master routes
app.use('/api/work-masters', workMasterRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
