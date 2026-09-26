// ExpenseList.jsx
// Displays the 5 most recent expenses on the dashboard.
// Consumes Supabase expense rows: { id, amount, category, note, created_at }

import CategoryIcon from './CategoryIcon';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso } from '../utils/calculations';
import { Pencil } from 'lucide-react';

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

export default function ExpenseList({ expenses, onEdit }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col gap-1 py-4 text-center">
        <p className="text-sm text-muted">No expenses recorded yet.</p>
        <p className="text-xs text-gray-400">Add your first expense to start tracking.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col" aria-label="Recent expenses">
      {expenses.map((expense, idx) => (
        <li
          key={expense.id}
          className={`flex items-center gap-3 py-3 ${idx < expenses.length - 1 ? 'border-b border-gray-100' : ''}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
            <CategoryIcon category={expense.category} className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-ink">
              {expense.note || getCategoryLabel(expense.category)}
            </span>
            <span className="text-xs text-muted">
              {getCategoryLabel(expense.category)} · {formatExpenseDateTime(expense.created_at)}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-red-600">
            −{formatPeso(expense.amount)}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
              className="shrink-0 cursor-pointer rounded-md border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
              aria-label={`Edit expense`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}