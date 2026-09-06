// HistoryScreen.jsx
// Shows the full expense history for the logged-in user, newest first.
// Each row: date, time, category, note, amount.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import NavHeader           from './NavHeader';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }          from '../utils/calculations';
import { getAllExpenses }       from '../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function getCategoryEmoji(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.emoji : '📌';
}

// Format a Supabase timestamptz → "Sep 5, 2026"
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// Format a Supabase timestamptz → "2:30 PM"
function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-PH', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
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
      .then((data) => {
        setExpenses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('TipidTech: failed to load history', err);
        setError('Could not load expense history. Please try again.');
        setLoading(false);
      });
  }, [userId]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="screen history-screen">

      {/* Header */}
      <div className="screen-header">
        <button
          className="btn-back"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <h2 className="screen-title">Expense History</h2>
        {!loading && !error && (
          <p className="screen-subtitle">
            {expenses.length === 0
              ? 'No expenses recorded yet.'
              : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="history-loading">Loading history…</p>
      )}

      {/* Error */}
      {error && (
        <p className="history-error">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && expenses.length === 0 && (
        <div className="card history-empty">
          <p>You haven&apos;t recorded any expenses yet.</p>
          <p>Head back to the dashboard and add your first one.</p>
        </div>
      )}

      {/* Expense list */}
      {!loading && !error && expenses.length > 0 && (
        <div className="card history-table-card">
          <ul className="history-list" aria-label="All expenses">
            {expenses.map((expense) => (
              <li key={expense.id} className="history-item">
                <span className="history-item-emoji">
                  {getCategoryEmoji(expense.category)}
                </span>
                <span className="history-item-details">
                  <span className="history-item-top">
                    <span className="history-item-category">
                      {getCategoryLabel(expense.category)}
                    </span>
                    {expense.note && (
                      <span className="history-item-note">{expense.note}</span>
                    )}
                  </span>
                  <span className="history-item-meta">
                    {formatDate(expense.created_at)}
                    {' · '}
                    {formatTime(expense.created_at)}
                  </span>
                </span>
                <span className="history-item-amount">
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
