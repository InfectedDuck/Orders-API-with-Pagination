const request = require('supertest');
const { initDatabase } = require('../src/database');
const { createApp } = require('../src/app');
const { seedDatabase } = require('../src/seed');

let app;
let db;

beforeAll(() => {
  db = initDatabase(':memory:');
  app = createApp(db);
  seedDatabase(db);
});

afterAll(() => {
  db.close();
});

describe('POST /api/orders', () => {
  const validOrder = {
    customer_name: 'Test User',
    product: 'Test Product',
    quantity: 3,
    amount: 49.99,
  };

  test('1. Should create a new order with valid data', async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.customer_name).toBe('Test User');
    expect(res.body.product).toBe('Test Product');
    expect(res.body.quantity).toBe(3);
    expect(res.body.amount).toBe(49.99);
    expect(res.body.status).toBe('pending');
  });

  test('2. Should create an order with explicit status', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, status: 'processing' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('processing');
  });

  test('3. Should reject order with missing required fields', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.length).toBeGreaterThanOrEqual(4);
  });

  test('4. Should reject order with invalid status', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, status: 'invalid_status' });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toContain('status must be one of');
  });

  test('5. Should reject order with negative amount', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, amount: -10 });
    expect(res.status).toBe(400);
  });

  test('6. Should reject order with zero quantity', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, quantity: 0 });
    expect(res.status).toBe(400);
  });

  test('7. Should reject order with whitespace-only customer_name', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, customer_name: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders - Pagination', () => {
  test('8. Should return paginated results with default page=1, limit=10', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBeGreaterThan(0);
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('has_next');
    expect(res.body.pagination).toHaveProperty('has_prev');
  });

  test('9. Should return specific page with custom limit', async () => {
    const res = await request(app).get('/api/orders?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.has_prev).toBe(true);
  });

  test('10. Should return empty data for page beyond total', async () => {
    const res = await request(app).get('/api/orders?page=9999&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.has_next).toBe(false);
  });

  test('11. Should cap limit at 100', async () => {
    const res = await request(app).get('/api/orders?limit=500');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });
});

describe('GET /api/orders - Filtering', () => {
  test('12. Should filter by status', async () => {
    const res = await request(app).get('/api/orders?status=pending');
    expect(res.status).toBe(200);
    res.body.data.forEach((order) => {
      expect(order.status).toBe('pending');
    });
  });

  test('13. Should filter by amount range', async () => {
    const res = await request(app).get('/api/orders?min_amount=100&max_amount=500');
    expect(res.status).toBe(200);
    res.body.data.forEach((order) => {
      expect(order.amount).toBeGreaterThanOrEqual(100);
      expect(order.amount).toBeLessThanOrEqual(500);
    });
  });

  test('14. Should filter by date range', async () => {
    const startDate = '2025-01-01';
    const endDate = '2026-12-31';
    const res = await request(app).get(
      `/api/orders?start_date=${startDate}&end_date=${endDate}`
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('15. Should reject invalid status filter', async () => {
    const res = await request(app).get('/api/orders?status=nonexistent');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid status');
  });

  test('16. Should reject non-numeric min_amount', async () => {
    const res = await request(app).get('/api/orders?min_amount=abc');
    expect(res.status).toBe(400);
  });

  test('17. Should combine multiple filters', async () => {
    const res = await request(app).get(
      '/api/orders?status=pending&min_amount=10&limit=5'
    );
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
    res.body.data.forEach((order) => {
      expect(order.status).toBe('pending');
      expect(order.amount).toBeGreaterThanOrEqual(10);
    });
  });
});

describe('GET /api/orders/:id', () => {
  test('18. Should return a single order by ID', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('customer_name');
    expect(res.body).toHaveProperty('product');
  });

  test('19. Should return 404 for non-existent order', async () => {
    const res = await request(app).get('/api/orders/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/orders/:id', () => {
  test('20. Should update an existing order', async () => {
    const res = await request(app)
      .put('/api/orders/1')
      .send({ status: 'shipped', quantity: 10 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shipped');
    expect(res.body.quantity).toBe(10);
  });

  test('21. Should return 404 when updating non-existent order', async () => {
    const res = await request(app)
      .put('/api/orders/99999')
      .send({ status: 'shipped' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/orders/:id', () => {
  let orderIdToDelete;

  beforeAll(async () => {
    const res = await request(app).post('/api/orders').send({
      customer_name: 'Delete Me',
      product: 'Temp Product',
      quantity: 1,
      amount: 1.0,
    });
    orderIdToDelete = res.body.id;
  });

  test('22. Should delete an existing order and 404 on re-fetch', async () => {
    const res = await request(app).delete(`/api/orders/${orderIdToDelete}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted successfully');

    const getRes = await request(app).get(`/api/orders/${orderIdToDelete}`);
    expect(getRes.status).toBe(404);
  });

  test('23. Should return 404 when deleting non-existent order', async () => {
    const res = await request(app).delete('/api/orders/99999');
    expect(res.status).toBe(404);
  });
});

describe('Misc endpoints', () => {
  test('24. Health check should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('25. Unknown route should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
