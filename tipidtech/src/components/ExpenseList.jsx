// ExpenseList.jsx
// Displays the 5 most recent expenses on the dashboard.
// Consumes Supabase expense rows: { id, amount, category, note, created_at }

import ExpenseRow from './ExpenseRow';

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
        <ExpenseRow
          key={expense.id}
          expense={expense}
          dateMode="combined"
          onEdit={onEdit}
          isLast={idx === expenses.length - 1}
        />
      ))}
    </ul>
  );
}
