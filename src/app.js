const express = require('express');
const cors = require('cors');
const { router, setDatabase } = require('./routes');

/**
 * Create and configure the Express application.
 * Accepts a database instance so callers (server, tests) can inject their own.
 */
const createApp = (db) => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Inject database into routes
  setDatabase(db);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', router);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
};

module.exports = { createApp };
