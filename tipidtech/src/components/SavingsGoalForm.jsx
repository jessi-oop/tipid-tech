// SavingsGoalForm.jsx
// Form for creating a new savings goal.
// Shows a live preview of daily/weekly required amounts as the user types.
// On submit: computes duration_days, inserts into savings_goals via createSavingsGoal().

import { useState } from 'react';
import { createSavingsGoal } from '../utils/storage';
import {
  durationToDays,
  getSavingsDailyRequired,
  getSavingsWeeklyRequired,
  formatPeso,
} from '../utils/calculations';

const DURATION_OPTIONS = [
  { key: '1month',  label: '1 Month' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
  { key: '1year',   label: '1 Year' },
  { key: 'custom',  label: 'Custom' },
];

export default function SavingsGoalForm({ userId, onCreated, onCancel }) {
  const [name,         setName]         = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [duration,     setDuration]     = useState('1month');
  const [customMonths, setCustomMonths] = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  // ── Live preview ──────────────────────────────────────────────
  const parsedAmount = parseFloat(targetAmount) || 0;
  const parsedCustom = parseInt(customMonths, 10) || 1;
  const previewDays  = durationToDays(duration, parsedCustom);
  const dailyNeeded  = parsedAmount > 0 ? getSavingsDailyRequired(parsedAmount, previewDays)  : null;
  const weeklyNeeded = parsedAmount > 0 ? getSavingsWeeklyRequired(parsedAmount, previewDays) : null;

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) { setError('Please enter a goal name.'); return; }
    if (parsedAmount <= 0) { setError('Please enter a valid target amount.'); return; }
    if (duration === 'custom' && parsedCustom < 1) {
      setError('Custom duration must be at least 1 month.');
      return;
    }

    const today        = new Date().toISOString().split('T')[0];
    const durationDays = durationToDays(duration, parsedCustom);

    setSubmitting(true);
    try {
      await createSavingsGoal(userId, {
        name:          trimmedName,
        target_amount: parsedAmount,
        duration_days: durationDays,
        start_date:    today,
      });
      onCreated();
    } catch (err) {
      console.error('TipidTech: failed to create savings goal', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Shared input class ────────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-ink bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors duration-150 appearance-none';
  const labelCls = 'text-sm font-semibold text-ink';

  // ── Render ────────────────────────────────────────────────────
  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
      noValidate
    >
      <h3 className="text-lg font-bold text-ink">New Savings Goal</h3>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Goal name */}
      <div className="flex flex-col gap-2">
        <label className={labelCls} htmlFor="goal-name">Goal Name</label>
        <input
          id="goal-name"
          type="text"
          className={inputCls}
          placeholder="e.g. New Phone, Laptop"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
        />
      </div>

      {/* Target amount */}
      <div className="flex flex-col gap-2">
        <label className={labelCls} htmlFor="goal-amount">Target Amount (₱)</label>
        <input
          id="goal-amount"
          type="number"
          className={inputCls}
          placeholder="e.g. 25000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          min="1"
          step="0.01"
          required
        />
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <label className={labelCls} htmlFor="goal-duration">Saving Duration</label>
        <select
          id="goal-duration"
          className={`${inputCls} cursor-pointer`}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Custom months */}
      {duration === 'custom' && (
        <div className="flex flex-col gap-2">
          <label className={labelCls} htmlFor="goal-custom-months">Number of Months</label>
          <input
            id="goal-custom-months"
            type="number"
            className={inputCls}
            placeholder="e.g. 8"
            value={customMonths}
            onChange={(e) => setCustomMonths(e.target.value)}
            min="1"
            step="1"
            required
          />
        </div>
      )}

      {/* Live preview */}
      {dailyNeeded !== null && (
        <div className="flex flex-col gap-1 rounded-lg border border-brand/30 bg-brand/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            To reach your goal you need to save:
          </p>
          <p className="text-base font-bold text-ink">
            {formatPeso(dailyNeeded)}<span className="text-sm font-medium text-muted">/day</span>
          </p>
          <p className="text-base font-bold text-ink">
            {formatPeso(weeklyNeeded)}<span className="text-sm font-medium text-muted">/week</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? 'Saving…' : 'Create Goal'}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}