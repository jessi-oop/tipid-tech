// PeriodSummaryModal.jsx
// Shown before any budget reset — auto (period ended) or manual (user-initiated).
// Fetches its own summary data scoped to the current budget_id.
// Displays period dates, allowance, total spent, per-category breakdown,
// total saved, and unspent balance.
// "Start New Period" → onConfirm (triggers actual reset)
// "Cancel"          → onCancel  (only shown for manual resets)

import { useState, useEffect } from 'react';
import { CATEGORIES }          from '../utils/constants';
import { formatPeso }          from '../utils/calculations';
import { getTotalExpenses, getAllExpenses, getSavingsGoals, getContributions } from '../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────

function formatDisplayDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function getCategoryLabel(key) {
  const cat = CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : key;
}

// ─── Component ────────────────────────────────────────────────────

export default function PeriodSummaryModal({
  userId,
  budgetId,
  budget,       // { allowance, startDate, endDate, periodType, categoryBudgets }
  isAutoReset,
  onConfirm,
  onCancel,
}) {
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [totalSpent,        setTotalSpent]        = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [totalSaved,        setTotalSaved]        = useState(0);
  const [confirming,        setConfirming]        = useState(false);

  // ─── Fetch summary data on mount ──────────────────────────────
  useEffect(() => {
    if (!userId || !budgetId) return;

    async function fetchSummary() {
      try {
        // Total spent + per-category breakdown
        const [total, allExpenses, goals] = await Promise.all([
          getTotalExpenses(userId, budgetId),
          getAllExpenses(userId, budgetId),
          getSavingsGoals(userId),
        ]);

        setTotalSpent(total);

        // Build per-category totals from expense rows
        const breakdown = {};
        for (const expense of allExpenses) {
          const key = expense.category;
          breakdown[key] = (breakdown[key] || 0) + Number(expense.amount);
        }
        setCategoryBreakdown(breakdown);

        // Sum all contributions across all goals
        const contributionTotals = await Promise.all(
          goals.map((goal) => getContributions(goal.id).then((contribs) =>
            contribs.reduce((sum, c) => sum + Number(c.amount), 0)
          ))
        );
        setTotalSaved(contributionTotals.reduce((sum, t) => sum + t, 0));
      } catch (err) {
        console.error('TipidTech: failed to load period summary', err);
        setError('Could not load period summary. You can still start a new period.');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [userId, budgetId]);

  // ─── Confirm handler ──────────────────────────────────────────
  async function handleConfirm() {
    setConfirming(true);
    await onConfirm();
  }

  // ─── Derived values ───────────────────────────────────────────
  const allowance  = budget?.allowance  ?? 0;
  const unspent    = allowance - totalSpent;
  const startDate  = budget?.startDate  ?? '';
  const endDate    = budget?.endDate    ?? '';

  // Only show categories that have spending > 0
  const spentCategories = CATEGORIES.filter(
    (cat) => (categoryBreakdown[cat.key] ?? 0) > 0
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="period-summary-title"
    >
      {/* Card */}
      <div className="flex w-full max-w-md flex-col gap-5 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh]">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h2 id="period-summary-title" className="text-xl font-extrabold text-ink">
            {isAutoReset ? 'Budget Period Ended' : 'Reset Budget'}
          </h2>
          <p className="text-sm text-muted mt-0.5">Here is a summary of how you did this budget period before you start a new one.</p>
        </div>

        {/* Period dates */}
        <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-page px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Budget Period</p>
          <p className="text-sm font-medium text-ink">
            {formatDisplayDate(startDate)}
            {endDate ? ` → ${formatDisplayDate(endDate)}` : ''}
          </p>
        </div>

        {loading && (
          <p className="py-4 text-center text-sm text-muted">Loading summary…</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && (
          <>
            {/* Key figures */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Allowance</p>
                <p className="text-lg font-extrabold text-ink">{formatPeso(allowance)}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Total Spent</p>
                <p className="text-lg font-extrabold text-red-600">{formatPeso(totalSpent)}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Unspent</p>
                <p className={`text-lg font-extrabold ${unspent >= 0 ? 'text-ink' : 'text-red-600'}`}>
                  {formatPeso(Math.abs(unspent))}
                  {unspent < 0 && <span className="ml-1 text-xs font-medium">(over)</span>}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Total Saved</p>
                <p className="text-lg font-extrabold text-ink">{formatPeso(totalSaved)}</p>
              </div>
            </div>

            {/* Per-category breakdown */}
            {spentCategories.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Spending by Category
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {spentCategories.map((cat, idx) => (
                    <div
                      key={cat.key}
                      className={`flex items-center justify-between px-4 py-3 ${
                        idx < spentCategories.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <span className="text-sm font-medium text-ink">
                        {cat.emoji} {getCategoryLabel(cat.key)}
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        −{formatPeso(categoryBreakdown[cat.key])}
                      </span>
                    </div>
                  ))}
                  {spentCategories.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted">No expenses recorded.</p>
                  )}
                </div>
              </div>
            )}

            {spentCategories.length === 0 && (
              <p className="text-center text-sm text-muted">No expenses recorded this period.</p>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
          >
            {confirming ? 'Starting…' : 'Start New Period'}
          </button>
          {!isAutoReset && (
            <button
              type="button"
              onClick={onCancel}
              disabled={confirming}
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
