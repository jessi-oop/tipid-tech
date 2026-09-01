// CategoryBar.jsx
// Displays a single budget category as a progress bar row.
// Shows: emoji + name, amount spent vs. budget, visual progress bar.
// Highlights in red when spending exceeds the category budget.

import { formatPeso } from '../utils/calculations';

export default function CategoryBar({ emoji, label, spent, budget }) {
  // Progress as a percentage, capped at 100% for the bar width
  // (over-budget state is shown separately via colour)
  const percentage    = budget > 0 ? (spent / budget) * 100 : 0;
  const displayWidth  = Math.min(100, percentage);
  const isOver        = spent > budget;
  const isFull        = spent === budget;

  return (
    <div className={`category-bar${isOver ? ' category-bar--over' : ''}`}>
      {/* Label row */}
      <div className="category-bar-header">
        <span className="category-bar-name">
          <span className="category-emoji">{emoji}</span>
          {label}
        </span>
        <span className={`category-bar-amounts${isOver ? ' category-bar-amounts--over' : ''}`}>
          {formatPeso(spent)}
          <span className="category-bar-separator"> / </span>
          {formatPeso(budget)}
          {isOver && <span className="over-label"> Over budget</span>}
        </span>
      </div>

      {/* Progress bar track */}
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`progress-fill${isOver ? ' progress-fill--over' : isFull ? ' progress-fill--full' : ''}`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}
