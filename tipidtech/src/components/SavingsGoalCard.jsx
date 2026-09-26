// SavingsGoalCard.jsx
// Displays a single savings goal with progress bar and contribution form.
// Fetches its own totalSaved from Supabase on mount and after each contribution.

import { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Pencil } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { getTotalSaved, addContribution, markGoalCompleted } from '../utils/storage';
import {
  getSavingsDailyRequired,
  getSavingsWeeklyRequired,
  getSavingsProgressPercentage,
  isSavingsGoalCompleted,
  formatPeso,
} from '../utils/calculations';

export default function SavingsGoalCard({ goal, userId, onGoalUpdated, onEdit, onCardTap }) {
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
  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-ink bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors duration-150 appearance-none';

  // ── Render ────────────────────────────────────────────────────
  if (completed) {
    // Muted completed style with checkmark
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-page p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onCardTap && onCardTap(goal)}
            className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
            aria-label={`View ${goal.name} contributions`}
          >
            <h3 className="text-base font-semibold text-muted">{goal.name}</h3>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-sm font-semibold text-muted">{formatPeso(targetAmount)}</span>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
                className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-200 hover:text-ink"
                aria-label={`Edit ${goal.name}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Completed — {formatPeso(totalSaved)} saved
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onCardTap && onCardTap(goal)}
          className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
          aria-label={`View ${goal.name} contributions`}
        >
          <h3 className="text-base font-semibold text-ink">{goal.name}</h3>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm font-semibold text-muted">{formatPeso(targetAmount)}</span>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
              className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
              aria-label={`Edit ${goal.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Green progress bar */}
      <ProgressBar percentage={percentage} fillClass="bg-brand" label={`${goal.name} progress`} />

      {/* Stats */}
      <p className="text-sm text-muted">
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
          className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-brand bg-brand px-3 py-1.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark hover:border-brand-dark"        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Contribution
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
              className="flex-1 cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
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
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}