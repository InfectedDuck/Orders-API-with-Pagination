const { initDatabase } = require('./database');

/**
 * Seed the database with 50 sample orders.
 * Run: npm run seed
 */

const customers = [
  'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Davis',
  'Frank Miller', 'Grace Lee', 'Henry Wilson', 'Ivy Chen', 'Jack Taylor',
  'Karen White', 'Liam Harris', 'Mia Clark', 'Noah Lewis', 'Olivia Hall',
];

const products = [
  'Laptop Pro 15"', 'Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub',
  'Monitor 27" 4K', 'Webcam HD', 'Headphones NC', 'External SSD 1TB',
  'Desk Lamp LED', 'Ergonomic Chair', 'Standing Desk', 'Tablet 10"',
  'Smartphone Case', 'Portable Charger', 'Cable Organizer',
];

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomAmount = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);

// Generate a random date within the past 90 days
const randomDate = () => {
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const ts = now - Math.floor(Math.random() * ninetyDays);
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
};

const seedDatabase = (db) => {
  // Clear existing data
  db.clear();

  const orders = Array.from({ length: 50 }, () => {
    const date = randomDate();
    return {
      customer_name: randomItem(customers),
      product: randomItem(products),
      quantity: randomInt(1, 20),
      amount: randomAmount(9.99, 2499.99),
      status: randomItem(statuses),
      created_at: date,
      updated_at: date,
    };
  });

  for (const order of orders) {
    db.insert(order);
  }

  console.log(`Seeded ${orders.length} sample orders.`);
  return orders;
};

// Run directly: node src/seed.js
if (require.main === module) {
  const db = initDatabase();
  seedDatabase(db);
  db.close();
}

module.exports = { seedDatabase };
