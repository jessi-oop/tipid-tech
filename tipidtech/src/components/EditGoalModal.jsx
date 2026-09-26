// EditGoalModal.jsx
// Modal overlay for editing or deleting an existing savings goal.
// Pre-fills form with the goal's current values.
// Delete requires a two-step confirmation and warns that contributions
// will also be deleted (foreign key cascade handled in deleteGoal).

import { useState } from 'react';
import { X } from 'lucide-react';
import { durationToDays } from '../utils/calculations';
import { updateGoal, deleteGoal } from '../utils/storage';

// Same options as SavingsGoalForm — defined locally per spec
const DURATION_OPTIONS = [
  { key: '1month',  label: '1 Month'  },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
  { key: '1year',   label: '1 Year'   },
  { key: 'custom',  label: 'Custom'   },
];

/** Infer the closest DURATION_OPTIONS key from a raw duration_days value. */
function daysToOptionKey(days) {
  if (days === 30)  return '1month';
  if (days === 90)  return '3months';
  if (days === 180) return '6months';
  if (days === 365) return '1year';
  return 'custom';
}

export default function EditGoalModal({ goal, onSaved, onClose }) {
  const initialKey = daysToOptionKey(Number(goal.duration_days));

  const [name,             setName]             = useState(goal.name);
  const [targetAmount,     setTargetAmount]     = useState(String(goal.target_amount));
  const [duration,         setDuration]         = useState(initialKey);
  const [customMonths,     setCustomMonths]     = useState(
    initialKey === 'custom' ? String(Math.round(Number(goal.duration_days) / 30)) : ''
  );
  const [startDate,        setStartDate]        = useState(goal.start_date);
  const [saving,           setSaving]           = useState(false);
  const [deleting,         setDeleting]         = useState(false);
  const [error,            setError]            = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const busy = saving || deleting;

  // ── Shared input class (mirrors EditExpenseModal / SavingsGoalForm) ──
  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-ink bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors duration-150 appearance-none';
  const labelCls = 'text-sm font-semibold text-ink';

  function handleBackdropClick() {
    if (!busy) onClose();
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) { setError('Please enter a goal name.'); return; }

    const parsed = parseFloat(targetAmount);
    if (!targetAmount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid target amount greater than ₱0.');
      return;
    }

    const parsedCustom = parseInt(customMonths, 10) || 1;
    if (duration === 'custom' && parsedCustom < 1) {
      setError('Custom duration must be at least 1 month.');
      return;
    }

    if (!startDate) { setError('Please select a start date.'); return; }

    const durationDays = durationToDays(duration, parsedCustom);

    setSaving(true);
    try {
      await updateGoal(goal.id, {
        name:          trimmedName,
        target_amount: parsed,
        duration_days: durationDays,
        start_date:    startDate,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error('TipidTech: failed to update goal', err);
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await deleteGoal(goal.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error('TipidTech: failed to delete goal', err);
      setError('Could not delete goal. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-goal-title"
      onClick={handleBackdropClick}
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 id="edit-goal-title" className="text-lg font-bold text-ink">Edit Goal</h3>
          <p className="text-sm text-muted mt-0.5">Update your savings goal details or delete it and all its contribution records.</p>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">

          {/* Goal name */}
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="edit-goal-name">Goal Name</label>
            <input
              id="edit-goal-name"
              type="text"
              className={inputCls}
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
              maxLength={80}
              disabled={busy}
            />
          </div>

          {/* Target amount */}
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="edit-goal-amount">Target Amount (₱)</label>
            <input
              id="edit-goal-amount"
              type="number"
              className={inputCls}
              value={targetAmount}
              onChange={(e) => { setTargetAmount(e.target.value); if (error) setError(''); }}
              min="1"
              step="0.01"
              disabled={busy}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="edit-goal-duration">Saving Duration</label>
            <select
              id="edit-goal-duration"
              className={`${inputCls} cursor-pointer`}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={busy}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Custom months */}
          {duration === 'custom' && (
            <div className="flex flex-col gap-2">
              <label className={labelCls} htmlFor="edit-goal-custom-months">Number of Months</label>
              <input
                id="edit-goal-custom-months"
                type="number"
                className={inputCls}
                placeholder="e.g. 8"
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
                min="1"
                step="1"
                disabled={busy}
              />
            </div>
          )}

          {/* Start date */}
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="edit-goal-start">Start Date</label>
            <input
              id="edit-goal-start"
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); if (error) setError(''); }}
              disabled={busy}
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Save */}
          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

        </form>

        {/* Delete section */}
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={busy}
            className="w-full cursor-pointer rounded-lg border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Delete Goal
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Are you sure you want to delete this goal? All contribution records for this
              goal will also be deleted. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={busy}
                className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
