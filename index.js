#!/usr/bin/env node

// Worldesta Automation - Main Entry Point
// This file starts the Express server

const app = require('./src/server');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
setTimeout(async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.warn('⚠️  Warning: Could not connect to database. Server will start but database operations may fail.');
    }
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}, 1000);

// Export for testing
module.exports = app;
