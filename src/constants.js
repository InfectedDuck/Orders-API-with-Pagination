/**
 * Single source of truth for order list constraints (Task 4 / Cursor refactor).
 * Keeps validation aligned across routes and persistence without copy-paste arrays.
 */
const ORDER_STATUSES = Object.freeze([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

/** Columns exposed for GET /orders sorting (whitelist — avoids unsafe dynamic keys). */
const LIST_SORT_FIELDS = Object.freeze([
  'id',
  'customer_name',
  'amount',
  'status',
  'created_at',
]);

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
});

module.exports = {
  ORDER_STATUSES,
  LIST_SORT_FIELDS,
  PAGINATION,
};
