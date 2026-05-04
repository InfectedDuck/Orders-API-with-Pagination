# Module 7 — Practical Task 4  
## AI Assistant Report — Orders API (refactor & hardening)

**Student:** Toktar Kametay  

---

## Submission summary

| Field | Value |
|-------|-------|
| **Repository** | [github.com/InfectedDuck/Orders-API-with-Pagination](https://github.com/InfectedDuck/Orders-API-with-Pagination) |
| **Pull Request** | **#1 — Refactor #1** — merged (**`cursor`** → **`master`**) |
| **PR (conversation)** | [github.com/InfectedDuck/Orders-API-with-Pagination/pull/1](https://github.com/InfectedDuck/Orders-API-with-Pagination/pull/1) |
| **PR (Files changed)** | [github.com/InfectedDuck/Orders-API-with-Pagination/pull/1/changes](https://github.com/InfectedDuck/Orders-API-with-Pagination/pull/1/changes) |
| **PR diff size** | **+524 / −469** lines across **13 files** (updates to existing files plus new modules) |
| **Tool** | Cursor (Chat + Composer) |
| **Tests** | 25 total — **10** focused on list pagination + filtering (`describe` blocks *Pagination* and *Filtering*), remainder CRUD / misc |
| **Coverage** (last run) | About 87% statements / about 88% lines (Jest, `npm run test:coverage`) |
| **Linter** | `npm run lint` — `node --check` on listed JS files (no syntax errors) |

---

## Merged PR — files touched

| Area | Files |
|------|--------|
| **New** | `src/constants.js`, `src/orderBodyValidation.js`, `src/orderListParams.js` |
| **Updated** | `src/app.js`, `src/database.js`, `src/routes.js`, `src/seed.js`, `src/server.js`, `tests/orders.test.js`, `package.json`, `package-lock.json`, `README.md` |
| **Report** | `Module7_PT4_Toktar_Kametay.md` — submit with the platform upload; keep the same file at the **repository root** next to `README.md` when possible |

**Example structural tweak:** `src/app.js` — `createApp(db)` renamed to `createApp(database)` for clearer injection naming; JSDoc/comment block tightened to match the slimmer style after refactor.

---

## How this connects to Task 3

**Task 3** asked for a full Orders API **with pagination and filtering**, accelerated with **GitHub Copilot**. The delivered baseline lives in the **`Orders-API-with-Pagination`** snapshot: Express routes with inline parsing/validation and a single `database.query()` body.

**Task 4** does **not** duplicate “Greenfield pagination from zero.” It ships a **production-style iteration**: same REST contracts (`GET /api/orders` shape, query params, status codes), but **clearer structure**, **shared validation**, **`npm run lint`**, and documentation oriented toward reviewers — implemented with **Cursor** and merged via **Pull Request**.

That distinction matches both assignment narratives: Copilot-first scaffold (PT3) → Cursor-assisted refactor + hygiene (PT4).

---

## Deliverables vs Task 4 rubric

| Rubric item | Evidence |
|-------------|----------|
| **PR — pagination / filtering** | Behavior unchanged: `page` default 1, `limit` default 10, **max 100**, filters **status**, **min/max amount**, **start/end date**, validated queries |
| **Offset + metadata** | `database.query()` computes filtered total; slice pagination; response `{ data, pagination }` with `total_pages`, `has_next`, `has_prev` |
| **Linter** | `package.json` script `lint` |
| **Tests** | Defaults, custom page/limit, page beyond total (empty list), limit cap, filters, invalid status / invalid `min_amount`, combined filters — plus CRUD |
| **Docs** | `README.md` — setup, delta vs PT3, curl-style usage, response shape |
| **Report** | This document |

---

## What changed in code (Cursor refactor vs Copilot baseline)

New modules:

- **`src/constants.js`** — `ORDER_STATUSES`, allowed sort fields, pagination caps (single source of truth).
- **`src/orderListParams.js`** — `parseOrderListQuery()` centralizes GET `/orders` parsing and 400 responses.
- **`src/orderBodyValidation.js`** — shared create/patch validation for POST and PUT.

Updated modules:

- **`src/routes.js`** — thin handlers calling the helpers above.
- **`src/database.js`** — list path split into `_filterRows`, `_sortRows`, then paginated slice (same semantics as before).
- **`package.json`** — `lint` script.
- **`README.md`** — PT3 vs PT4 comparison and PR instructions.

**HTTP compatibility:** Clients calling PT3 URLs and query strings should see the same successful responses and error patterns as before (filters still expressed as `start_date` / `end_date`, not a single `dateRange` parameter — equivalent to the brief’s “date range” requirement).

---

## Test run (reference)

```bash
cd task_4
npm install
npm test
npm run test:coverage
npm run lint
```

Typical coverage summary (approximate): **All files about 87% statements**; all **25** tests passing.

---

## AI Assistant Report (core)

### Tool and modes

| Mode | Use |
|------|-----|
| **Chat** | Map PT3 file layout; define refactor steps (constants → parsers → routes slim-down); align README with rubric |
| **Composer / edit** | Apply multi-file edits (`constants.js`, `orderListParams.js`, `orderBodyValidation.js`, `routes.js`, `database.js`, `package.json`) |

### Contribution split (estimate)

| Area | Mostly assistant | Mostly manual |
|------|------------------|----------------|
| File layout & boilerplate for new modules | Yes | |
| Naming / exports / exact error strings to match existing tests | Partial | Yes |
| README “PT3 vs PT4” table & submission wording | Draft | Edited |
| Running tests, fixing mismatches after refactor | — | Yes |

**Overall AI-assisted share:** **About 70%** (scaffolding + decomposition + doc draft); **about 30%** verification, test alignment, and PR/Git steps.

### Suggestions (rough estimates — plain text for PDF/Word export)

Cursor does not export exact acceptance counts. Percentages below are approximate.

| Metric | Estimate |
|--------|-----------|
| Suggestions shown | Between about 35 and 45 |
| Accepted unchanged | About 40% |
| Accepted after edits | About 35% |
| Rejected | About 25% |

### Time (rough)

| Step | Without AI (guess) | With AI |
|------|---------------------|---------|
| Plan + split modules | About 25 min | About 10 min |
| Implement + wire routes/db | About 45 min | About 20 min |
| Tests green + coverage | About 25 min | About 15 min |
| README + lint script | About 20 min | About 10 min |
| **Total** | **About 1.9 h** | **About 0.9 h** |

### What I fixed manually after the first Cursor pass

- Ensured **pagination clamps** match PT3 behavior (`page` / `limit` edge cases).
- Kept **filter error messages** compatible with expectations (`Invalid status`, numeric amount errors).
- Confirmed **DELETE + GET** flow still passes integration-style tests.
- **Windows-safe** `lint` — explicit file list instead of shell globs.

### Three learnings

1. **Copilot-era single-file routes are fast to ship**; splitting list parsing into **`parseOrderListQuery`** makes regressions easier to spot when rubrics demand many query combinations.
2. **AI “security review” for SQL injection** was mostly irrelevant here (JSON store); the real footgun was **dynamic sort keys** — the whitelist in **`constants.js`** is the durable fix.
3. **Task overlap is normal:** PT3 already required pagination; PT4 value is **tool change + PR + quality bar** (lint, structure, narrative), not pretending the feature never existed.

---

## Pull request status

**Completed.** Branch **`cursor`** merged into **`master`** ([PR #1](https://github.com/InfectedDuck/Orders-API-with-Pagination/pull/1)).

---

## How to run

```bash
npm install
npm run seed
npm start
```

Server: `http://localhost:3000` — API under `/api/orders`, health at `/health`.
