// HistoryScreen.jsx
// Shows the full expense history for the logged-in user, newest first.
// Each row: date, time, category, note, amount.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import NavHeader              from './NavHeader';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }         from '../utils/calculations';
import { getAllExpenses }      from '../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function getCategoryEmoji(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.emoji : '📌';
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
  const navigate = useNavigate();

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
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-12 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <button
            className="self-start text-sm font-medium text-blue-600 bg-transparent border-none cursor-pointer p-0 hover:underline"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to Dashboard"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Expense History</h2>
          {!loading && !error && (
            <p className="text-sm text-gray-400">
              {expenses.length === 0
                ? 'No expenses recorded yet.'
                : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-400 text-center py-8">Loading history…</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        )}

        {/* Empty state */}
        {!loading && !error && expenses.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-2 text-center">
            <p className="text-sm text-gray-500">You haven&apos;t recorded any expenses yet.</p>
            <p className="text-sm text-gray-400">Head back to the dashboard and add your first one.</p>
          </div>
        )}

        {/* Expense list */}
        {!loading && !error && expenses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <ul aria-label="All expenses">
              {expenses.map((expense, idx) => (
                <li
                  key={expense.id}
                  className={`flex items-start gap-3 px-5 py-4 ${idx < expenses.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-xl leading-none shrink-0 mt-0.5">
                    {getCategoryEmoji(expense.category)}
                  </span>
                  <span className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {getCategoryLabel(expense.category)}
                      </span>
                      {expense.note && (
                        <span className="text-xs text-gray-400 truncate">{expense.note}</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(expense.created_at)} · {formatTime(expense.created_at)}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-red-600 shrink-0">
                    −{formatPeso(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
