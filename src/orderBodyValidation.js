/**
 * Shared validation for POST (create) and PUT (partial update) payloads.
 */
const { ORDER_STATUSES } = require('./constants');

function validateCreateOrderBody(body) {
  const errors = [];
  const { customer_name, product, quantity, amount, status } = body;

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

  const orderStatus = status || 'pending';
  if (!ORDER_STATUSES.includes(orderStatus)) {
    errors.push(`status must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  return { errors, resolvedStatus: orderStatus };
}

function validatePatchOrderBody(body) {
  const errors = [];
  const { customer_name, product, quantity, amount, status } = body;

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
  if (status !== undefined && !ORDER_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  return errors;
}

module.exports = {
  validateCreateOrderBody,
  validatePatchOrderBody,
};
