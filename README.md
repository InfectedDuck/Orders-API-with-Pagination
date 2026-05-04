# Orders Management API (Task 4 branch)

REST API for orders with **pagination**, **filtering**, and CRUD. This folder matches the **Task 3 behavior** from `Orders-API-with-Pagination-*` while restructuring code for clarity, linting, and an obvious pull-request story (**Copilot-style baseline → Cursor-style refactor**).

## Quick start

```bash
npm install
npm run seed
npm start
```

```bash
npm test
npm run test:coverage
npm run lint
```

---

## What changed vs Task 3 (PT3 folder)

| Area | Task 3 (`Orders-API-with-Pagination-*`) | Task 4 (`task_4`) |
|------|----------------------------------------|-------------------|
| **Style** | Straight-through handlers, comments inline | Split into small modules + JSDoc-style blocks |
| **Constants** | Status/sort arrays repeated in `routes.js` | `src/constants.js` — single source of truth |
| **GET /orders** | Parsing + validation inline in the route | `parseOrderListQuery()` in `src/orderListParams.js` |
| **POST/PUT bodies** | Validation duplicated | `src/orderBodyValidation.js` shared validators |
| **Database list** | One long `query()` | Pipeline: `_filterRows` → `_sortRows` → slice |
| **Tooling** | Tests only | **`npm run lint`** (`node --check` on all entry files) |

### Why this is useful (real benefits)

1. **Fewer subtle drift bugs** — allowed statuses and sort columns live in one place (`constants.js`).
2. **Easier reviews** — route file stays thin; list-query rules are testable in isolation if you extend the suite later.
3. **Safer evolution** — whitelist sorting stays centralized; adding a filter touches `_filterRows` first.
4. **Course narrative** — PT3 repo stays the “Copilot / single-file” snapshot; PT4 is the **PR** that introduces structure without changing HTTP contracts.

---

## API (unchanged contracts)

- **POST** `/api/orders` — create  
- **GET** `/api/orders` — `page`, `limit` (max 100), `status`, `min_amount`, `max_amount`, `start_date`, `end_date`, `sort_by`, `order`  
- **GET** `/api/orders/:id` — read one  
- **PUT** `/api/orders/:id` — patch-style update  
- **DELETE** `/api/orders/:id` — delete  
- **GET** `/health`

Example:

```bash
curl "http://localhost:3000/api/orders?page=2&limit=5&status=pending&min_amount=50"
```

Response shape:

```json
{
  "data": [ /* orders */ ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 50,
    "total_pages": 10,
    "has_next": true,
    "has_prev": true
  }
}
```

---

