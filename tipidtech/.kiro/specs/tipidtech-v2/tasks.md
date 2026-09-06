# TipidTech V2 — Implementation Tasks

## Phase 1: Supabase Project Setup
- Create a new Supabase project at supabase.com
- In Supabase SQL editor, create the budgets table using the schema in the Design doc
- In Supabase SQL editor, create the expenses table using the schema in the Design doc
- Enable Row Level Security on both tables
- Add RLS policies: SELECT, INSERT, UPDATE, DELETE allowed where auth.uid() = user_id
- Copy the Project URL and anon public key from Supabase → Settings → API
- Add to .env file: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Add .env to .gitignore if not already there
- Add the same env vars to Vercel project settings (Environment Variables)

## Phase 2: Install Dependencies
- npm install @supabase/supabase-js
- npm install recharts
- npm install react-router-dom

## Phase 3: Supabase Client + Storage Utility
- Create src/utils/supabase.js — initialize and export the Supabase client using env vars
- Create src/utils/storage.js — implement all the query functions listed in the Design doc
  (getBudget, saveBudget, addExpense, getRecentExpenses, getAllExpenses,
   getExpensesByDate, getExpensesByWeek, getTotalExpenses)
- Keep the existing calculations.js and constants.js unchanged

## Phase 4: Routing
- Install and configure React Router v6
- Wrap App in BrowserRouter
- Define routes: /, /login, /dashboard, /history, /reports
- Create a ProtectedRoute component that checks session and redirects to /login if none

## Phase 5: Authentication Screen
- Create src/components/AuthScreen.jsx
- Build login form: email + password + Login button
- Build register form: email + password + confirm password + Register button
- Add a toggle link between the two modes ("Don't have an account? Register" / "Already have an account? Login")
- Wire login button to supabase.auth.signInWithPassword()
- Wire register button to supabase.auth.signUp()
- Display error messages returned by Supabase (invalid credentials, email already used, etc.)
- On success: auth state listener in App.jsx will handle redirect automatically

## Phase 6: App-level Auth State
- In App.jsx, on mount call supabase.auth.getSession() to get current session
- Subscribe to supabase.auth.onAuthStateChange() and update session state
- Pass session/user down to components that need it, or use React context
- Add logout button to Dashboard header that calls supabase.auth.signOut()
- Show the logged-in user's email in the header or nav area

## Phase 7: Migrate Budget and Expense Data to Supabase
- In SetupScreen.jsx / BudgetScreen.jsx: replace the localStorage save call with saveBudget()
- On app load (when session exists): call getBudget(userId) instead of reading localStorage
- If getBudget returns null: show SetupScreen (no active budget)
- In AddExpenseForm.jsx: replace localStorage expense append with addExpense()
- In Dashboard.jsx: replace localStorage expense read with getRecentExpenses()
- Remove all remaining localStorage reads/writes for budget and expense data
  (localStorage is no longer the source of truth)

## Phase 8: Improved Warning Message in AddExpenseForm
- Before submission, compute:
    newTotal = currentTotalExpenses + newExpenseAmount
    newRemainingBalance = allowance - newTotal
    newDailyAmount = newRemainingBalance / daysRemaining
    currentDailyAmount = currentRemainingBalance / daysRemaining
    originalDailyAmount = allowance / totalDays
    currentStatusRatio = currentDailyAmount / originalDailyAmount
    newStatusRatio = newDailyAmount / originalDailyAmount
- Determine current status and new status from the ratio thresholds (same as V1)
- If status would worsen, show the warning with:
    - The expense amount being added
    - The current remaining balance and what it would become
    - The current available daily amount and what it would become
    - Current status label and new status label
- If newTotal > allowance, additionally show:
    "This expense would put you ₱[newTotal - allowance] over your total allowance."
- Keep the "Add Expense Anyway" and "Cancel" buttons

## Phase 9: Pie Chart on Dashboard
- Create src/components/PieChart.jsx
- Add two toggle buttons: "Today" and "This Week"
- On toggle change, fetch expenses using getExpensesByDate() or getExpensesByWeek()
- Group fetched expenses by category in JavaScript:
    const grouped = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
    const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }))
- Pass chartData to a Recharts <PieChart> with a <Pie> and <Legend>
- If chartData is empty, render: "No expenses recorded for this period."
- Add the PieChart component to Dashboard.jsx below the existing summary section

## Phase 10: History Screen
- Create src/components/HistoryScreen.jsx
- On mount, call getAllExpenses(userId)
- Display expenses in a list, newest first
- Each item: formatted date (e.g., Sep 5, 2026), formatted time (e.g., 2:30 PM), category, note, amount
- Add a "← Back to Dashboard" link
- Add the /history route in App.jsx pointing to HistoryScreen
- Add a "View History" link or button on the Dashboard

## Phase 11: Reports Screen
- Create src/components/ReportsScreen.jsx
- Add two tabs: "Daily" and "Weekly"

  Daily tab:
  - Add a date input (type="date") defaulting to today
  - On date change or on mount, call getExpensesByDate(userId, selectedDate)
  - List expenses: time, category, note, amount
  - Show day total at the bottom: "Total: ₱[X]"
  - If empty: "No expenses on this date."

  Weekly tab:
  - On mount, compute Monday and Sunday of the current week
  - Call getExpensesByWeek(userId, weekStart, weekEnd)
  - Group results by date in JavaScript
  - For each day (Mon–Sun): show day header, list expenses, and a day subtotal
    Skip days with no expenses or show "No expenses" for that day
  - Show overall weekly total at the bottom: "Week Total: ₱[X]"
  - If no expenses at all: "No expenses this week yet."

- Add the /reports route in App.jsx
- Add a "Reports" link or button on the Dashboard

## Phase 12: Navigation
- Add a simple nav bar or header to Dashboard with links to: Dashboard, History, Reports
- Add a Logout button to the header
- Make sure the Back button on History and Reports returns to Dashboard

## Phase 13: Testing
- [ ] Create two dummy test accounts in Supabase Authentication dashboard
      (or via the register screen) to use for testing:
      e.g. test1@tipidtech.com and test2@tipidtech.com
      - [ ] Use test1 for all feature testing
      - [ ] Use test2 exclusively for RLS isolation testing
            (verify test2 cannot see test1's data)
- Test register → login → logout → redirect to login flow
- Test that after login, existing budget loads correctly from Supabase
- Test that adding an expense saves to Supabase and appears in the dashboard list
- Test that the warning shows correct numbers before an expense is added
- Test the over-allowance warning when total spending would exceed the allowance
- Test the pie chart with: no expenses, one category, multiple categories
- Test the Daily report: correct expenses for selected date, correct total
- Test the Weekly report: correct grouping, correct subtotals, correct week total
- Test the History screen: all expenses appear newest first
- Test RLS: register two accounts, confirm each user only sees their own data
- Deploy to Vercel with env vars set, confirm production works end to end

## Phase 14: Savings Goals

- [ ] In Supabase SQL editor, create the savings_goals table using the schema above
- [ ] Create the savings_contributions table using the schema above
- [ ] Enable RLS on both tables with policy: auth.uid() = user_id

- [ ] Add savings calculation functions to calculations.js:
      dailyRequired, weeklyRequired, progressPercentage, isCompleted

- [ ] Add savings storage functions to storage.js:
      getSavingsGoals, createSavingsGoal, addContribution,
      getContributions, getTotalSaved, markGoalCompleted

- [ ] Create SavingsGoalForm.jsx
      - Fields: name, target amount, duration dropdown
      - Live preview of daily/weekly required amounts as user fills the form
      - On submit: compute duration_days, call createSavingsGoal(), reset form

- [ ] Create SavingsGoalCard.jsx
      - Display: name, target, progress bar, saved so far, %, daily/weekly required
      - Progress bar width driven by progressPercentage (CSS inline style or class)
      - Add Contribution inline form: amount + note → calls addContribution()
      - After contribution: re-fetch getTotalSaved() and update the card
      - If isCompleted: hide contribution form, show ✅ Completed label
      - On each contribution check if isCompleted → call markGoalCompleted() if true

- [ ] Create SavingsScreen.jsx
      - On mount: call getSavingsGoals(userId)
      - Render active goals first, completed goals at the bottom (can use is_completed flag)
      - "Add New Goal" button that shows/hides SavingsGoalForm
      - Back to Dashboard link

- [ ] Add /savings route in App.jsx pointing to SavingsScreen

- [ ] Update Dashboard.jsx
      - On mount: call getSavingsGoals(userId), filter to active goals only
      - Render each active goal as a SavingsGoalCard
      - Show "No savings goals yet. Add one to start saving!" if none
      - Add "See All Goals" link → navigates to /savings

- [ ] Add "Savings Goals" to the nav header

- [ ] Test: create a goal → verify daily/weekly amounts are correct
- [ ] Test: add contributions → verify progress bar and percentage update
- [ ] Test: reach 100% → verify goal is marked completed and card updates
- [ ] Test: multiple goals → verify all show on dashboard and savings screen
- [ ] Test: completed goals appear below active goals in SavingsScreen

## Phase 15: UI Restyle (Tailwind)
- [ ] Install Tailwind CSS and configure it for Vite
- [ ] Remove plain CSS files one by one, replacing with Tailwind utility classes
- [ ] Start with shared/layout components (nav, header, buttons) then move to screens
- [ ] Verify each screen visually after restyling before moving to the next
- [ ] Do not change any logic, calculations, or Supabase queries during this phase —
      styling only