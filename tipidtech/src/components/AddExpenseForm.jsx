// AddExpenseForm.jsx
// Form for recording and adding a new expense.
// Inserts directly into Supabase via addExpense().
// Shows an overspend warning when adding the expense would worsen the student's status.
// The student can always proceed — TipidTech is a decision-support tool, not a gatekeeper.

import { useState } from 'react';
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
      await addExpense(userId, {
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
    `w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors duration-150 focus:outline-none focus:ring-2 appearance-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
    }`;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Add Expense</h3>
        <button
          className="text-lg text-gray-400 bg-transparent border-none cursor-pointer px-2 py-1 rounded-md leading-none hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
          onClick={onCancel}
          aria-label="Cancel"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* ── Amount ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900" htmlFor="expense-amount">
            Amount
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400 font-medium pointer-events-none z-10">₱</span>
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
            <p className="text-sm text-red-600 mt-0.5">{errors.amount}</p>
          )}
        </div>

        {/* ── Category ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900" htmlFor="expense-category">
            Category
          </label>
          <select
            id="expense-category"
            className={`${inputCls(false)} cursor-pointer`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map(({ key, label, emoji }) => (
              <option key={key} value={key}>{emoji} {label}</option>
            ))}
          </select>
        </div>

        {/* ── Note ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900" htmlFor="expense-note">
            Note{' '}
            <span className="font-normal text-gray-400">(optional)</span>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-2">
            <p className="font-bold text-red-600">
              ⚠️ Adding {formatPeso(warning.expenseAmount)} will change your status from{' '}
              <strong>{STATUS_LABELS[warning.currentStatus] ?? warning.currentStatus}</strong>
              {' '}to{' '}
              <strong>{STATUS_LABELS[warning.newStatus] ?? warning.newStatus}</strong>.
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
              <p className="text-sm font-semibold text-red-600 bg-red-100 border border-red-200 rounded px-3 py-2">
                ⚠️ This expense would put you{' '}
                <strong>{formatPeso(warning.overAllowanceBy)}</strong> over your total allowance.
              </p>
            )}

            <p className="text-xs text-gray-400">
              {warning.daysRemaining} day{warning.daysRemaining !== 1 ? 's' : ''} remaining in your budget period.
            </p>

            <div className="flex gap-2 flex-wrap pt-2">
              <button
                type="button"
                className="flex-1 min-w-[120px] py-3 px-5 bg-red-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-red-700 disabled:opacity-45 disabled:cursor-not-allowed"
                onClick={handleConfirmAnyway}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Add Expense Anyway'}
              </button>
              <button
                type="button"
                className="flex-1 min-w-[120px] py-3 px-5 bg-white text-gray-900 font-semibold border border-gray-200 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-50 disabled:opacity-45 disabled:cursor-not-allowed"
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
            className="w-full py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        )}

      </form>
    </div>
  );
}
