const fs = require('fs');
const path = require('path');
const { ORDER_STATUSES } = require('./constants');

/**
 * JSON-backed persistence with an explicit query pipeline:
 * clone → filter → sort → paginate. Keeps list logic readable at scale (Task 4).
 */
class Database {
  constructor(dbPath) {
    this.dbPath = dbPath === ':memory:' ? null : (dbPath || path.join(__dirname, '..', 'orders.json'));
    this.orders = [];
    this.nextId = 1;

    if (this.dbPath && fs.existsSync(this.dbPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
        this.orders = data.orders || [];
        this.nextId = data.nextId || 1;
      } catch {
        this.orders = [];
        this.nextId = 1;
      }
    }
  }

  _persist() {
    if (this.dbPath) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ orders: this.orders, nextId: this.nextId }, null, 2));
    }
  }

  _timestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  insert(order) {
    const status = order.status || 'pending';
    if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
    if (!order.quantity || order.quantity <= 0) throw new Error('quantity must be > 0');
    if (order.amount === undefined || order.amount < 0) throw new Error('amount must be >= 0');

    const now = this._timestamp();
    const newOrder = {
      id: this.nextId++,
      customer_name: order.customer_name,
      product: order.product,
      quantity: order.quantity,
      amount: order.amount,
      status,
      created_at: order.created_at || now,
      updated_at: order.updated_at || now,
    };

    this.orders.push(newOrder);
    this._persist();
    return { ...newOrder };
  }

  findById(id) {
    const order = this.orders.find((o) => o.id === id);
    return order ? { ...order } : null;
  }

  _filterRows(rows, { status, min_amount, max_amount, start_date, end_date }) {
    let result = rows;
    if (status) result = result.filter((o) => o.status === status);
    if (min_amount !== undefined) {
      result = result.filter((o) => o.amount >= min_amount);
    }
    if (max_amount !== undefined) {
      result = result.filter((o) => o.amount <= max_amount);
    }
    if (start_date) {
      result = result.filter((o) => o.created_at >= start_date);
    }
    if (end_date) {
      const endInclusive = `${end_date}T23:59:59`;
      result = result.filter((o) => o.created_at <= endInclusive);
    }
    return result;
  }

  _sortRows(rows, sortField, direction) {
    const dir = direction === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * dir;
      if (a[sortField] > b[sortField]) return 1 * dir;
      return 0;
    });
    return rows;
  }

  /**
   * @param {{ status?: string, min_amount?: number, max_amount?: number, start_date?: string, end_date?: string, sort_by?: string, order?: string, page?: number, limit?: number }} opts
   */
  query(opts) {
    const {
      status,
      min_amount,
      max_amount,
      start_date,
      end_date,
      sort_by,
      order,
      page,
      limit,
    } = opts;

    let rows = [...this.orders];
    rows = this._filterRows(rows, {
      status,
      min_amount,
      max_amount,
      start_date,
      end_date,
    });

    const sortField = sort_by || 'created_at';
    this._sortRows(rows, sortField, order);

    const total = rows.length;
    const p = page || 1;
    const l = limit || 10;
    const offset = (p - 1) * l;
    const data = rows.slice(offset, offset + l);

    return { data, total };
  }

  update(id, fields) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const existing = this.orders[index];
    const updated = {
      ...existing,
      customer_name: fields.customer_name !== undefined ? fields.customer_name : existing.customer_name,
      product: fields.product !== undefined ? fields.product : existing.product,
      quantity: fields.quantity !== undefined ? fields.quantity : existing.quantity,
      amount: fields.amount !== undefined ? fields.amount : existing.amount,
      status: fields.status !== undefined ? fields.status : existing.status,
      updated_at: this._timestamp(),
    };

    this.orders[index] = updated;
    this._persist();
    return { ...updated };
  }

  delete(id) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    this._persist();
    return true;
  }

  clear() {
    this.orders = [];
    this.nextId = 1;
    this._persist();
  }

  close() {}
}

const initDatabase = (dbPath) => new Database(dbPath);

module.exports = { initDatabase, Database };
