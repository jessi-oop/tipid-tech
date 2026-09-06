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

function formatExpenseDateTime(isoString) {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
}

export default function ExpenseList({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col gap-1 py-4 text-center">
        <p className="text-sm text-gray-400">No expenses recorded yet.</p>
        <p className="text-xs text-gray-300">Add your first expense to start tracking.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Recent expenses">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex items-start gap-3">
          <span className="text-xl leading-none shrink-0 mt-0.5">
            {getCategoryEmoji(expense.category)}
          </span>
          <span className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">
              {expense.note || getCategoryLabel(expense.category)}
            </span>
            <span className="text-xs text-gray-400">
              {getCategoryLabel(expense.category)} · {formatExpenseDateTime(expense.created_at)}
            </span>
          </span>
          <span className="text-sm font-semibold text-red-600 shrink-0">
            −{formatPeso(expense.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
