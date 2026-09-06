# TipidTech V2 — Requirements

## Context
TipidTech V1 is a React + Vite + JavaScript + plain CSS SPA.
It uses browser localStorage only. There is no backend, database, or auth.
V2 adds user accounts, persistent data, reports, analytics, and an improved warning.
The core product concept (PLAN → TRACK → UNDERSTAND) and the minimalistic design
must be preserved.

---

## REQ-01: User Authentication
- Users must be able to register with an email and password
- Users must be able to log in and log out
- All budget and expense data is scoped to the authenticated user
- Unauthenticated users who try to access the dashboard must be redirected to the login screen
- After login, the user is taken to the dashboard (or setup screen if no budget is active)
- Auth state must persist across page refreshes

## REQ-02: Persistent Data Storage
- Budget setup (allowance, period, category allocations, start date) must be saved to the database linked to the user's account
- Every recorded expense must be saved to the database with: amount, category, note, and the date and time it was recorded (created_at)
- The five most recent expenses on the dashboard must be pulled from the database
- Existing localStorage logic must be migrated to Supabase; localStorage is no longer the source of truth

## REQ-03: Expense History
- Users must be able to view a full history of all their recorded expenses, newest first
- Each row must show: date, time, category, note (if any), and amount
- This is a separate view from the dashboard

## REQ-04: Daily Report
- Users must be able to select a date and view all expenses recorded on that date
- The report must show each expense with: time, category, note, and amount
- The report must show a total for the selected day
- The date picker must default to today

## REQ-05: Weekly Report
- Users must be able to view expenses for the current Mon–Sun week
- Expenses must be grouped by day, with a subtotal per day
- The report must show an overall total for the week
- Each expense row must show: time, category, note, and amount

## REQ-06: Analytics Pie Chart on Dashboard
- The dashboard must include a pie chart showing expense breakdown by category
- The chart must have two views the user can toggle between: "Today" and "This Week"
- Category labels and amounts must be visible (in a legend or on hover)
- If there are no expenses for the selected period, show an empty state message instead of a blank chart
- The six existing categories (Food, Transportation, School, Personal, Savings, Emergency) plus Other must each appear if they have spending data

## REQ-07: Clearer Over-Budget / Status Warning Message
- The existing warning (shown when an expense would worsen the spending status) must be updated
  to include specific amounts, not just a status label change
- The warning must clearly state:
    - The new expense amount being added
    - The current remaining balance
    - What the remaining balance would be after adding this expense
    - How much it would worsen the spending pace (current daily amount vs new daily amount)
    - Whether the expense would take the balance negative (i.e., total spending exceeds allowance)
      and by how much
- Example message format:
    "Adding ₱[amount] will change your status from [Green/Yellow] to [Yellow/Red].
     Your remaining balance would drop from ₱[current] to ₱[new].
     Your available daily amount would drop from ₱[current/day] to ₱[new/day]."
- If the expense would make total spending exceed the total allowance, add:
    "This expense would put you ₱[X] over your total allowance."
- The student can still choose Add Expense Anyway (this is a decision-support tool, not a blocker)

## REQ-08: Savings Goals

- Users must be able to create a savings goal by inputting:
    - Goal name (e.g., "Laptop", "New Phone")
    - Target amount (e.g., ₱25,000)
    - Saving duration — chosen from: 1 month, 3 months, 6 months, 1 year,
      or a custom number of months
- The app must calculate and display:
    - How much the user needs to save per day to hit the goal
    - How much the user needs to save per week to hit the goal
    - These are based on: target amount ÷ duration in days or weeks
- Users must be able to log a contribution toward a goal (i.e., "I saved ₱500 today toward my laptop")
    - Each contribution records: amount, optional note, and date/time
- Users must be able to have multiple active savings goals at the same time
- The dashboard must display a progress bar for each active savings goal showing:
    - Goal name and target amount
    - Total saved so far
    - Percentage progress (total saved ÷ target amount × 100)
    - Required daily and weekly saving amount
    - The progress bar fill must reflect the current percentage
- When a goal reaches 100%, mark it as completed and show a completion indicator
- Users must be able to view all goals (active and completed) in a dedicated Savings Goals screen