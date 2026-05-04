const fs = require('fs');
const path = require('path');

// tiny JSON "db" — good enough for the assignment, nothing fancy
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

  _save() {
    if (this.dbPath) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ orders: this.orders, nextId: this.nextId }, null, 2));
    }
  }

  _now() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  insert(order) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const status = order.status || 'pending';

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    if (!order.quantity || order.quantity <= 0) {
      throw new Error('quantity must be > 0');
    }
    if (order.amount === undefined || order.amount < 0) {
      throw new Error('amount must be >= 0');
    }

    const now = this._now();
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
    this._save();
    return { ...newOrder };
  }

  findById(id) {
    const order = this.orders.find((o) => o.id === id);
    return order ? { ...order } : null;
  }

  // filter + sort + slice — that's our "server-side" list endpoint
  query({ status, min_amount, max_amount, start_date, end_date, sort_by, order, page, limit }) {
    let result = [...this.orders];

    // Apply filters
    if (status) {
      result = result.filter((o) => o.status === status);
    }
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
      const endWithTime = end_date + 'T23:59:59';
      result = result.filter((o) => o.created_at <= endWithTime);
    }

    // Sort
    const sortField = sort_by || 'created_at';
    const sortDir = order === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortDir;
      if (a[sortField] > b[sortField]) return 1 * sortDir;
      return 0;
    });

    const total = result.length;

    // Paginate
    const p = page || 1;
    const l = limit || 10;
    const offset = (p - 1) * l;
    const data = result.slice(offset, offset + l);

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
      updated_at: this._now(),
    };

    this.orders[index] = updated;
    this._save();
    return { ...updated };
  }

  delete(id) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    this._save();
    return true;
  }

  clear() {
    this.orders = [];
    this.nextId = 1;
    this._save();
  }

  close() {
    // No-op for compatibility
  }
}

const initDatabase = (dbPath) => {
  return new Database(dbPath);
};

module.exports = { initDatabase, Database };
