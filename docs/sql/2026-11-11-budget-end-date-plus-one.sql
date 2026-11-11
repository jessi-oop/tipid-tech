-- 2026-11-11 — one-off data fix for fix/local-date-grouping
-- Run ONCE on BOTH Supabase projects (main and v1-demo), right when the fix deploys.
--
-- calcEndDate in App.jsx used toISOString(), which saved every non-'date'
-- budget's end_date one day early in PH (UTC+8). The fix saves end_date as the
-- first day of the next period and resets when local today >= end_date.
-- Bump active rows so in-flight budgets don't end a day early.
-- 'date' budgets store next_allowance_date directly and were never affected.

update budgets
set end_date = end_date + 1
where period <> 'date'
  and end_date >= current_date;
