// AddExpenseForm.jsx
// Form for recording a new expense.
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

// Human-readable status labels for the warning message
const STATUS_LABELS = {
  green:  'On Track',
  yellow: 'Be Careful',
  red:    'At Risk',
};

export default function AddExpenseForm({
  userId,
  allowance,
  totalSpent,      // total amount spent so far in this budget period (from Supabase)
  periodType,
  nextAllowanceDate,
  startDate,
  categoryBudgets,
  onAdded,         // called with no args after a successful insert
  onCancel,
}) {
  const [amount,      setAmount]      = useState('');
  const [category,    setCategory]    = useState('food');
  const [note,        setNote]        = useState('');
  const [errors,      setErrors]      = useState({});
  const [warning,     setWarning]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');

  // Build a synthetic expenses array for checkOverspendWarning
  // (calculations.js expects [{ amount }]; we use totalSpent as a single entry)
  function buildExpensesForCalc() {
    return totalSpent > 0 ? [{ amount: totalSpent }] : [];
  }

  // ─── Amount change handler ────────────────────────────────────
  function handleAmountChange(e) {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setWarning(null);
      setSaveError('');
      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  }

  // ─── Validation ───────────────────────────────────────────────
  function validate() {
    const newErrors = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₱0.';
    }
    return newErrors;
  }

  // ─── Submit to Supabase ───────────────────────────────────────
  async function persistExpense(parsedAmount) {
    setSaving(true);
    setSaveError('');
    try {
      await addExpense(userId, {
        amount:   parsedAmount,
        category,
        note:     note.trim() || null,
      });
      onAdded(); // tell Dashboard to refresh
    } catch (err) {
      console.error('TipidTech: failed to save expense', err);
      setSaveError('Could not save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ─── First submit — run validation + warning check ────────────
  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const parsedAmount    = parseFloat(amount);
    const expensesForCalc = buildExpensesForCalc();

    // checkOverspendWarning detects whether status worsens — logic unchanged from V1
    const baseWarning = checkOverspendWarning(
      parsedAmount,
      allowance,
      expensesForCalc,
      periodType,
      nextAllowanceDate,
      startDate
    );

    if (baseWarning) {
      // Build the full detail object required by REQ-07
      const details = buildOverspendWarningDetails(
        parsedAmount,
        allowance,
        expensesForCalc,
        periodType,
        nextAllowanceDate,
        startDate
      );
      setWarning(details);
      return; // pause — wait for confirmation
    }

    // No warning — save immediately
    persistExpense(parsedAmount);
  }

  // User confirms they want to proceed despite the warning
  function handleConfirmAnyway() {
    setWarning(null);
    persistExpense(parseFloat(amount));
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="add-expense-form card">
      <div className="form-header">
        <h3 className="form-title">Add Expense</h3>
        <button className="btn-close" onClick={onCancel} aria-label="Cancel">✕</button>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Amount ─────────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-amount">Amount</label>
          <div className="peso-input-wrapper">
            <span className="peso-prefix">₱</span>
            <input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              className={`form-input peso-input${errors.amount ? ' input-error' : ''}`}
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              autoComplete="off"
              autoFocus
            />
          </div>
          {errors.amount && <p className="error-message">{errors.amount}</p>}
        </div>

        {/* ── Category ────────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-category">Category</label>
          <select
            id="expense-category"
            className="form-input form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map(({ key, label, emoji }) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Note ─────────────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-note">
            Note <span className="optional-label">(optional)</span>
          </label>
          <input
            id="expense-note"
            type="text"
            className="form-input"
            placeholder="e.g. Lunch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
          />
        </div>

        {/* ── Save error ───────────────────────────────────────── */}
        {saveError && (
          <p className="error-message">{saveError}</p>
        )}

        {/* ── Overspend warning ────────────────────────────────── */}
        {warning && (
          <div className="overspend-warning">
            <p className="overspend-warning-heading">
              ⚠️ Adding {formatPeso(warning.expenseAmount)} will change your status from{' '}
              <strong>{STATUS_LABELS[warning.currentStatus] ?? warning.currentStatus}</strong>
              {' '}to{' '}
              <strong>{STATUS_LABELS[warning.newStatus] ?? warning.newStatus}</strong>.
            </p>

            <p>
              Your remaining balance would drop from{' '}
              <strong>{formatPeso(warning.currentRemaining)}</strong>
              {' '}to{' '}
              <strong>{formatPeso(warning.newRemaining)}</strong>.
            </p>

            <p>
              Your available daily amount would drop from{' '}
              <strong>{formatPeso(warning.currentDailyAmount)}/day</strong>
              {' '}to{' '}
              <strong>{formatPeso(warning.newDailyAmount)}/day</strong>.
            </p>

            {warning.isOverAllowance && (
              <p className="overspend-over-allowance">
                ⚠️ This expense would put you{' '}
                <strong>{formatPeso(warning.overAllowanceBy)}</strong> over your total allowance.
              </p>
            )}

            <p className="overspend-remaining-detail">
              {warning.daysRemaining} day{warning.daysRemaining !== 1 ? 's' : ''} remaining in your budget period.
            </p>

            <div className="overspend-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmAnyway}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Add Expense Anyway'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Submit button (hidden when warning is shown) ─────── */}
        {!warning && (
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
