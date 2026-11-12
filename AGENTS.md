# AGENTS.md — TipidTech

Read this file in full before every task. Also read `DESIGN.md` before touching any UI, and the matching section of `docs/REVISION_HANDOFF.md` before building any feature from it.

## 1. What this is

TipidTech is a budget and expense tracker for Filipino students. The core idea is **PLAN → TRACK → UNDERSTAND**: the student sets an allowance and period, logs expenses, and sees whether they're on pace (Green / Yellow / Red).

It is a **decision-support prototype**. It warns, it never blocks, and its thresholds and percentages are prototype guesses, not financial advice.

- Live (main): https://tipidtech.vercel.app
- Demo (v1-demo branch, separate Supabase project): https://tipid-tech-demo.vercel.app

## 2. Stack (verify in `tipidtech/package.json` if in doubt)

- React 18 + Vite 5, **JavaScript only (no TypeScript)**
- Tailwind CSS **v4** via `@tailwindcss/vite`. Tokens live in `@theme` in `src/index.css`. There is no `tailwind.config.js`.
- `react-router-dom` v7 package, used with v6-style `<Routes>/<Route>` API
- Supabase (`@supabase/supabase-js`). The browser talks to Supabase directly, so **RLS is the only security layer**.
- `recharts` for charts, `lucide-react` for icons
- Deployed on Vercel (`vercel.json` handles SPA rewrites)

Do not add any dependency without asking first (see §5).

## 3. Repo layout

The app lives in the **`tipidtech/` subfolder**, not the repo root. Run all commands from there.

```
tipid-tech/
├─ AGENTS.md, CLAUDE.md, DESIGN.md      ← agent instructions (this)
├─ docs/REVISION_HANDOFF.md             ← the team's feature specs
└─ tipidtech/
   ├─ index.html                        ← inline pre-paint script (text size; theme later)
   ├─ src/
   │  ├─ main.jsx, App.jsx              ← App.jsx owns session, routes, budgetId
   │  ├─ index.css                      ← Tailwind import, @theme tokens, root font scaling
   │  ├─ components/                    ← screens + feature components (one file each)
   │  │  └─ ui/                         ← shared primitives: Card, Modal, PageContainer,
   │  │                                    SectionHeader, StatCard, SegmentedControl, OptionGroup
   │  └─ utils/
   │     ├─ calculations.js             ← ALL budget/status math (pure functions)
   │     ├─ storage.js                  ← ALL Supabase queries
   │     ├─ constants.js                ← categories, percentages, thresholds, STATUS keys
   │     ├─ textSize.js                 ← text-size preference (localStorage + <html> attr)
   │     ├─ supabase.js                 ← client init (env vars)
   │     └─ localStorage.js             ← LEGACY, unused. Don't import it, don't delete without asking.
   └─ .kiro/                            ← OLD Kiro specs/steering. Out of date; see §4.
```

Commands (in `tipidtech/`):
- `npm run dev` — local dev server
- `npm run build` — **must pass before you say a task is done**
- There are **no tests and no linter**. Verify logic changes with hand-calculated examples (see §8).

Never edit `dist/` or `node_modules/`.

## 4. Sources of truth (in priority order)

1. The user's current instruction
2. `AGENTS.md` and `DESIGN.md`
3. `docs/REVISION_HANDOFF.md` (feature specs, done-criteria)
4. The actual code — always check it before assuming something exists or is missing
5. `tipidtech/.kiro/**` — **historical only.** Its steering says "no Tailwind" and "Router v6"; both are outdated. Ignore any rule there that conflicts with this file.

If the handoff and the code disagree, trust the code for *what exists* and the handoff for *what should be built*, and tell the user about the mismatch.

## 5. Stop-and-ask gate

Stop, explain, and wait for a yes before you:

- add a **dependency** (npm package, font, chart library, anything)
- add a **Supabase table, column, RPC, or policy change**
- add a **route** in `App.jsx`
- add a new file in `src/utils/`
- change `calculations.js` behavior (not just add a new function)
- change how an existing screen looks, outside the scope of the current task
- delete files, rename exported functions, or do a large refactor

New component files in `src/components/` for the feature you're building are fine without asking.

When a DB change is approved: write the SQL (table + RLS enable + policies scoped to `auth.uid()`) in a fenced block for the user to run in the Supabase SQL editor. There is no migrations folder. Also save it as `docs/sql/<yyyy-mm-dd>-<name>.sql` so it's tracked. Remember **v1-demo uses a separate Supabase project** — say if the SQL needs running there too.

## 6. Architecture rules

- **Budget math lives in `calculations.js`** as pure functions. Extend it; don't rewrite existing functions. Components never compute status themselves.
- **Database calls live in `storage.js`.** Components never import `supabase` directly.
- Existing tables: `budgets`, `expenses`, `savings_goals`, `savings_contributions`, `profiles` (has `is_admin`), `login_logs`. RPCs: `get_admin_metrics`, `get_user_login_history`.
- **Dates:** every "which day?" key comes from `toLocalDateKey()` in `calculations.js`. Never use `toISOString().slice(0, 10)` or `created_at.slice(0, 10)`, which give the UTC day. Day queries in `storage.js` use `[local midnight, next local midnight)`. A budget's `end_date` is the first day of the next period; it resets when local today `>= end_date`.
- Every expense has a `budget_id` (period isolation). Queries for "this period" filter by it.
- `App.jsx` owns `budgetId` state and uses it as the Dashboard remount key. `Dashboard.jsx` fetches its own budget — don't pass budget data down as props.
- `saveBudget()` returns the saved row; use that return value for the id.
- Device-first preferences (text size, theme, guide-seen, notification read state) go in `localStorage` through a small dedicated module like `textSize.js`, with a pre-paint script in `index.html` when it affects visuals. Keys use the `tipidtech-` prefix. Saving any of them to the account needs a `profiles` column → §5.
- Static content (Learn reading list, notification message text) goes in data files / `constants.js`, not the DB.

## 7. Product rules (never break these)

1. **Warn, never block.** A warning can say an expense pushes the user to Yellow; the save still goes through.
2. **Expense logging stays low-friction.** Don't add steps, fields, or confirmations to Add Expense. No pop-ups on the Add Expense screen.
3. The budget's **Savings category** and **Savings Goals** are separate. Never link, sum, or reference one from the other.
4. **Reports and History charts use calendar time** (weeks Mon–Sun, calendar months). **Budgets use the allowance period.** Never put a budget line on a calendar chart.
5. Green/Yellow/Red cutoffs (0.80 / 0.50 in `STATUS_THRESHOLDS`) and `SUGGESTED_PERCENTAGES` are **prototype guides**. Never call them validated, proven, or professional advice. Learning and status content carries a "general guidance, not professional financial advice" note.
6. **Status = icon + word + color, always.** Status colors never change with theme. See DESIGN.md §3.
7. Group expenses by the **user's local date**, not UTC. A 11pm expense must not land on the next day.
8. Include the **Other** category in totals.
9. Pop-ups and reminders: dismissible, never blocking, one at a time, in-app only.
10. **No franchise material** anywhere: no Barbie/Marvel/Avatar-type names, logos, characters, or signature fonts. Reference screenshots are layout inspiration only. Don't copy other apps' colors, icons, or branding.
11. Only claim what's true on the About page (no "bank-level security", no "proven").

## 8. How to work a task

1. **Branch.** One branch per feature, off `main`: `feat/<handoff-id>-<slug>`, e.g. `feat/1.6-learn-read`. Never commit to `main` directly. Never merge or push unless asked.
2. **Read** the handoff section, `DESIGN.md`, and every file you'll touch.
3. **Plan first.** Before editing, post a short plan: files to create/change, any §5 flags, open questions. Wait for a go-ahead on anything Medium or bigger.
4. **Implement in small steps.** Reuse `ui/` primitives. Keep diffs focused on the task.
5. **Verify:**
   - `npm run build` passes
   - Logic: write out 2–3 hand-calculated examples (incl. edge cases: zero spend, period boundary, month/year rollover, late-night expense) and show they match
   - UI: run through the QA checklist in DESIGN.md §10 and say which items you checked and which need the user's real phone
6. **Report:** what changed (file list), how to test it, anything you flagged or skipped. Check off the handoff's "Done when" items one by one.
7. **Commit** with a clear message once the user is happy, e.g. `feat(1.6): Learn page with Read tab`.

If something is ambiguous, ask one specific question rather than guessing. If you spot a bug outside your task, mention it; don't fix it silently.


### Ponytail
Ponytail is installed. "Least code" never overrides this file: still plan first, still reuse ui/ components, and never skip accessibility (icon + word + color, 4.5:1 contrast, 44px tap targets), the QA checklist, or the stop-and-ask gate.

## 9. Current status (update this section as work lands)

Branch `responsive-foundation` (merged into `main` on 2026-11-12):
- [x] 1.1 Logo fix
- [x] Responsive foundation: `ui/` primitives, modals as bottom sheets (R3a), shared `ExpenseRow`
- [x] R3b History/Reports mobile pass. Original group list was lost; scope as done: Reports lists moved into flush cards (`DayCard`, `isLast`) so rows aren't double-padded, each tab's controls in its own Card, Filter buttons 44px tall, date inputs use the DESIGN §7 input pattern, History edit in Custom Range now refreshes the range results
- [x] Local-date fix (merged from `fix/local-date-grouping`): History, Reports, pie chart "Today", budget start/end dates, savings goal start date all use the local day. **Deploy step:** run `docs/sql/2026-11-11-budget-end-date-plus-one.sql` once on both Supabase projects (main and v1-demo) when this reaches production
- [x] R4 responsive QA (`fix/r4-responsive-qa`): automated pass over 16 screens/states × 320/360/390/768 × Normal/Large/XL — no sideways scroll, nothing cut off, all tap targets ≥44px. Fixed: pie legend overlapping the ring (legend is now an HTML list), scroll reset on page change, Dashboard expense rows double padding + date under edit button, tap targets, `text-gray-400` contrast, "/day" wrapping, reload of a protected page redirecting to `/dashboard` (route guards now wait for `authChecked`). Also on this branch: Dashboard no longer flashes the full allowance before expenses load, and Budget Categories bars count the whole period (they only counted the 5 most recent expenses). Still needs: real-phone check (iPhone input zoom, Safari/Chrome hyphenation of "Transportation" at 320px XL)
- [x] Merge `responsive-foundation` to `main`
- [x] 1.2 Text size setting (Normal / Large / XL) — implemented (`textSize.js`, `index.css`, `index.html` script, control in `AppLayout`); still needs QA against its done-criteria

Next up, in order (see handoff for specs; every item is Confirmed by the team):
- Release 1: 1.3 First-time guide · 1.4 Feature labels · 1.5 About page *(new route)* · 1.6 Learn/Read *(new route, book icon)*
- Release 2: 2.1 Notification bell · 2.2 Reminder card · 2.3 Theme system (step 1 palette tokens, step 2 gallery) · 2.4 History bar chart
- Release 3: 3.1 Add money mid-period *(new table)*

**Open decisions:** handoff Section 6 is missing from the doc. Ask the user before deciding: History chart style, the dashboard "latest message" line, per-category budget comparison on This Period view.

## 10. Known issues (don't fix unless asked)

- `ExpensePieChart.jsx` category colors use greens (`#80ed99`, `#57cc99`, `#74c69d`) and a red-orange (`#e76f51`) that clash with status colors. Fix during 2.3/2.4 (see DESIGN.md §4).
- The brand color is a green (`#80ed99`). It is **not** a status color; keep the two visually distinct.
- `constants.js` still has a legacy `STORAGE_KEY = 'tipidtech_data'` from the localStorage era.
