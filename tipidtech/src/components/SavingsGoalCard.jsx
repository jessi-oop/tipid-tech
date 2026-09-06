// SavingsGoalCard.jsx
// Displays a single savings goal with progress bar and contribution form.
// Fetches its own totalSaved from Supabase on mount and after each contribution.

import { useState, useEffect } from 'react';
import { getTotalSaved, addContribution, markGoalCompleted } from '../utils/storage';
import {
  getSavingsDailyRequired,
  getSavingsWeeklyRequired,
  getSavingsProgressPercentage,
  isSavingsGoalCompleted,
  formatPeso,
} from '../utils/calculations';

export default function SavingsGoalCard({ goal, userId, onGoalUpdated }) {
  const [totalSaved,   setTotalSaved]   = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(true);

  // Contribution form state
  const [showForm,      setShowForm]      = useState(false);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote,   setContribNote]   = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [formError,     setFormError]     = useState('');

  // ── Load total saved ──────────────────────────────────────────
  useEffect(() => { fetchTotal(); }, [goal.id]);

  async function fetchTotal() {
    setLoadingTotal(true);
    try {
      setTotalSaved(await getTotalSaved(goal.id));
    } catch (err) {
      console.error('TipidTech: failed to load total saved', err);
    } finally {
      setLoadingTotal(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────
  const targetAmount   = Number(goal.target_amount);
  const durationDays   = Number(goal.duration_days);
  const dailyRequired  = getSavingsDailyRequired(targetAmount, durationDays);
  const weeklyRequired = getSavingsWeeklyRequired(targetAmount, durationDays);
  const percentage     = getSavingsProgressPercentage(totalSaved, targetAmount);
  const completed      = goal.is_completed || isSavingsGoalCompleted(totalSaved, targetAmount);

  // ── Add contribution ──────────────────────────────────────────
  async function handleContribSubmit(e) {
    e.preventDefault();
    setFormError('');

    const parsed = parseFloat(contribAmount);
    if (!parsed || parsed <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      await addContribution(userId, goal.id, {
        amount: parsed,
        note:   contribNote.trim() || null,
      });

      const newTotal = await getTotalSaved(goal.id);
      setTotalSaved(newTotal);

      if (!goal.is_completed && isSavingsGoalCompleted(newTotal, targetAmount)) {
        await markGoalCompleted(goal.id);
      }

      setContribAmount('');
      setContribNote('');
      setShowForm(false);
      if (onGoalUpdated) onGoalUpdated();
    } catch (err) {
      console.error('TipidTech: failed to add contribution', err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Shared input class ────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors duration-150 appearance-none';

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 ${completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>

      {/* Header row */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-semibold text-gray-900">{goal.name}</h3>
        <span className="text-sm font-semibold text-gray-500 shrink-0">{formatPeso(targetAmount)}</span>
      </div>

      {completed ? (
        // ── Completed state ──────────────────────────────────
        <p className="text-sm font-semibold text-green-700">
          ✅ Completed — {formatPeso(totalSaved)} saved
        </p>
      ) : (
        // ── Active state ─────────────────────────────────────
        <>
          {/* Progress bar */}
          <div
            className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${goal.name} progress`}
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Stats */}
          <p className="text-sm text-gray-500">
            {loadingTotal
              ? 'Loading…'
              : `${formatPeso(totalSaved)} saved of ${formatPeso(targetAmount)} (${Math.round(percentage)}%)`
            }
          </p>
          <p className="text-xs text-gray-400">
            Save {formatPeso(dailyRequired)}/day or {formatPeso(weeklyRequired)}/week
          </p>

          {/* Add Contribution */}
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="self-start text-sm font-semibold text-blue-600 bg-transparent border border-blue-200 rounded-lg px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:bg-blue-50"
            >
              + Add Contribution
            </button>
          ) : (
            <form className="flex flex-col gap-2" onSubmit={handleContribSubmit} noValidate>
              {formError && (
                <p className="text-xs text-red-600">{formError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Amount (₱)"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  aria-label="Contribution amount"
                />
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Note (optional)"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  maxLength={120}
                  aria-label="Contribution note"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowForm(false);
                    setContribAmount('');
                    setContribNote('');
                    setFormError('');
                  }}
                  className="flex-1 py-2 px-4 bg-white text-gray-900 text-sm font-semibold border border-gray-200 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-50 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
