const express = require('express');
const cors = require('cors');
const { router, setDatabase } = require('./routes');

/**
 * Express application factory with injected database (tests + runtime parity).
 */
const createApp = (database) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  setDatabase(database);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', router);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
};

module.exports = { createApp };
