// ExpenseList.jsx
// Displays the 5 most recent expenses on the dashboard.
// Consumes Supabase expense rows: { id, amount, category, note, created_at }

import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso } from '../utils/calculations';

function getCategoryEmoji(categoryKey) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey);
  return cat ? cat.emoji : '📌';
}

function getCategoryLabel(categoryKey) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey);
  return cat ? cat.label : 'Other';
}

// Format a Supabase timestamptz string as "Sep 1, 2:30 PM"
function formatExpenseDateTime(isoString) {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
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

  return (
    <ul className="expense-list" aria-label="Recent expenses">
      {expenses.map((expense) => (
        <li key={expense.id} className="expense-item">
          <span className="expense-emoji">{getCategoryEmoji(expense.category)}</span>
          <span className="expense-details">
            <span className="expense-description">
              {expense.note || getCategoryLabel(expense.category)}
            </span>
            <span className="expense-meta">
              {getCategoryLabel(expense.category)} · {formatExpenseDateTime(expense.created_at)}
            </span>
          </span>
          <span className="expense-amount">−{formatPeso(expense.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
