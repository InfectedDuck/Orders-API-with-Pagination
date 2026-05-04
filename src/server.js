const { initDatabase } = require('./database');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

const db = initDatabase();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Orders API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base:     http://localhost:${PORT}/api/orders`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  db.close();
  process.exit(0);
});
