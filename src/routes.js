const express = require('express');
const { parseOrderListQuery } = require('./orderListParams');
const { validateCreateOrderBody, validatePatchOrderBody } = require('./orderBodyValidation');

const router = express.Router();

let db;
const setDatabase = (database) => {
  db = database;
};

router.post('/orders', (req, res) => {
  const { errors, resolvedStatus } = validateCreateOrderBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { customer_name, product, quantity, amount } = req.body;

  try {
    const order = db.insert({
      customer_name: customer_name.trim(),
      product: product.trim(),
      quantity,
      amount,
      status: resolvedStatus,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

router.get('/orders', (req, res) => {
  try {
    const parsed = parseOrderListQuery(req.query);
    if (!parsed.ok) {
      return res.status(parsed.status).json(parsed.body);
    }

    const { page, limit, filters, sort_by, order } = parsed.params;
    const { data, total } = db.query({
      ...filters,
      sort_by,
      order,
      page,
      limit,
    });

    const total_pages = Math.ceil(total / limit);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
});

router.get('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Order ID must be a valid integer.' });
  }

  const order = db.findById(id);
  if (!order) {
    return res.status(404).json({ error: `Order with id ${id} not found.` });
  }

  res.json(order);
});

router.put('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Order ID must be a valid integer.' });
  }

  const existing = db.findById(id);
  if (!existing) {
    return res.status(404).json({ error: `Order with id ${id} not found.` });
  }

  const errors = validatePatchOrderBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { customer_name, product, quantity, amount, status } = req.body;

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

router.delete('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
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
