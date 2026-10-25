// PeriodSummaryModal.jsx
// Shown before any budget reset — auto (period ended) or manual (user-initiated).
// Fetches its own summary data scoped to the current budget_id.
// "Start New Period" → onConfirm (triggers actual reset)
// "Cancel"          → onCancel  (only shown for manual resets)

import { useState, useEffect } from 'react';
import { CATEGORIES }          from '../utils/constants';
import { formatPeso }          from '../utils/calculations';
import { getTotalExpenses, getAllExpenses, getSavingsGoals, getContributions } from '../utils/storage';
import Modal from './ui/Modal';

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
  budget,
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

  useEffect(() => {
    if (!userId || !budgetId) return;
    async function fetchSummary() {
      try {
        const [total, allExpenses, goals] = await Promise.all([
          getTotalExpenses(userId, budgetId),
          getAllExpenses(userId, budgetId),
          getSavingsGoals(userId),
        ]);
        setTotalSpent(total);
        const breakdown = {};
        for (const expense of allExpenses) {
          const key = expense.category;
          breakdown[key] = (breakdown[key] || 0) + Number(expense.amount);
        }
        setCategoryBreakdown(breakdown);
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

  async function handleConfirm() {
    setConfirming(true);
    await onConfirm();
  }

  const allowance = budget?.allowance ?? 0;
  const unspent   = allowance - totalSpent;
  const startDate = budget?.startDate ?? '';
  const endDate   = budget?.endDate   ?? '';

  const spentCategories = CATEGORIES.filter(
    (cat) => (categoryBreakdown[cat.key] ?? 0) > 0
  );

  // ── Footer: Start New Period + optional Cancel ────────────────
  const footer = (
    <div className="flex flex-col gap-2">
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
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Modal
      labelId="period-summary-title"
      titleAs="h2"
      title={isAutoReset ? 'Budget Period Ended' : 'Reset Budget'}
      description="Here is a summary of how you did this budget period before you start a new one."
      onClose={isAutoReset ? () => {} : onCancel}
      busy={isAutoReset || confirming}
      footer={footer}
    >
      {/* Period dates */}
      <div className="mb-4 flex flex-col gap-1 rounded-xl border border-gray-100 bg-page px-4 py-3">
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
        <div className="flex flex-col gap-4">
          {/* Key figures — 2-col grid, min-w-0 + break-words on values */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Allowance',    value: formatPeso(allowance),                   cls: 'text-ink'     },
              { label: 'Total Spent',  value: formatPeso(totalSpent),                  cls: 'text-red-600' },
              {
                label: 'Unspent',
                value: (
                  <>
                    {formatPeso(Math.abs(unspent))}
                    {unspent < 0 && <span className="ml-1 text-xs font-medium">(over)</span>}
                  </>
                ),
                cls: unspent >= 0 ? 'text-ink' : 'text-red-600',
              },
              { label: 'Total Saved',  value: formatPeso(totalSaved),                  cls: 'text-ink'     },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex min-w-0 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
                <p className={`min-w-0 break-words text-lg font-extrabold sm:text-xl ${cls}`}>{value}</p>
              </div>
            ))}
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
                    className={`flex min-w-0 items-center justify-between gap-2 px-4 py-3 ${
                      idx < spentCategories.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="min-w-0 text-sm font-medium text-ink">
                      {cat.emoji} {getCategoryLabel(cat.key)}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-red-600">
                      −{formatPeso(categoryBreakdown[cat.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {spentCategories.length === 0 && (
            <p className="text-center text-sm text-muted">No expenses recorded this period.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
