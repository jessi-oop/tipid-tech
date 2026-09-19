// HistoryScreen.jsx
// Shows the full expense history for the logged-in user, newest first.
// Each row: category icon chip, category + note, date pill badge, amount.

import { useState, useEffect } from 'react';

import CategoryIcon         from './CategoryIcon';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }         from '../utils/calculations';
import { getAllExpenses }      from '../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ─── Component ────────────────────────────────────────────────────

export default function HistoryScreen({ userId, onLogout, userEmail }) {
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!userId) return;
    getAllExpenses(userId)
      .then((data) => setExpenses(data))
      .catch((err) => {
        console.error('TipidTech: failed to load history', err);
        setError('Could not load expense history. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-ink">Expense History</h2>
          {!loading && !error && (
            <p className="text-sm text-muted">
              {expenses.length === 0
                ? 'No expenses recorded yet.'
                : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-8 text-center text-sm text-muted">Loading history…</p>
      )}

      {/* Error */}
      {error && (
        <p className="py-4 text-center text-sm text-red-600">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && expenses.length === 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-muted">You haven&apos;t recorded any expenses yet.</p>
          <p className="text-xs text-gray-400">Head back to the dashboard and add your first one.</p>
        </div>
      )}

      {/* Full-width expense list card */}
      {!loading && !error && expenses.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ul aria-label="All expenses">
            {expenses.map((expense, idx) => (
              <li
                key={expense.id}
                className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 ${idx < expenses.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
                  <CategoryIcon category={expense.category} className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-baseline gap-2">
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {getCategoryLabel(expense.category)}
                    </span>
                    {expense.note && (
                      <span className="truncate text-xs text-muted">{expense.note}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="inline-flex items-center rounded-full bg-page px-2.5 py-0.5 font-medium">
                      {formatDate(expense.created_at)}
                    </span>
                    <span>{formatTime(expense.created_at)}</span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-red-600">
                  −{formatPeso(expense.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}