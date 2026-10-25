// GoalContributionSummary.jsx
// Read-only modal that shows a full contribution history for a savings goal.
// Fetches contributions and total saved on mount. No contribution form here —
// contributions are added via SavingsGoalCard's inline form.

import { useState, useEffect } from 'react';
import ProgressBar       from './ProgressBar';
import { getContributions, getTotalSaved } from '../utils/storage';
import { getSavingsProgressPercentage, formatPeso } from '../utils/calculations';
import Modal from './ui/Modal';

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

  useEffect(() => {
    Promise.all([getContributions(goal.id), getTotalSaved(goal.id)])
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

  const percentage = getSavingsProgressPercentage(totalSaved, targetAmount);

  const startMs     = new Date(goal.start_date + 'T00:00:00').getTime();
  const endMs       = startMs + durationDays * 24 * 60 * 60 * 1000;
  const todayMs     = new Date().setHours(0, 0, 0, 0);
  const daysLeft    = Math.ceil((endMs - todayMs) / (24 * 60 * 60 * 1000));
  const periodEnded = daysLeft <= 0;

  // ── Footer: single Close button ───────────────────────────────
  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50"
    >
      Close
    </button>
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Modal
      labelId="contrib-summary-title"
      title={goal.name}
      description="A full record of everything you have contributed toward this goal."
      onClose={onClose}
      footer={footer}
    >
      {/* Target */}
      <p className="mb-4 text-sm text-muted">
        Target: <span className="font-semibold text-ink">{formatPeso(targetAmount)}</span>
      </p>

      {loading && <p className="py-6 text-center text-sm text-muted">Loading…</p>}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {/* Progress bar */}
          <ProgressBar
            percentage={percentage}
            fillClass="bg-brand"
            label={`${goal.name} savings progress`}
          />

          {/* Key stats — 2-col, min-w-0 + break-words on values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-gray-200 bg-page p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Saved</p>
              <p className="min-w-0 break-words text-lg font-extrabold text-ink sm:text-xl">
                {formatPeso(totalSaved)}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-gray-200 bg-page p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                {periodEnded ? 'Period' : 'Days Left'}
              </p>
              <p className="min-w-0 break-words text-lg font-extrabold text-ink sm:text-xl">
                {periodEnded ? 'Ended' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Progress % + count */}
          <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
            <span className="min-w-0 text-muted">{Math.round(percentage)}% of goal reached</span>
            <span className="shrink-0 text-muted">
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
                  className={`flex min-w-0 items-center justify-between gap-3 px-4 py-3 ${
                    idx < contributions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs text-muted">{formatContribDate(contrib.created_at)}</span>
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
        </div>
      )}
    </Modal>
  );
}
