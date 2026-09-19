// CategoryBar.jsx
// Displays a single budget category as a progress bar row.
// Shows: Lucide category icon + name, amount spent vs. budget, progress bar.
// Highlights in red when spending exceeds the category budget.

import ProgressBar from './ProgressBar';
import CategoryIcon from './CategoryIcon';
import { formatPeso } from '../utils/calculations';

export default function CategoryBar({ categoryKey, label, spent, budget }) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOver     = spent > budget;
  const isFull     = spent === budget;

  const fillCls = isOver
    ? 'bg-red-500'
    : isFull
    ? 'bg-brand-dark'
    : 'bg-brand';

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex shrink-0 items-center gap-2 font-medium text-ink">
          <CategoryIcon category={categoryKey} className="h-4 w-4 text-muted" />
          {label}
        </span>
        <span className={`text-xs text-right ${isOver ? 'font-semibold text-red-600' : 'text-muted'}`}>
          {formatPeso(spent)}
          <span className="text-gray-300"> / </span>
          {formatPeso(budget)}
          {isOver && <span className="ml-1 text-xs font-semibold text-red-600">Over budget</span>}
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar percentage={percentage} fillClass={fillCls} label={`${label} budget`} />
    </div>
  );
}