// AddExpenseForm.jsx
// Form for recording a new expense.
// Shows an overspend warning when adding the expense would worsen the student's status.
// The student can always proceed — TipidTech is a decision-support tool, not a gatekeeper.

import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import {
  checkOverspendWarning,
  formatPeso,
} from '../utils/calculations';

// Human-readable status labels for the warning message
const STATUS_LABELS = {
  green:  'On Track',
  yellow: 'Be Careful',
  red:    'At Risk',
};

export default function AddExpenseForm({
  allowance,
  expenses,
  periodType,
  nextAllowanceDate,
  startDate,
  categoryBudgets,
  onAdd,
  onCancel,
}) {
  const [amount,      setAmount]      = useState('');
  const [category,    setCategory]    = useState('food');
  const [description, setDescription] = useState('');
  const [errors,      setErrors]      = useState({});
  const [warning,     setWarning]     = useState(null);   // overspend warning object or null
  const [confirmed,   setConfirmed]   = useState(false);  // true after user acknowledges warning

  // ─── Amount change handler ────────────────────────────────────
  function handleAmountChange(e) {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setWarning(null);   // reset warning when amount changes
      setConfirmed(false);
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

  // ─── Submit ───────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const parsedAmount = parseFloat(amount);

    // Check for overspend warning (only if not yet confirmed)
    if (!confirmed) {
      const warningResult = checkOverspendWarning(
        parsedAmount,
        allowance,
        expenses,
        periodType,
        nextAllowanceDate,
        startDate
      );
      if (warningResult) {
        setWarning(warningResult);
        return; // pause — show warning, wait for confirmation
      }
    }

    // All clear — submit the expense
    onAdd({ amount: parsedAmount, category, description });
  }

  // User confirms they want to proceed despite the warning
  function handleConfirmAnyway() {
    setConfirmed(true);
    setWarning(null);
    // Re-submit immediately
    const parsedAmount = parseFloat(amount);
    onAdd({ amount: parsedAmount, category, description });
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

        {/* ── Description ─────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-description">
            Description <span className="optional-label">(optional)</span>
          </label>
          <input
            id="expense-description"
            type="text"
            className="form-input"
            placeholder="e.g. Lunch"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={80}
          />
        </div>

        {/* ── Overspend warning ────────────────────────────────── */}
        {warning && (
          <div className="overspend-warning">
            <p className="overspend-warning-heading">
              ⚠️ This expense will affect your budget.
            </p>
            <p>
              After this expense, you'll have approximately{' '}
              <strong>{formatPeso(warning.newDailyAmount)}/day</strong> remaining.
            </p>
            <p>
              Your status will change from{' '}
              <strong>{STATUS_LABELS[warning.currentStatus] ?? warning.currentStatus}</strong>
              {' '}to{' '}
              <strong>{STATUS_LABELS[warning.newStatus] ?? warning.newStatus}</strong>.
            </p>
            <p className="overspend-remaining-detail">
              Remaining: <strong>{formatPeso(warning.newRemaining)}</strong>
              {' · '}
              {warning.daysRemaining} day{warning.daysRemaining !== 1 ? 's' : ''} left
            </p>
            <div className="overspend-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmAnyway}
              >
                Add Expense Anyway
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Submit button (hidden when warning is shown) ─────── */}
        {!warning && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-full">
              Add Expense
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
