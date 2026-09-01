// ExpenseList.jsx
// Displays the 5 most recent expenses on the dashboard.
// Shows: emoji, description (or category name), and amount.

import { MAX_RECENT_EXPENSES, EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso } from '../utils/calculations';

// Look up the emoji for a given category key
function getCategoryEmoji(categoryKey) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey);
  return cat ? cat.emoji : '📌';
}

// Look up the label for a given category key
function getCategoryLabel(categoryKey) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey);
  return cat ? cat.label : 'Other';
}

// Format a stored ISO date string as a short readable date (e.g. "Sep 1")
function formatExpenseDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function ExpenseList({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>No expenses recorded yet.</p>
        <p className="expense-list-hint">Add your first expense to start tracking.</p>
      </div>
    );
  }

  // Show the most recent expenses first, limited to MAX_RECENT_EXPENSES
  const recent = [...expenses]
    .reverse()
    .slice(0, MAX_RECENT_EXPENSES);

  return (
    <ul className="expense-list" aria-label="Recent expenses">
      {recent.map((expense) => (
        <li key={expense.id} className="expense-item">
          <span className="expense-emoji">{getCategoryEmoji(expense.category)}</span>
          <span className="expense-details">
            <span className="expense-description">
              {expense.description || getCategoryLabel(expense.category)}
            </span>
            <span className="expense-meta">
              {getCategoryLabel(expense.category)} · {formatExpenseDate(expense.date)}
            </span>
          </span>
          <span className="expense-amount">−{formatPeso(expense.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
