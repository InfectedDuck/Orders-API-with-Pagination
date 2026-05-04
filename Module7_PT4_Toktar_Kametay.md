# Refactoring the Orders API with Cursor (pagination & filters)

**Student:** Toktar Kametay

## Overview

Module 7 Task 4 asked for pagination and filtering on **`GET /api/orders`**, documented with an AI-assisted workflow and a merged PR. In my repo that behavior was already there after Task 3 (Copilot build). Task 4 for me meant a **production-style pass**: split shared validation and constants out of chunky route files, wire up **`npm run lint`**, refresh docs where needed, and land the work behind a **pull request** using **Cursor** (Chat + Composer). The HTTP contract for clients stayed the same—same query params and response shape—including **`page`**, **`limit`** (defaults and max **100**), **`status`**, amount range, date range, and pagination metadata (**`total`**, **`total_pages`**, **`has_next`**, **`has_prev`**, etc.).

---

## 1. Repository and pull request

| | |
|--|--|
| **Repository** | [github.com/InfectedDuck/Orders-API-with-Pagination](https://github.com/InfectedDuck/Orders-API-with-Pagination) |
| **Pull request** | [#1](https://github.com/InfectedDuck/Orders-API-with-Pagination/pull/1) merged (`cursor` → `master`) |

---

## 2. What changed in the codebase

Cursor helped me carve out clearer modules instead of rewriting features from scratch:

| File | Role |
|------|------|
| `src/constants.js` | Status list, pagination cap, allowed sort columns |
| `src/orderListParams.js` | Parses and validates list query params, returns 400s where needed |
| `src/orderBodyValidation.js` | Shared POST/PUT body validation |

I also touched **`app.js`**, **`database.js`**, **`routes.js`**, **`seed.js`**, **`server.js`**, **`tests/orders.test.js`**, **`package.json`**, and **`README.md`**. **`routes.js`** got thinner; the list path still does filter → sort → paginated slice in **`database.js`**.

**Tests:** I kept **25** Jest tests green; **10** of them exercise list pagination and filtering. Last coverage run stayed around **87% / 88%** statements/lines—you can rerun with **`npm run test:coverage`**.

---

## 3. How I used Cursor

### Tool and modes

| | |
|--|--|
| **Tool** | **Cursor** |
| **Chat** | Mapping the Task 3 file layout and planning where `constants`, parsers, and route changes should live; README wording drafts |
| **Composer** | Applying edits across several files after I described what to extract |

Overall I estimate **~70% Cursor-assisted** versus **~30% my own time** rerunning tests, fixing broken imports/strings, Git/PR steps, and the Windows-friendly lint setup.

---

## 4. Metrics

Cursor doesn't publish a perfect export of every suggestion, so these are honest estimates for the Task 4 refactor only:

| | Estimate |
|--|----------|
| Completions shown | About **35–45** |
| Accepted as written | About **40%** |
| Accepted after I edited | About **35%** |
| Rejected / ignored | About **25%** |

**Time (Task 4 scope only—not building the API from scratch):**

| | Estimate |
|--|----------|
| With Cursor | About **55 minutes** |
| Without Cursor for the same refactor (guess) | About **2 hours** |
| Saved (rough) | About **1 hour** |

Task 3 timings are in **`Module7_PT3_Toktar_Kametay.md`**; Task 4 is extra wall-clock after that.

---

## 5. What Cursor drafted vs what I did manually

**Cursor drafted or scaffolded:**

- Initial versions of **`constants.js`**, **`orderListParams.js`**, **`orderBodyValidation.js`**, plus import rewiring  
- First passes on lint script and README tweaks  
- Rough split of handlers after I explained the refactor goal  

**I fixed or finished myself:**

- Pagination clamp and filter **error strings** lined up with what Jest already expected  
- Full test runs until green after moving code between files  
- **Lint**: explicit file list in the npm script so it runs reliably on **Windows** (no fragile shell globs)  
- PR title, sanity check on the diff, merge when it looked right  
- **Sort safety** still boils down to **`sort_by` allow-list**—with JSON storage there's no classic SQL injection, but arbitrary sort keys would still have been sloppy  

---

## 6. Three learnings

**1. Parsing in one module pays off.**

Once list parameters lived in **`parseOrderListQuery`**, regression tests made it obvious when a filter combination broke. That matched how Cursor works best—I gave one clear job per file instead of growing `routes.js` forever.

**2. "Security review" for this stack.**

The risky bit wasn't SQL—it was trusting user-facing sort/filter input without rules. Whitelisting **`sort_by`** stayed the important guard after the refactor.

**3. Task 4 vs Task 3.**

Task 3 was "make it work." Task 4 was "make it reviewable"—lint, structure, PR—while Cursor handled most of the typing once I pointed it at the right targets.
