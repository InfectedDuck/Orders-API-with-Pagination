# Module 7 — Practical Task 4  
## AI Assistant Report — Orders API (refactor & hardening)

**Student:** Toktar Kametay  

---

## Submission summary

| Field | Value |
|-------|-------|
| **GitHub — Pull Request** | Paste your merged PR URL here after push (example: `https://github.com/<user>/<repo>/pull/<n>`) |
| **Tool** | Cursor (Chat + Composer) |
| **Project folder** | `task_4` (branch to merge into Task 3 repository `main`) |
| **Tests** | 25 total — **10** focused on list pagination + filtering (`describe` blocks *Pagination* and *Filtering*), remainder CRUD / misc |
| **Coverage** (last run) | ~87% statements / ~88% lines (Jest, `npm run test:coverage`) |
| **Linter** | `npm run lint` — `node --check` on listed JS files (no syntax errors) |

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

Typical coverage summary (approximate): **All files ~87% statements**; all **25** tests passing.

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

**Overall AI-assisted share:** ~**70%** (scaffolding + decomposition + doc draft); **30%** verification, test alignment, and PR/Git steps.

### Suggestions (rough)

| Metric | Estimate |
|--------|-----------|
| Suggestions shown | ~35–45 |
| Accepted as-is | ~40% |
| Accepted with edits | ~35% |
| Rejected | ~25% |

### Time (rough)

| Step | Without AI (guess) | With AI |
|------|---------------------|---------|
| Plan + split modules | ~25 min | ~10 min |
| Implement + wire routes/db | ~45 min | ~20 min |
| Tests green + coverage | ~25 min | ~15 min |
| README + lint script | ~20 min | ~10 min |
| **Total** | **~1.9 h** | **~0.9 h** |

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

## Pull request checklist

1. **Base:** Task 3 repository default branch (`main`), matching **`Orders-API-with-Pagination`** content.  
2. **Compare:** branch containing this **`task_4`** tree (e.g. `feature/task-4-refactor`).  
3. Merge when green; paste **PR URL** into the table at the top of this file for upload.

---

## How to run

```bash
npm install
npm run seed
npm start
```

Server: `http://localhost:3000` — API under `/api/orders`, health at `/health`.
