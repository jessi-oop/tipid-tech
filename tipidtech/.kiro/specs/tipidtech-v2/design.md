# TipidTech V2 — Design

## Stack (unchanged from V1 except additions)
- React + Vite
- JavaScript
- Plain CSS
- Supabase (new): authentication + PostgreSQL database
- Recharts (new): pie chart library

No new frameworks. No TypeScript. No Tailwind. Preserve plain CSS.

---

## Supabase Setup

### Database Schema

Table: budgets
- id             uuid, primary key, default gen_random_uuid()
- user_id        uuid, foreign key → auth.users.id, unique (one active budget per user)
- allowance      numeric(10,2), not null
- period         text, not null  -- 'daily' | 'weekly' | 'monthly' | 'custom'
- total_days     integer, not null
- start_date     date, not null
- next_allowance_date  date, nullable  -- used only when period = 'custom'
- food_budget    numeric(10,2), not null
- transport_budget numeric(10,2), not null
- school_budget  numeric(10,2), not null
- personal_budget numeric(10,2), not null
- savings_budget numeric(10,2), not null
- emergency_budget numeric(10,2), not null
- created_at     timestamptz, default now()
- updated_at     timestamptz, default now()

Table: expenses
- id             uuid, primary key, default gen_random_uuid()
- user_id        uuid, foreign key → auth.users.id
- amount         numeric(10,2), not null
- category       text, not null  -- 'food' | 'transportation' | 'school' | 'personal' | 'savings' | 'emergency' | 'other'
- note           text, nullable
- created_at     timestamptz, default now()

Enable Row Level Security (RLS) on both tables.
RLS Policy (both tables): auth.uid() = user_id
Users can only SELECT, INSERT, UPDATE, DELETE their own rows.

---

## Auth Flow

- Use Supabase Auth (email + password) via @supabase/supabase-js
- Create a supabase.js utility file in src/utils/ that exports the initialized Supabase client
- On app load (App.jsx), call supabase.auth.getSession() to check for an active session
- Store auth state in React state at the App level
- Subscribe to supabase.auth.onAuthStateChange() to react to login/logout events
- If no session: show AuthScreen (login/register)
- If session exists and no active budget: show SetupScreen
- If session exists and budget is active: show Dashboard

---

## New / Modified Components

### New: AuthScreen.jsx
- Two modes: Login and Register (toggle between them on the same screen)
- Login: email + password → supabase.auth.signInWithPassword()
- Register: email + password + confirm password → supabase.auth.signUp()
- Show error messages for wrong password, existing email, etc.
- After successful login or register: App state updates and routes to SetupScreen or Dashboard

### Modified: App.jsx
- Add session state
- Add Supabase auth listener
- Route to AuthScreen, SetupScreen, BudgetScreen, Dashboard, HistoryScreen, or ReportsScreen
  based on session and budget state

### Modified: Dashboard.jsx
- Add pie chart section (see PieChart component)
- Add navigation links to History and Reports
- Add logout button (calls supabase.auth.signOut())
- Load recent 5 expenses from Supabase instead of localStorage

### New: PieChart.jsx
- Uses Recharts PieChart component
- Accepts an array of { name, value } objects (category + total spent)
- Two tabs or toggle buttons: "Today" and "This Week"
- Queries expenses from Supabase filtered by date range
- Groups and sums by category in JavaScript after fetching
- If data is empty, shows: "No expenses recorded for this period."

### New: HistoryScreen.jsx
- Fetches all expenses for the logged-in user, ordered by created_at DESC
- Renders a scrollable list or table
- Each row: formatted date, formatted time, category, note, amount
- Has a Back button to return to Dashboard

### New: ReportsScreen.jsx
- Two tabs: Daily and Weekly

  Daily tab:
  - Date picker input defaulting to today
  - On date change, fetch expenses where created_at::date = selected date
  - List each expense: time, category, note, amount
  - Show day total at the bottom
  - If no expenses: "No expenses on this date."

  Weekly tab:
  - Automatically computes the current week (Monday 00:00 to Sunday 23:59)
  - Fetches all expenses in that range
  - Groups by day in JavaScript
  - For each day: list expenses + day subtotal
  - Show overall weekly total at the bottom
  - If no expenses: "No expenses this week yet."

### Modified: AddExpenseForm.jsx
- Before saving, run the existing status-impact calculation
- If the expense would worsen the status (Green→Yellow, Green→Red, Yellow→Red):
  show the updated warning message with specific amounts (see REQ-07)
- Also check: if (total expenses + new amount) > allowance, show the over-allowance warning line
- Student can still confirm with "Add Expense Anyway"
- On confirm: INSERT into Supabase expenses table

### Modified: utils/localStorage.js → utils/storage.js
- Replace localStorage read/write functions with Supabase queries
- Functions to implement:
  - getBudget(userId) → fetches budget row
  - saveBudget(userId, budgetData) → upserts budget row
  - addExpense(userId, expenseData) → inserts expense row
  - getRecentExpenses(userId, limit=5) → fetches newest N expenses
  - getAllExpenses(userId) → fetches all expenses, newest first
  - getExpensesByDate(userId, date) → fetches expenses for a specific date
  - getExpensesByWeek(userId, weekStart, weekEnd) → fetches expenses for a date range
  - getTotalExpenses(userId) → sum of all expense amounts for user's current budget period

---

## Routing

React Router v6 for client-side navigation.
Routes:
  /           → App root (auth check → redirect)
  /login      → AuthScreen
  /dashboard  → Dashboard (protected)
  /history    → HistoryScreen (protected)
  /reports    → ReportsScreen (protected)

Protected routes: redirect to /login if no active session.

---

## Supabase Queries — Key Examples

// Fetch recent expenses
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5)

// Fetch expenses for today
const today = new Date().toISOString().split('T')[0]
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', `${today}T00:00:00`)
  .lte('created_at', `${today}T23:59:59`)
  .order('created_at', { ascending: false })

// Fetch expenses for current week
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', weekStart.toISOString())
  .lte('created_at', weekEnd.toISOString())
  .order('created_at', { ascending: false })

  ## Architecture Changes (implemented during Phase 7-13 debugging)

- Dashboard.jsx now fetches its own budget directly from Supabase via getBudget(userId)
  It no longer receives allowance, periodType, nextAllowanceDate, startDate, or
  categoryBudgets as props from App.jsx
- Dashboard.jsx owns a local budget state object with shape:
  { id, allowance, periodType, nextAllowanceDate, startDate, categoryBudgets }
- App.jsx owns budgetId state (the Supabase row id of the active budget)
  This is used as part of the Dashboard key to force remount on reset
- App.jsx handleBudgetStart uses the return value of saveBudget() to get the budget id
- App.jsx handleReset calls deleteBudget() then resets budgetId to empty string
- Dashboard key in App.jsx is: key={`${session?.user?.id}-${budgetId}`}

## Savings Goals

### New Database Tables

Table: savings_goals
- id                uuid, primary key, default gen_random_uuid()
- user_id           uuid, foreign key → auth.users.id
- name              text, not null
- target_amount     numeric(10,2), not null
- duration_days     integer, not null  -- computed from chosen duration on creation
- start_date        date, not null, default today
- is_completed      boolean, default false
- created_at        timestamptz, default now()

Table: savings_contributions
- id          uuid, primary key, default gen_random_uuid()
- user_id     uuid, foreign key → auth.users.id
- goal_id     uuid, foreign key → savings_goals.id
- amount      numeric(10,2), not null
- note        text, nullable
- created_at  timestamptz, default now()

Enable RLS on both tables.
RLS Policy (both tables): auth.uid() = user_id

Duration options map to duration_days:
- 1 month  → 30
- 3 months → 90
- 6 months → 180
- 1 year   → 365
- Custom   → user inputs number of months → multiply by 30

---

### Key Calculations (add to calculations.js)

// Required saving rate
dailyRequired  = target_amount / duration_days
weeklyRequired = target_amount / (duration_days / 7)

// Progress
totalSaved         = SUM of contributions for this goal
progressPercentage = Math.min((totalSaved / target_amount) * 100, 100)
isCompleted        = totalSaved >= target_amount

---

### New Components

### New: SavingsGoalForm.jsx
- Form fields: goal name, target amount, duration (dropdown with options above)
- On submit: compute duration_days from chosen option, INSERT into savings_goals
- Show the calculated daily and weekly required amounts as a preview
  before the user submits (update dynamically as they type the amount and pick duration)

### New: SavingsGoalCard.jsx
- Displays one goal:
    - Goal name + target amount
    - Progress bar (CSS width = progressPercentage%)
    - "₱[totalSaved] saved of ₱[targetAmount] ([X]%)"
    - "Save ₱[dailyRequired]/day or ₱[weeklyRequired]/week"
    - If completed: show a ✅ Completed label instead of the bar
- Add Contribution button: opens a small inline form (amount + optional note)
  on confirm → INSERT into savings_contributions, refresh the card

### New: SavingsScreen.jsx
- Lists all savings goals for the user (active first, completed at the bottom)
- Each goal rendered as a SavingsGoalCard
- "Add New Goal" button at the top → opens SavingsGoalForm
- Back button to Dashboard

### Modified: Dashboard.jsx
- Add a Savings Goals section below the pie chart
- Show all active SavingsGoalCards inline
- If no active goals: show "No savings goals yet. Add one to start saving!"
- "See All Goals" link that navigates to SavingsScreen

### New storage functions (add to storage.js)
- getSavingsGoals(userId)              → all goals for user, active first
- createSavingsGoal(userId, goalData)  → INSERT into savings_goals
- addContribution(userId, goalId, contributionData) → INSERT into savings_contributions
- getContributions(goalId)             → all contributions for a goal
- getTotalSaved(goalId)                → SUM of contribution amounts for a goal
- markGoalCompleted(goalId)            → UPDATE is_completed = true

---

### New Route
/savings  → SavingsScreen (protected)
Add "Savings Goals" link to the nav header alongside History and Reports