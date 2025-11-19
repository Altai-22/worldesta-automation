const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API Routes (to be implemented)
app.get('/api/videos', (req, res) => {
  res.status(200).json({
    message: 'Videos endpoint',
    data: []
  });
});

app.get('/api/schedules', (req, res) => {
  res.status(200).json({
    message: 'Schedules endpoint',
    data: []
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    message: 'System status',
    services: {
      database: 'pending',
      youtube: 'pending',
      tiktok: 'pending',
      cloudinary: 'pending'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    method: req.method
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `Route ${req.path} not found`
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Worldesta Automation Server Started`);
  console.log(`========================================`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
