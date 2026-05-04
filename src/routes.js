const express = require('express');
const router = express.Router();

// db instance gets plugged in from app.js once at startup
let db;
const setDatabase = (database) => {
  db = database;
};

// POST /orders - create a new order
router.post('/orders', (req, res) => {
  const { customer_name, product, quantity, amount, status } = req.body;

  const errors = [];
  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
    errors.push('customer_name is required and must be a non-empty string.');
  }
  if (!product || typeof product !== 'string' || product.trim().length === 0) {
    errors.push('product is required and must be a non-empty string.');
  }
  if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
    errors.push('quantity is required and must be a positive integer.');
  }
  if (amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
    errors.push('amount is required and must be a non-negative number.');
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const orderStatus = status || 'pending';
  if (!validStatuses.includes(orderStatus)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const order = db.insert({
      customer_name: customer_name.trim(),
      product: product.trim(),
      quantity,
      amount,
      status: orderStatus,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// GET /orders - list orders with pagination and filtering
// Pagination:  ?page=1&limit=10
// Filters:     ?status=pending
//              ?min_amount=100&max_amount=500
//              ?start_date=2025-01-01&end_date=2025-12-31
// Sorting:     ?sort_by=created_at&order=desc
router.get('/orders', (req, res) => {
  try {
    // Pagination defaults
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100; // Cap to prevent abuse

    // Validate status filter
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (req.query.status && !validStatuses.includes(req.query.status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Validate amount filters
    let min_amount, max_amount;
    if (req.query.min_amount !== undefined) {
      min_amount = parseFloat(req.query.min_amount);
      if (isNaN(min_amount)) {
        return res.status(400).json({ error: 'min_amount must be a valid number.' });
      }
    }
    if (req.query.max_amount !== undefined) {
      max_amount = parseFloat(req.query.max_amount);
      if (isNaN(max_amount)) {
        return res.status(400).json({ error: 'max_amount must be a valid number.' });
      }
    }

    // Validate date filters
    if (req.query.start_date && isNaN(Date.parse(req.query.start_date))) {
      return res.status(400).json({ error: 'start_date must be a valid date (YYYY-MM-DD).' });
    }
    if (req.query.end_date && isNaN(Date.parse(req.query.end_date))) {
      return res.status(400).json({ error: 'end_date must be a valid date (YYYY-MM-DD).' });
    }

    // Sorting - whitelist columns to prevent injection
    const allowedSortColumns = ['id', 'customer_name', 'amount', 'status', 'created_at'];
    const sort_by = allowedSortColumns.includes(req.query.sort_by)
      ? req.query.sort_by
      : 'created_at';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    // Query database
    const { data, total } = db.query({
      status: req.query.status,
      min_amount,
      max_amount,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      sort_by,
      order,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
});

// GET /orders/:id - get a single order by ID
router.get('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Order ID must be a valid integer.' });
  }

  const order = db.findById(id);
  if (!order) {
    return res.status(404).json({ error: `Order with id ${id} not found.` });
  }

  res.json(order);
});

// PUT /orders/:id - update an existing order
router.put('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Order ID must be a valid integer.' });
  }

  const existing = db.findById(id);
  if (!existing) {
    return res.status(404).json({ error: `Order with id ${id} not found.` });
  }

  const { customer_name, product, quantity, amount, status } = req.body;
  const errors = [];

  if (customer_name !== undefined && (typeof customer_name !== 'string' || customer_name.trim().length === 0)) {
    errors.push('customer_name must be a non-empty string.');
  }
  if (product !== undefined && (typeof product !== 'string' || product.trim().length === 0)) {
    errors.push('product must be a non-empty string.');
  }
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
    errors.push('quantity must be a positive integer.');
  }
  if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
    errors.push('amount must be a non-negative number.');
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const updated = db.update(id, {
      customer_name: customer_name ? customer_name.trim() : undefined,
      product: product ? product.trim() : undefined,
      quantity,
      amount,
      status,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', message: err.message });
  }
});

// DELETE /orders/:id - delete an order
router.delete('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Order ID must be a valid integer.' });
  }

  const existing = db.findById(id);
  if (!existing) {
    return res.status(404).json({ error: `Order with id ${id} not found.` });
  }

  try {
    db.delete(id);
    res.json({ message: `Order ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', message: err.message });
  }
});

module.exports = { router, setDatabase };
