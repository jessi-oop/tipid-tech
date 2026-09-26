// GoalContributionSummary.jsx
// Read-only modal that shows a full contribution history for a savings goal.
// Fetches contributions and total saved on mount. No contribution form here —
// contributions are added via SavingsGoalCard's inline form.

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ProgressBar       from './ProgressBar';
import { getContributions, getTotalSaved } from '../utils/storage';
import { getSavingsProgressPercentage, formatPeso } from '../utils/calculations';

function formatContribDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function GoalContributionSummary({ goal, userId, onClose }) {
  const [contributions, setContributions] = useState([]);
  const [totalSaved,    setTotalSaved]    = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const targetAmount = Number(goal.target_amount);
  const durationDays = Number(goal.duration_days);

  // ── Fetch on mount ────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      getContributions(goal.id),
      getTotalSaved(goal.id),
    ])
      .then(([contribs, saved]) => {
        setContributions(contribs);
        setTotalSaved(saved);
      })
      .catch((err) => {
        console.error('TipidTech: failed to load contribution summary', err);
        setError('Could not load contribution history. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [goal.id]);

  // ── Derived ───────────────────────────────────────────────────
  const percentage = getSavingsProgressPercentage(totalSaved, targetAmount);

  // Days remaining: start_date + duration_days - today
  const startMs      = new Date(goal.start_date + 'T00:00:00').getTime();
  const endMs        = startMs + durationDays * 24 * 60 * 60 * 1000;
  const todayMs      = new Date().setHours(0, 0, 0, 0);
  const daysLeft     = Math.ceil((endMs - todayMs) / (24 * 60 * 60 * 1000));
  const periodEnded  = daysLeft <= 0;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contrib-summary-title"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h3 id="contrib-summary-title" className="text-lg font-bold text-ink leading-snug">
              {goal.name}
            </h3>
            <p className="text-sm text-muted mt-0.5">A full record of everything you have contributed toward this goal.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Target */}
        <p className="text-sm text-muted">
          Target: <span className="font-semibold text-ink">{formatPeso(targetAmount)}</span>
        </p>

        {loading && (
          <p className="py-6 text-center text-sm text-muted">Loading…</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Progress bar */}
            <ProgressBar
              percentage={percentage}
              fillClass="bg-brand"
              label={`${goal.name} savings progress`}
            />

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-page p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Saved</p>
                <p className="text-base font-extrabold text-ink">{formatPeso(totalSaved)}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-page p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {periodEnded ? 'Period' : 'Days Left'}
                </p>
                <p className="text-base font-extrabold text-ink">
                  {periodEnded ? 'Ended' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Progress percentage + contribution count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{Math.round(percentage)}% of goal reached</span>
              <span className="text-muted">
                {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Contribution list */}
            {contributions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                No contributions yet — start saving to see your history here.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {contributions.map((contrib, idx) => (
                  <div
                    key={contrib.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 ${
                      idx < contributions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-xs text-muted">
                        {formatContribDate(contrib.created_at)}
                      </span>
                      {contrib.note && (
                        <span className="truncate text-xs text-muted">{contrib.note}</span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      +{formatPeso(contrib.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50"
        >
          Close
        </button>

      </div>
    </div>
  );
}
