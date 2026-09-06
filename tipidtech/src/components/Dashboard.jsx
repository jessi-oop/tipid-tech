// Dashboard.jsx
// Main tracking view. Loads its own expenses from Supabase.
// Shows: remaining balance, days left, approx daily amount, spending status,
// category progress bars, recent expenses, and the Add Expense form.

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge      from './StatusBadge';
import CategoryBar      from './CategoryBar';
import ExpenseList      from './ExpenseList';
import AddExpenseForm   from './AddExpenseForm';
import ExpensePieChart  from './ExpensePieChart';
import NavHeader        from './NavHeader';

import { CATEGORIES, PERIOD_OPTIONS } from '../utils/constants';
import {
  getRemainingBalance,
  getDaysRemaining,
  getTotalDays,
  getPlannedDailyAmount,
  getCurrentDailyAmount,
  getCategorySpending,
  getOtherSpending,
  getSpendingStatus,
  formatPeso,
} from '../utils/calculations';
import { getRecentExpenses, getTotalExpenses, getBudget } from '../utils/storage';

// Return a human-readable period label, e.g. "Weekly (7 days)"
function getPeriodLabel(periodType, nextAllowanceDate, startDate) {
  if (periodType === 'date') {
    const totalDays = getTotalDays(periodType, nextAllowanceDate, startDate);
    return `Until ${new Date(nextAllowanceDate + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'long', day: 'numeric', year: 'numeric',
    })} (${totalDays} days)`;
  }
  const option = PERIOD_OPTIONS.find((o) => o.key === periodType);
  return option ? option.label : '';
}

export default function Dashboard({
  userId,
  onReset,
  onLogout,
  userEmail,
}) {
  // ── Expense state (loaded from Supabase) ──────────────────────
  const [expenses,        setExpenses]        = useState([]);
  const [totalSpent,      setTotalSpent]      = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [budget, setBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);

  // ─── Load recent expenses + total spent ───────────────────────
  const loadExpenses = useCallback(async () => {
    if (!userId || !budget?.startDate) return;
    try {
      const [recent, total] = await Promise.all([
        getRecentExpenses(userId, 5),
        getTotalExpenses(userId, budget?.startDate),
      ]);
      setExpenses(recent);
      setTotalSpent(total);
    } catch (err) {
      console.error('TipidTech: failed to load expenses', err);
    }
  }, [userId, budget?.startDate]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Add this useEffect below your existing ones
  useEffect(() => {
    if (!userId) return;
    console.log('fetching budget for userId:', userId);
    getBudget(userId)
      .then((row) => {
        console.log('budget row from supabase:', row);
        if (row) {
          setBudget({
            id:                 row.id,
            allowance:          Number(row.allowance),
            periodType:         row.period,
            nextAllowanceDate:  row.next_allowance_date || '',
            startDate:          row.start_date,
            categoryBudgets: {
              food:           Number(row.food_budget),
              transportation: Number(row.transport_budget),
              school:         Number(row.school_budget),
              personal:       Number(row.personal_budget),
              savings:        Number(row.savings_budget),
              emergency:      Number(row.emergency_budget),
            },
          });
        }
      })
      .catch((err) => console.error('TipidTech: failed to load budget', err))
      .finally(() => setBudgetLoading(false));
  }, [userId]);

  // ─── Called by AddExpenseForm after a successful Supabase insert ─
  function handleExpenseAdded() {
    setShowExpenseForm(false);
    loadExpenses(); // refresh the list and total
    setRefreshKey(prev => prev + 1)
  }

  // ─── Calculated values ────────────────────────────────────────
  // Build a lightweight expenses array for calculations.js functions
  // (they expect [{ amount }] — we use totalSpent as a single synthetic entry
  //  so all status math stays correct without loading every expense).
  const expensesForCalc   = totalSpent > 0 ? [{ amount: totalSpent }] : [];


  const remainingBalance  = getRemainingBalance(budget?.allowance, expensesForCalc);
  const daysRemaining     = getDaysRemaining(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const totalDays         = getTotalDays(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const plannedDaily      = getPlannedDailyAmount(budget?.allowance, totalDays);
  const currentDaily      = getCurrentDailyAmount(remainingBalance, daysRemaining);
  const categorySpending  = getCategorySpending(expenses);  // from the 5 recent rows
  const otherSpending     = getOtherSpending(expenses);
  const statusResult      = getSpendingStatus(budget?.allowance, expensesForCalc, budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const periodEnded       = daysRemaining <= 0;
  

  // ─── Reset confirmation ───────────────────────────────────────
  function handleResetClick() {
    if (window.confirm('Reset your budget? This will clear all your data and start over.')) {
      onReset();
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  if (budgetLoading) return <div className="screen">Loading…</div>;
  if (!budget)       return <div className="screen">No budget found.</div>;

  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="screen dashboard-screen">

        {/* ── Top bar — Reset only (nav + logout are in NavHeader) ─ */}
        <div className="dashboard-topbar">
          <span />
          <button className="btn-reset" onClick={handleResetClick}>
            Reset Budget
          </button>
        </div>

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="summary-grid">

        <div className="summary-card summary-card--main">
          <p className="summary-label">Money left</p>
          <p className={`summary-value${remainingBalance < 0 ? ' summary-value--negative' : ''}`}>
            {formatPeso(Math.max(0, remainingBalance))}
          </p>
          {remainingBalance < 0 && (
            <p className="summary-overspent">
              Over by {formatPeso(Math.abs(remainingBalance))}
            </p>
          )}
        </div>

        <div className="summary-card">
          <p className="summary-label">Days left</p>
          <p className="summary-value">
            {periodEnded ? '—' : daysRemaining}
          </p>
          {periodEnded && <p className="summary-note">Period ended</p>}
        </div>

        <div className="summary-card">
          <p className="summary-label">Approx. available/day</p>
          <p className="summary-value summary-value--daily">
            {periodEnded || daysRemaining <= 0
              ? '—'
              : `${formatPeso(currentDaily)}/day`}
          </p>
          <p className="summary-note">
            Approximate amount you can spend per day
          </p>
        </div>

      </div>

      {/* ── Spending status ────────────────────────────────────── */}
      <StatusBadge statusResult={statusResult} daysRemaining={daysRemaining} />

      {/* ── Spending breakdown pie chart ───────────────────────── */}
      {/* Calendar-based: Today = today's date, This Week = current Mon–Sun.
          Completely independent of the user's budget period. */}
      <ExpensePieChart userId={userId} refreshKey={refreshKey} />

      {/* ── Add Expense button / form ──────────────────────────── */}
      {!showExpenseForm ? (
        <button className="btn btn-primary btn-add-expense" onClick={() => setShowExpenseForm(true)}>
          + Add Expense
        </button>
      ) : (
        <AddExpenseForm
          userId={userId}
          allowance={budget?.allowance}
          totalSpent={totalSpent}
          periodType={budget?.periodType}
          nextAllowanceDate={budget?.nextAllowanceDate}
          startDate={budget?.startDate}
          categoryBudgets={budget?.categoryBudgets}
          onAdded={handleExpenseAdded}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}

      {/* ── Category progress ─────────────────────────────────── */}
      <div className="card section-card">
        <h2 className="section-title">Budget Categories</h2>
        <div className="category-bars">
          {CATEGORIES.map(({ key, label, emoji }) => (
            <CategoryBar
              key={key}
              emoji={emoji}
              label={label}
              spent={categorySpending[key] || 0}
              budget={budget?.categoryBudgets[key] || 0}
            />
          ))}
        </div>

        {otherSpending > 0 && (
          <div className="other-expenses-row">
            <span className="category-emoji">📌</span>
            <span className="other-expenses-label">Other expenses</span>
            <span className="other-expenses-amount">{formatPeso(otherSpending)}</span>
          </div>
        )}
      </div>

      {/* ── Recent expenses ────────────────────────────────────── */}
      <div className="card section-card">
        <div className="section-card-header">
          <h2 className="section-title">Recent Expenses</h2>
          <Link to="/history" className="section-link">View All</Link>
        </div>
        <ExpenseList expenses={expenses} />
      </div>

      {/* ── Budget info footer ─────────────────────────────────── */}
      <div className="dashboard-footer">
        <p className="footer-info">
          Budget: {formatPeso(budget?.allowance)} · {getPeriodLabel(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate)}
        </p>
        <p className="footer-disclaimer">
          TipidTech is a simple spending-awareness tool for students.
          Thresholds shown are prototype estimates, not financial advice.
        </p>
      </div>

    </div>
    </>
  );
}
