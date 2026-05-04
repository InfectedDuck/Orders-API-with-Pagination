/**
 * Parses and validates GET /orders query parameters.
 * Pure helpers → easier unit reasoning + mirrors common service-layer patterns.
 */
const { ORDER_STATUSES, LIST_SORT_FIELDS, PAGINATION } = require('./constants');

function clampPagination(rawPage, rawLimit) {
  let page = parseInt(rawPage, 10);
  let limit = parseInt(rawLimit, 10);
  if (Number.isNaN(page) || page < 1) page = PAGINATION.DEFAULT_PAGE;
  if (Number.isNaN(limit) || limit < PAGINATION.MIN_LIMIT) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;
  return { page, limit };
}

/**
 * @returns {{ ok: true, params: object } | { ok: false, status: number, body: object }}
 */
function parseOrderListQuery(query) {
  const { page, limit } = clampPagination(query.page, query.limit);

  if (query.status && !ORDER_STATUSES.includes(query.status)) {
    return {
      ok: false,
      status: 400,
      body: {
        error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`,
      },
    };
  }

  let min_amount;
  let max_amount;
  if (query.min_amount !== undefined) {
    min_amount = parseFloat(query.min_amount);
    if (Number.isNaN(min_amount)) {
      return {
        ok: false,
        status: 400,
        body: { error: 'min_amount must be a valid number.' },
      };
    }
  }
  if (query.max_amount !== undefined) {
    max_amount = parseFloat(query.max_amount);
    if (Number.isNaN(max_amount)) {
      return {
        ok: false,
        status: 400,
        body: { error: 'max_amount must be a valid number.' },
      };
    }
  }

  if (query.start_date && Number.isNaN(Date.parse(query.start_date))) {
    return {
      ok: false,
      status: 400,
      body: { error: 'start_date must be a valid date (YYYY-MM-DD).' },
    };
  }
  if (query.end_date && Number.isNaN(Date.parse(query.end_date))) {
    return {
      ok: false,
      status: 400,
      body: { error: 'end_date must be a valid date (YYYY-MM-DD).' },
    };
  }

  const sort_by = LIST_SORT_FIELDS.includes(query.sort_by)
    ? query.sort_by
    : 'created_at';
  const order = query.order === 'asc' ? 'asc' : 'desc';

  return {
    ok: true,
    params: {
      page,
      limit,
      filters: {
        status: query.status,
        min_amount,
        max_amount,
        start_date: query.start_date,
        end_date: query.end_date,
      },
      sort_by,
      order,
    },
  };
}

module.exports = {
  clampPagination,
  parseOrderListQuery,
};
