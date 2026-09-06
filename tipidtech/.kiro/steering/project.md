---
inclusion: always
---

# TipidTech Project Rules

## Stack
- React + Vite, JavaScript only — no TypeScript
- Plain CSS only — no Tailwind, no CSS frameworks (until Phase 15)
- Supabase for auth and database
- Recharts for charts
- React Router v6 for routing
- Do not introduce libraries not listed above without explicit approval

## Architecture Rules
- calculations.js contains all budget and status logic — extend it, never rewrite it
- storage.js handles all Supabase queries — localStorage is no longer used
- RLS must be active on all Supabase tables at all times and must be verified before any testing begins
- Do not expand scope beyond what is in the spec
- Do not silently introduce new files, folders, or dependencies without explicit approval
- Dashboard.jsx fetches its own budget from Supabase directly — 
  do not pass budget data as props from App.jsx to Dashboard
- App.jsx owns budgetId state (uuid from Supabase) used as Dashboard remount key
- saveBudget() returns the saved row — always use the return value to get the budget id

## Important Concept Separations
- The Savings budget category (15% allocation in the budget setup) and the Savings Goals feature are completely separate — do not link, reference, or combine them in any way
- Daily/Weekly reports are based on calendar dates, not the user's chosen budget period (daily/weekly/monthly)
- The budget period the user sets up during onboarding is a separate concept from calendar-based reporting

## Product Rules
- TipidTech is a decision-support tool — it warns users but never hard-blocks spending
- The core concept is PLAN → TRACK → UNDERSTAND — preserve this in all features
- Do not present budget percentages or status thresholds as professionally validated or scientifically proven

## Design Rules
- Keep the UI minimalistic and clean
- Do not redesign or modify existing screens unless explicitly asked
- Phase 15 will migrate all styling to Tailwind — do not add new complex plain CSS that would be hard to replace

## Phase 15 Note
- Phase 15 is a styling-only phase — no logic, calculations, or Supabase queries should be touched during it