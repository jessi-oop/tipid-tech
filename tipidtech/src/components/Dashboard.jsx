// Dashboard.jsx
// Main tracking view. Loads its own expenses and savings goals from Supabase.
// Shows: remaining balance, days left, approx daily amount, spending status,
// category progress bars, recent expenses, pie chart, savings goals, and Add Expense form.

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge      from './StatusBadge';
import CategoryBar      from './CategoryBar';
import ExpenseList      from './ExpenseList';
import AddExpenseForm   from './AddExpenseForm';
import ExpensePieChart  from './ExpensePieChart';
import NavHeader        from './NavHeader';
import SavingsGoalCard  from './SavingsGoalCard';

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

export default function Dashboard({
  userId,
  onReset,
  onLogout,
  userEmail,
}) {
  // ── Expense state ─────────────────────────────────────────────
  const [expenses,        setExpenses]        = useState([]);
  const [totalSpent,      setTotalSpent]      = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshKey,      setRefreshKey]      = useState(0);

  const [budget,        setBudget]        = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);

  // ── Savings goals state ───────────────────────────────────────
  const [activeGoals,  setActiveGoals]  = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

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
  const daysRemaining    = getDaysRemaining(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const totalDays        = getTotalDays(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const plannedDaily     = getPlannedDailyAmount(budget?.allowance, totalDays);
  const currentDaily     = getCurrentDailyAmount(remainingBalance, daysRemaining);
  const categorySpending = getCategorySpending(expenses);
  const otherSpending    = getOtherSpending(expenses);
  const statusResult     = getSpendingStatus(budget?.allowance, expensesForCalc, budget?.periodType, budget?.nextAllowanceDate, budget?.startDate);
  const periodEnded      = daysRemaining <= 0;

  // ─── Reset confirmation ───────────────────────────────────────
  function handleResetClick() {
    if (window.confirm('Reset your budget? This will clear all your data and start over.')) {
      onReset();
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  if (budgetLoading) return <div className="w-full max-w-2xl mx-auto px-4 py-10 text-gray-500">Loading…</div>;
  if (!budget)       return <div className="w-full max-w-2xl mx-auto px-4 py-10 text-gray-500">No budget found.</div>;

  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-12 flex flex-col gap-5">

        {/* ── Top bar ───────────────────────────────────────────── */}
        <div className="flex justify-between items-center">
          <span />
          <button
            className="text-sm text-gray-400 border border-gray-200 rounded px-3 py-1.5 bg-transparent cursor-pointer transition-colors duration-150 hover:border-red-400 hover:text-red-500"
            onClick={handleResetClick}
          >
            Reset Budget
          </button>
        </div>

        {/* ── Summary cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Money left — full width */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Money left</p>
            <p className={`text-4xl font-extrabold leading-tight ${remainingBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatPeso(Math.max(0, remainingBalance))}
            </p>
            {remainingBalance < 0 && (
              <p className="text-sm font-medium text-red-600">
                Over by {formatPeso(Math.abs(remainingBalance))}
              </p>
            )}
          </div>

          {/* Days left */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Days left</p>
            <p className="text-3xl font-extrabold text-gray-900 leading-tight">
              {periodEnded ? '—' : daysRemaining}
            </p>
            {periodEnded && <p className="text-xs text-gray-400">Period ended</p>}
          </div>

          {/* Approx daily */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Approx. available/day</p>
            <p className="text-2xl font-extrabold text-gray-900 leading-tight">
              {periodEnded || daysRemaining <= 0 ? '—' : `${formatPeso(currentDaily)}/day`}
            </p>
            <p className="text-xs text-gray-400 leading-snug">
              Approximate amount you can spend per day
            </p>
          </div>

        </div>

        {/* ── Spending status ────────────────────────────────────── */}
        <StatusBadge statusResult={statusResult} daysRemaining={daysRemaining} />

        {/* ── Pie chart ─────────────────────────────────────────── */}
        <ExpensePieChart userId={userId} refreshKey={refreshKey} />

        {/* ── Savings Goals ─────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Savings Goals</h2>
            <Link to="/savings" className="text-sm font-medium text-blue-600 no-underline hover:underline">
              See All Goals
            </Link>
          </div>

          {goalsLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : activeGoals.length === 0 ? (
            <p className="text-sm text-gray-500">
              No savings goals yet.{' '}
              <Link to="/savings" className="text-blue-600 hover:underline">
                Add one to start saving!
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  userId={userId}
                  onGoalUpdated={handleGoalUpdated}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Add Expense button / form ──────────────────────────── */}
        {!showExpenseForm ? (
          <button
            className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl cursor-pointer transition-colors duration-150 hover:bg-blue-700"
            onClick={() => setShowExpenseForm(true)}
          >
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
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Budget Categories</h2>
          <div className="flex flex-col gap-4">
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
            <div className="flex items-center gap-2 pt-3 mt-1 border-t border-gray-200 text-sm">
              <span className="text-lg leading-none">📌</span>
              <span className="flex-1 text-gray-500 font-medium">Other expenses</span>
              <span className="font-semibold text-gray-900">{formatPeso(otherSpending)}</span>
            </div>
          )}
        </div>

        {/* ── Recent expenses ────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <Link to="/history" className="text-sm font-medium text-blue-600 no-underline hover:underline">
              View All
            </Link>
          </div>
          <ExpenseList expenses={expenses} />
        </div>

        {/* ── Budget info footer ─────────────────────────────────── */}
        <div className="flex flex-col gap-1 pt-2">
          <p className="text-xs text-gray-400 text-center">
            Budget: {formatPeso(budget?.allowance)} · {getPeriodLabel(budget?.periodType, budget?.nextAllowanceDate, budget?.startDate)}
          </p>
          <p className="text-xs text-gray-300 text-center leading-relaxed">
            TipidTech is a simple spending-awareness tool for students.
            Thresholds shown are prototype estimates, not financial advice.
          </p>
        </div>

      </div>
    </>
  );
}
