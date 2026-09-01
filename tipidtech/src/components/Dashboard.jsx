// Dashboard.jsx
// Screen 3 — the main tracking view.
// Shows: remaining balance, days left, approx daily amount, spending status,
// category progress bars, recent expenses, and the Add Expense form.

import StatusBadge    from './StatusBadge';
import CategoryBar    from './CategoryBar';
import ExpenseList    from './ExpenseList';
import AddExpenseForm from './AddExpenseForm';

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

// Return a human-readable period label, e.g. "Weekly (7 days)"
function getPeriodLabel(periodType, nextAllowanceDate, startDate) {
  if (periodType === 'date') {
    const totalDays = getTotalDays(periodType, nextAllowanceDate, startDate);
    return `Until ${new Date(nextAllowanceDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })} (${totalDays} days)`;
  }
  const option = PERIOD_OPTIONS.find((o) => o.key === periodType);
  return option ? option.label : '';
}

export default function Dashboard({
  allowance,
  periodType,
  nextAllowanceDate,
  startDate,
  categoryBudgets,
  expenses,
  showExpenseForm,
  onShowExpenseForm,
  onHideExpenseForm,
  onAddExpense,
  onReset,
}) {
  // ─── Calculated values ────────────────────────────────────────
  const remainingBalance  = getRemainingBalance(allowance, expenses);
  const daysRemaining     = getDaysRemaining(periodType, nextAllowanceDate, startDate);
  const totalDays         = getTotalDays(periodType, nextAllowanceDate, startDate);
  const plannedDaily      = getPlannedDailyAmount(allowance, totalDays);
  const currentDaily      = getCurrentDailyAmount(remainingBalance, daysRemaining);
  const categorySpending  = getCategorySpending(expenses);
  const otherSpending     = getOtherSpending(expenses);
  const statusResult      = getSpendingStatus(allowance, expenses, periodType, nextAllowanceDate, startDate);
  const periodEnded       = daysRemaining <= 0;

  // ─── Reset confirmation ───────────────────────────────────────
  function handleResetClick() {
    if (window.confirm('Reset your budget? This will clear all your data and start over.')) {
      onReset();
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="screen dashboard-screen">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="dashboard-topbar">
        <h1 className="app-title-small">TipidTech</h1>
        <button className="btn-reset" onClick={handleResetClick}>
          Reset Budget
        </button>
      </div>

      {/* ── Summary cards ─────────────────────────────────────── */}
      <div className="summary-grid">

        {/* Remaining balance */}
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

        {/* Days remaining */}
        <div className="summary-card">
          <p className="summary-label">Days left</p>
          <p className="summary-value">
            {periodEnded ? '—' : daysRemaining}
          </p>
          {periodEnded && <p className="summary-note">Period ended</p>}
        </div>

        {/* Approx daily amount */}
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

      {/* ── Add Expense button / form ──────────────────────────── */}
      {!showExpenseForm ? (
        <button className="btn btn-primary btn-add-expense" onClick={onShowExpenseForm}>
          + Add Expense
        </button>
      ) : (
        <AddExpenseForm
          allowance={allowance}
          expenses={expenses}
          periodType={periodType}
          nextAllowanceDate={nextAllowanceDate}
          startDate={startDate}
          categoryBudgets={categoryBudgets}
          onAdd={onAddExpense}
          onCancel={onHideExpenseForm}
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
              budget={categoryBudgets[key] || 0}
            />
          ))}
        </div>

        {/* Other expenses — shown below main categories if any exist */}
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
        <h2 className="section-title">Recent Expenses</h2>
        <ExpenseList expenses={expenses} />
      </div>

      {/* ── Budget info footer ─────────────────────────────────── */}
      <div className="dashboard-footer">
        <p className="footer-info">
          Budget: {formatPeso(allowance)} · {getPeriodLabel(periodType, nextAllowanceDate, startDate)}
        </p>
        <p className="footer-disclaimer">
          TipidTech is a simple spending-awareness tool for students.
          Thresholds shown are prototype estimates, not financial advice.
        </p>
      </div>

    </div>
  );
}
