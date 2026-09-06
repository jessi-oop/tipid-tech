// CategoryBar.jsx
// Displays a single budget category as a progress bar row.
// Shows: emoji + name, amount spent vs. budget, visual progress bar.
// Highlights in red when spending exceeds the category budget.

import { formatPeso } from '../utils/calculations';

export default function CategoryBar({ emoji, label, spent, budget }) {
  const percentage   = budget > 0 ? (spent / budget) * 100 : 0;
  const displayWidth = Math.min(100, percentage);
  const isOver       = spent > budget;
  const isFull       = spent === budget;

  const fillCls = isOver
    ? 'bg-red-500'
    : isFull
    ? 'bg-green-500'
    : 'bg-blue-600';

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex justify-between items-center gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium text-gray-900 shrink-0">
          <span className="text-lg leading-none shrink-0">{emoji}</span>
          {label}
        </span>
        <span className={`text-xs text-right ${isOver ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
          {formatPeso(spent)}
          <span className="text-gray-300"> / </span>
          {formatPeso(budget)}
          {isOver && <span className="text-xs font-semibold text-red-600 ml-1">Over budget</span>}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} budget`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillCls}`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}
