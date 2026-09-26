// Dashboard.jsx
// Main tracking view. Loads its own expenses and savings goals from Supabase.
// Grid layout: hero balance → 3 stat cards → charts row → recent expenses →
// savings goals. All data loading, calculations and handlers are unchanged —
// only the layout and styling were redesigned.

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Wallet, Plus } from 'lucide-react';

import StatusBadge      from './StatusBadge';
import CategoryBar      from './CategoryBar';
import ExpenseList      from './ExpenseList';
import AddExpenseForm   from './AddExpenseForm';
import ExpensePieChart  from './ExpensePieChart';
import SavingsGoalCard  from './SavingsGoalCard';
import CategoryIcon     from './CategoryIcon';
import EditExpenseModal from './EditExpenseModal';

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
import { getRecentExpenses, getTotalExpenses, getBudget, getSavingsGoals } from '../utils/storage';

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

// Small presentational stat card used in row 2
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-brand-dark" aria-hidden="true" />
      </div>
      <p className="text-2xl font-extrabold leading-tight text-ink">{value}</p>
      {sub && <p className="text-xs leading-snug text-muted">{sub}</p>}
    </div>
  );
}

export default function Dashboard({
  userId,
  onReset,
  onLogout,
  userEmail,
}) {
  const navigate = useNavigate();

  // ── Expense state ─────────────────────────────────────────────
  const [expenses,        setExpenses]        = useState([]);
  const [totalSpent,      setTotalSpent]      = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshKey,      setRefreshKey]      = useState(0);
  const [editingExpense,  setEditingExpense]  = useState(null);

  const [budget,        setBudget]        = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);

  // ── Savings goals state ───────────────────────────────────────
  const [activeGoals,  setActiveGoals]  = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // ─── Load recent expenses + total spent ───────────────────────
  const loadExpenses = useCallback(async () => {
    if (!userId || !budget?.id) return;
    try {
      const [recent, total] = await Promise.all([
        getRecentExpenses(userId, 5, budget.id),
        getTotalExpenses(userId, budget.id),
      ]);
      setExpenses(recent);
      setTotalSpent(total);
    } catch (err) {
      console.error('TipidTech: failed to load expenses', err);
    }
  }, [userId, budget?.id]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // ─── Load budget ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    getBudget(userId)
      .then((row) => {
        if (row) {
          setBudget({
            id:                row.id,
            allowance:         Number(row.allowance),
            periodType:        row.period,
            nextAllowanceDate: row.next_allowance_date || '',
            startDate:         row.start_date,
            endDate:           row.end_date || '',
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

  // ─── Load active savings goals ────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    getSavingsGoals(userId)
      .then((goals) => setActiveGoals(goals.filter((g) => !g.is_completed)))
      .catch((err) => console.error('TipidTech: failed to load savings goals', err))
      .finally(() => setGoalsLoading(false));
  }, [userId]);

  // ─── Called by AddExpenseForm after a successful insert ───────
  function handleExpenseAdded() {
    setShowExpenseForm(false);
    loadExpenses();
    setRefreshKey(prev => prev + 1);
  }

  // ─── Refresh active goals after a contribution ────────────────
  function handleGoalUpdated() {
    if (!userId) return;
    getSavingsGoals(userId)
      .then((goals) => setActiveGoals(goals.filter((g) => !g.is_completed)))
      .catch((err) => console.error('TipidTech: failed to refresh savings goals', err));
  }

  // ─── Calculated values ────────────────────────────────────────
  const expensesForCalc  = totalSpent > 0 ? [{ amount: totalSpent }] : [];
  const remainingBalance = getRemainingBalance(budget?.allowance, expensesForCalc);
  const daysRemaining    = getDaysRemaining(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate, budget?.endDate);
  const totalDays        = getTotalDays(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate, budget?.endDate);
  const plannedDaily     = getPlannedDailyAmount(budget?.allowance, totalDays);
  const currentDaily     = getCurrentDailyAmount(remainingBalance, daysRemaining);
  const categorySpending = getCategorySpending(expenses);
  const otherSpending    = getOtherSpending(expenses);
  const statusResult     = getSpendingStatus(budget?.allowance, expensesForCalc, budget?.periodType, budget?.nextAllowanceDate, budget?.startDate, budget?.endDate);
  const periodEnded      = daysRemaining <= 0;

  // ─── Reset: hand off to App.jsx which opens PeriodSummaryModal ─
  function handleResetClick() {
    onReset(budget);
  }

  // ─── Render ───────────────────────────────────────────────────
  if (budgetLoading) return <p className="py-10 text-center text-sm text-muted">Loading…</p>;
  if (!budget)       return <p className="py-10 text-center text-sm text-muted">No budget found.</p>;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">

      {/* ── Row 1: full-width hero card — remaining balance ────── */}
      <div className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Remaining Balance
          </p>
          <p className="text-sm text-muted mt-0.5">Your remaining allowance for this budget period. It updates automatically every time you log an expense.</p>
          <button
            type="button"
            onClick={handleResetClick}
            className="shrink-0 cursor-pointer rounded-full border border-brand bg-brand px-3 py-1 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark hover:border-brand-dark"          >
            Reset Budget
          </button>
        </div>
        <p className={`text-4xl font-extrabold leading-tight sm:text-5xl ${remainingBalance < 0 ? 'text-red-600' : 'text-ink'}`}>
          {formatPeso(Math.max(0, remainingBalance))}
        </p>
        {remainingBalance < 0 && (
          <p className="text-sm font-medium text-red-600">
            Over by {formatPeso(Math.abs(remainingBalance))}
          </p>
        )}
        <p className="mt-1 text-xs text-muted">
          Budget: {formatPeso(budget?.allowance)} · {getPeriodLabel(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate)}
        </p>
      </div>

      {/* ── Row 2: 3-column stat cards ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Days Left"
          value={periodEnded ? '—' : daysRemaining}
          sub={periodEnded ? 'Period ended' : `${totalDays}-day budget period`}
        />
        <StatCard
          icon={Wallet}
          label="Available per Day"
          value={periodEnded || daysRemaining <= 0 ? '—' : `${formatPeso(currentDaily)}/day`}
          sub="Approximate amount you can spend per day"
        />
        <StatusBadge statusResult={statusResult} daysRemaining={daysRemaining} />
      </div>

      {/* ── Row 3: pie chart + category budget bars ────────────── */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <ExpensePieChart userId={userId} refreshKey={refreshKey} budgetId={budget?.id} />

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Budget Categories</h2>
          <p className="text-sm text-muted mt-0.5">How your allowance is split across each spending category this period.</p>
          <div className="flex flex-1 flex-col justify-center gap-4">
            {CATEGORIES.map(({ key, label }) => (
              <CategoryBar
                key={key}
                categoryKey={key}
                label={label}
                spent={categorySpending[key] || 0}
                budget={budget?.categoryBudgets[key] || 0}
              />
            ))}
          </div>

          {otherSpending > 0 && (
            <div className="mt-1 flex items-center gap-2 border-t border-gray-100 pt-3 text-sm">
              <CategoryIcon category="other" className="h-4 w-4 text-muted" />
              <span className="flex-1 font-medium text-muted">Other expenses</span>
              <span className="font-semibold text-ink">{formatPeso(otherSpending)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: full-width recent expenses ──────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Recent Expenses</h2>
          <p className="text-sm text-muted mt-0.5">Your 5 most recent transactions this budget period. Go to History to see everything.</p>
          <div className="flex items-center gap-3">
            {!showExpenseForm && (
              <button
                type="button"
                onClick={() => setShowExpenseForm(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Expense
              </button>
            )}
            <Link
              to="/history"
              className="text-sm font-medium text-muted no-underline transition-colors duration-150 hover:text-ink hover:underline"
            >
              View All
            </Link>
          </div>
        </div>

        {showExpenseForm ? (
          <AddExpenseForm
            userId={userId}
            budgetId={budget?.id}
            allowance={budget?.allowance}
            totalSpent={totalSpent}
            periodType={budget?.periodType}
            nextAllowanceDate={budget?.nextAllowanceDate}
            startDate={budget?.startDate}
            categoryBudgets={budget?.categoryBudgets}
            onAdded={handleExpenseAdded}
            onCancel={() => setShowExpenseForm(false)}
          />
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={(expense) => setEditingExpense(expense)}
          />
        )}
      </div>

      {/* ── Row 5: full-width active savings goals ─────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Savings Goals</h2>
          <p className="text-sm text-muted mt-0.5">A quick view of your active savings goals. Go to Savings Goals for the full details.</p>
          <Link
            to="/savings"
            className="text-sm font-medium text-muted no-underline transition-colors duration-150 hover:text-ink hover:underline"
          >
            See All Goals
          </Link>
        </div>

        {goalsLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : activeGoals.length === 0 ? (
          <p className="text-sm text-muted">
            No savings goals yet.{' '}
            <Link to="/savings" className="font-medium text-ink underline underline-offset-2 hover:text-brand-dark">
              Add one to start saving!
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {activeGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                userId={userId}
                onGoalUpdated={handleGoalUpdated}
                onCardTap={() => navigate('/savings')}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <p className="text-center text-xs leading-relaxed text-muted">
        TipidTech is a simple spending-awareness tool for students.
        Thresholds shown are prototype estimates, not financial advice.
      </p>

      {/* ── Edit expense modal ───────────────────────────────────── */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSaved={handleExpenseAdded}
          onClose={() => setEditingExpense(null)}
        />
      )}

    </div>
  );
}