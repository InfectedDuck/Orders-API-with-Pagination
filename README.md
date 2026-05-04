# Orders Management API

A RESTful API for managing orders with **pagination**, **filtering**, and full CRUD operations. Built with Node.js and Express.

**Repository:** [github.com/InfectedDuck/Orders-API-with-Pagination](https://github.com/InfectedDuck/Orders-API-with-Pagination)

## Features

- **CRUD Operations**: create, read, update, and delete orders
- **Pagination**: page-based navigation with configurable page size (max 100)
- **Filtering**: by status, amount range, and date range
- **Sorting**: by id, customer_name, amount, status, or created_at
- **Validation**: input validation with detailed error messages
- **Seed Data**: script to populate 50 sample orders for testing

## Tech Stack

| Component  | Technology          |
|-----------|---------------------|
| Runtime   | Node.js 16+         |
| Framework | Express 4.x         |
| Database  | JSON file-backed store (zero dependencies) |
| Testing   | Jest + Supertest     |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/InfectedDuck/Orders-API-with-Pagination.git
cd Orders-API-with-Pagination

# 2. Install dependencies
npm install

# 3. Seed the database with 50 sample orders
npm run seed

# 4. Start the server
npm start
# Orders API running on http://localhost:3000
```

## API Endpoints

**Base path:** Order endpoints live under **`/api`**. Full URLs are **`/api/orders`**, **`/api/orders/:id`**, and so on. Some briefs write **`GET /orders`** as shorthand for the orders resource—here that corresponds to **`GET /api/orders`**. The health check stays at **`/health`** (no `/api` prefix).

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok", "timestamp": "2026-04-05T12:00:00.000Z" }
```

---

### Create Order

```
POST /api/orders
Content-Type: application/json
```

**Request Body:**

| Field          | Type    | Required | Description                                      |
|---------------|---------|----------|--------------------------------------------------|
| customer_name | string  | Yes      | Customer's full name                             |
| product       | string  | Yes      | Product name                                     |
| quantity      | integer | Yes      | Quantity ordered (must be > 0)                   |
| amount        | number  | Yes      | Total order amount (must be >= 0)                |
| status        | string  | No       | One of: pending, processing, shipped, delivered, cancelled (default: pending) |

**Example:**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Alice Johnson",
    "product": "Laptop Pro 15\"",
    "quantity": 1,
    "amount": 1299.99
  }'
```

**Response (201):**

```json
{
  "id": 51,
  "customer_name": "Alice Johnson",
  "product": "Laptop Pro 15\"",
  "quantity": 1,
  "amount": 1299.99,
  "status": "pending",
  "created_at": "2026-04-05 12:00:00",
  "updated_at": "2026-04-05 12:00:00"
}
```

---

### List Orders (with Pagination & Filtering)

```
GET /api/orders?page=1&limit=10
```

**Query Parameters:**

| Parameter   | Type    | Default      | Description                                |
|------------|---------|-------------|--------------------------------------------|
| page       | integer | 1           | Page number                                |
| limit      | integer | 10          | Items per page (max: 100)                  |
| status     | string  | (none)      | Filter: pending, processing, shipped, delivered, cancelled |
| min_amount | number  | (none)      | Filter: minimum order amount               |
| max_amount | number  | (none)      | Filter: maximum order amount               |
| start_date | string  | (none)      | Filter: start date (YYYY-MM-DD)            |
| end_date   | string  | (none)      | Filter: end date (YYYY-MM-DD)              |
| sort_by    | string  | created_at  | Sort column: id, customer_name, amount, status, created_at |
| order      | string  | desc        | Sort direction: asc or desc                |

**Example - paginated with filters:**

```bash
curl "http://localhost:3000/api/orders?page=1&limit=5&status=pending&min_amount=50&sort_by=amount&order=desc"
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 12,
      "customer_name": "Bob Smith",
      "product": "Monitor 27\" 4K",
      "quantity": 2,
      "amount": 899.98,
      "status": "pending",
      "created_at": "2026-03-15 14:30:00",
      "updated_at": "2026-03-15 14:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 8,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### Get Single Order

```
GET /api/orders/:id
```

**Response (200):**

```json
{
  "id": 1,
  "customer_name": "Alice Johnson",
  "product": "Wireless Mouse",
  "quantity": 5,
  "amount": 124.95,
  "status": "shipped",
  "created_at": "2026-02-10 09:15:00",
  "updated_at": "2026-03-01 11:00:00"
}
```

**Response (404):**

```json
{ "error": "Order with id 9999 not found." }
```

---

### Update Order

```
PUT /api/orders/:id
Content-Type: application/json
```

Send only the fields to update. Unspecified fields remain unchanged.

```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "shipped", "quantity": 10 }'
```

---

### Delete Order

```
DELETE /api/orders/:id
```

**Response (200):**

```json
{ "message": "Order 1 deleted successfully." }
```

## Error Responses

| Status | Meaning               | Example                                          |
|--------|----------------------|--------------------------------------------------|
| 400    | Bad Request          | Invalid input, missing required fields, bad filter value |
| 404    | Not Found            | Order ID does not exist, or unknown endpoint     |
| 500    | Internal Server Error | Unexpected database or server failure            |

**Validation error format:**

```json
{
  "error": "Validation failed",
  "details": [
    "customer_name is required and must be a non-empty string.",
    "quantity is required and must be a positive integer."
  ]
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

## Project Structure

```
Orders-API-with-Pagination/   # repository root (EPAM folder may be named task_3 locally)
├── src/
│   ├── app.js          # Express app setup and middleware
│   ├── database.js     # Database initialization and query engine
│   ├── routes.js       # API route handlers (CRUD, pagination, filtering)
│   ├── seed.js         # Database seeder (50 sample orders)
│   └── server.js       # Server entry point
├── tests/
│   └── orders.test.js  # Jest + Supertest test suite (25 test cases)
├── Module7_PT3_Toktar_Kametay.md
├── package.json
└── README.md
```
