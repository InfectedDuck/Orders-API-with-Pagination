# Module 7 — Practical Task 4  
**Student:** Toktar Kametay  

**Repository:** https://github.com/InfectedDuck/Orders-API-with-Pagination  
**Pull request:** https://github.com/InfectedDuck/Orders-API-with-Pagination/pull/1 (#1 merged, branch `cursor` → `master`)

**What this task covers for `GET /api/orders`:** The assignment asks for pagination (`page`, `limit` with defaults and a max) and filtering (status, amount range, date range). That behavior was already in place after Task 3. For Task 4 I kept the same contract: query params parsed and validated server-side, list filtered and sorted then paginated, response still returns order rows plus pagination metadata (`total`, `total_pages`, `has_next`, `has_prev`, etc.). The work was restructuring (shared constants and validators, thinner routes), adding a lint script, refreshing the README where needed, and landing everything in a mergeable PR—with Cursor handling most of the heavy typing and file edits.

---

**Tool:** Cursor  

**Modes:** **Chat** for walking the existing layout and planning how to split files and wording. **Composer** for applying changes across multiple files in one pass.

---

**AI contribution:** About **70%** assistant, **30%** me—rough gut feel from the session, not a measured tally.

---

**Metrics**

- **Suggestions:** Cursor doesn’t give exact totals; my estimate is about **35–45** completions shown for this refactor, roughly **40%** accepted as written, **35%** accepted after I edited inline, **25%** rejected or ignored.

- **Time (Task 4 only):** About **55 minutes** with Cursor versus about **2 hours** if I had done the same refactor and polish without it—so roughly **an hour saved** on this slice.

---

**What Cursor mostly drafted or generated**

- New modules (`constants.js`, `orderListParams.js`, `orderBodyValidation.js`) and wiring from routes/database toward those helpers  
- First passes at README tweaks and lint wiring  
- Initial decomposition of route handlers after I described the goal  

**What I did manually**

- Aligning pagination clamps and **error message text** with what the Jest suite already asserts  
- Running the full suite, fixing breakage from imports/moves until everything passed  
- **Lint script:** switched to an explicit list of JS files so it runs cleanly on Windows (no flaky globs)  
- PR hygiene: naming, checking the diff, merge after review on my side  
- **Sort safety:** relying on an allow-listed `sort_by` in `constants.js` (still the main security-sensitive bit with a JSON file store—not SQL injection, but dodging arbitrary sort keys)  
- Awareness that at very large volumes you’d push filtering and paging into a real DB instead of in-memory slices  
