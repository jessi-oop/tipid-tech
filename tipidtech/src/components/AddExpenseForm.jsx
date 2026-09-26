// AddExpenseForm.jsx
// Form for recording and adding a new expense.
// Inserts directly into Supabase via addExpense().
// Shows an overspend warning when adding the expense would worsen the student's status.
// The student can always proceed — TipidTech is a decision-support tool, not a gatekeeper.

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import {
  checkOverspendWarning,
  buildOverspendWarningDetails,
  formatPeso,
} from '../utils/calculations';
import { addExpense } from '../utils/storage';

const STATUS_LABELS = {
  green:  'On Track',
  yellow: 'Be Careful',
  red:    'At Risk',
};

export default function AddExpenseForm({
  userId,
  budgetId,
  allowance,
  totalSpent,
  periodType,
  nextAllowanceDate,
  startDate,
  categoryBudgets,
  onAdded,
  onCancel,
}) {
  const [amount,    setAmount]    = useState('');
  const [category,  setCategory]  = useState('food');
  const [note,      setNote]      = useState('');
  const [errors,    setErrors]    = useState({});
  const [warning,   setWarning]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  function buildExpensesForCalc() {
    return totalSpent > 0 ? [{ amount: totalSpent }] : [];
  }

  function handleAmountChange(e) {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setWarning(null);
      setSaveError('');
      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  }

  function validate() {
    const newErrors = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₱0.';
    }
    return newErrors;
  }

  async function persistExpense(parsedAmount) {
    setSaving(true);
    setSaveError('');
    try {
      await addExpense(userId, budgetId, {
        amount:   parsedAmount,
        category,
        note:     note.trim() || null,
      });
      onAdded();
    } catch (err) {
      console.error('TipidTech: failed to save expense', err);
      setSaveError('Could not save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const parsedAmount    = parseFloat(amount);
    const expensesForCalc = buildExpensesForCalc();
    const baseWarning     = checkOverspendWarning(
      parsedAmount, allowance, expensesForCalc, periodType, nextAllowanceDate, startDate
    );
    if (baseWarning) {
      const details = buildOverspendWarningDetails(
        parsedAmount, allowance, expensesForCalc, periodType, nextAllowanceDate, startDate
      );
      setWarning(details);
      return;
    }
    persistExpense(parsedAmount);
  }

  function handleConfirmAnyway() {
    setWarning(null);
    persistExpense(parseFloat(amount));
  }

  // ── Shared input classes ──────────────────────────────────────
  const inputCls = (hasError) =>
    `w-full px-4 py-3 border rounded-lg text-base text-ink bg-white transition-colors duration-150 focus:outline-none focus:ring-2 appearance-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-brand focus:ring-brand/15'
    }`;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">Add Expense</h3>
        <button
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* ── Amount ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="expense-amount">
            Amount
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 z-10 font-medium text-muted pointer-events-none">₱</span>
            <input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              className={`${inputCls(!!errors.amount)} pl-8`}
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              autoComplete="off"
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="mt-0.5 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* ── Category (emoji-free) ────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="expense-category">
            Category
          </label>
          <select
            id="expense-category"
            className={`${inputCls(false)} cursor-pointer`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* ── Note ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="expense-note">
            Note{' '}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="expense-note"
            type="text"
            className={inputCls(false)}
            placeholder="e.g. Lunch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
          />
        </div>

        {/* ── Save error ────────────────────────────────────────── */}
        {saveError && (
          <p className="text-sm text-red-600">{saveError}</p>
        )}

        {/* ── Overspend warning ─────────────────────────────────── */}
        {warning && (
          <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="flex items-start gap-2 font-bold text-red-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Adding {formatPeso(warning.expenseAmount)} will change your status from{' '}
                <strong>{STATUS_LABELS[warning.currentStatus] ?? warning.currentStatus}</strong>
                {' '}to{' '}
                <strong>{STATUS_LABELS[warning.newStatus] ?? warning.newStatus}</strong>.
              </span>
            </p>

            <p className="text-sm text-gray-700">
              Your remaining balance would drop from{' '}
              <strong>{formatPeso(warning.currentRemaining)}</strong>
              {' '}to{' '}
              <strong>{formatPeso(warning.newRemaining)}</strong>.
            </p>

            <p className="text-sm text-gray-700">
              Your available daily amount would drop from{' '}
              <strong>{formatPeso(warning.currentDailyAmount)}/day</strong>
              {' '}to{' '}
              <strong>{formatPeso(warning.newDailyAmount)}/day</strong>.
            </p>

            {warning.isOverAllowance && (
              <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-sm font-semibold text-red-600">
                This expense would put you{' '}
                <strong>{formatPeso(warning.overAllowanceBy)}</strong> over your total allowance.
              </p>
            )}

            <p className="text-xs text-gray-400">
              {warning.daysRemaining} day{warning.daysRemaining !== 1 ? 's' : ''} remaining in your budget period.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="min-w-[120px] flex-1 cursor-pointer rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={handleConfirmAnyway}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Add Expense Anyway'}
              </button>
              <button
                type="button"
                className="min-w-[120px] flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Submit button ─────────────────────────────────────── */}
        {!warning && (
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        )}

      </form>
    </div>
  );
}