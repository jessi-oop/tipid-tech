// BudgetScreen.jsx
// Screen 2 — Suggested Starting Budget.
// Shows six editable category budget amounts pre-filled with suggested percentages.
// Validates that the total allocation does not exceed the allowance.
// Calls onStart(finalBudgets) when the student clicks "Start Budget".

import { useState } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getTotalAllocated, getBudgetDifference, formatPeso } from '../utils/calculations';

export default function BudgetScreen({ allowance, categoryBudgets, onStart, onBack }) {
  // Local copy of category budgets — edited here before being committed
  const [budgets, setBudgets] = useState(() => {
    // Convert all values to strings for controlled inputs
    const initial = {};
    CATEGORIES.forEach(({ key }) => {
      initial[key] = String(categoryBudgets[key] ?? 0);
    });
    return initial;
  });

  // ─── Derived values ───────────────────────────────────────────
  // Parse current input strings into numbers for calculation
  function getParsedBudgets() {
    const parsed = {};
    CATEGORIES.forEach(({ key }) => {
      parsed[key] = parseFloat(budgets[key]) || 0;
    });
    return parsed;
  }

  const parsedBudgets   = getParsedBudgets();
  const totalAllocated  = getTotalAllocated(parsedBudgets);
  const difference      = getBudgetDifference(allowance, parsedBudgets);
  const isOverBudget    = difference < 0;
  const isBalanced      = difference === 0;

  // ─── Handlers ─────────────────────────────────────────────────
  function handleAmountChange(key, value) {
    // Allow only digits and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBudgets((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleStart() {
    if (isOverBudget) return; // extra guard — button is disabled
    // Convert strings to numbers before passing up
    const finalBudgets = {};
    CATEGORIES.forEach(({ key }) => {
      finalBudgets[key] = parseFloat(budgets[key]) || 0;
    });
    onStart(finalBudgets);
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="screen budget-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label="Go back">
          ← Back
        </button>
        <h2 className="screen-title">Suggested Starting Budget</h2>
        <p className="screen-subtitle">
          This is a general starting point based on your{' '}
          <strong>{formatPeso(allowance)}</strong> allowance.
          Adjust the amounts based on your actual needs.
        </p>
      </div>

      <div className="card budget-form">

        {/* ── Category inputs ──────────────────────────────────── */}
        <div className="category-inputs">
          {CATEGORIES.map(({ key, label, emoji }) => (
            <div className="category-input-row" key={key}>
              <label className="category-input-label" htmlFor={`budget-${key}`}>
                <span className="category-emoji">{emoji}</span>
                <span className="category-name">{label}</span>
              </label>
              <div className="peso-input-wrapper">
                <span className="peso-prefix">₱</span>
                <input
                  id={`budget-${key}`}
                  type="text"
                  inputMode="decimal"
                  className="form-input peso-input category-budget-input"
                  value={budgets[key]}
                  onChange={(e) => handleAmountChange(key, e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Allocation summary ───────────────────────────────── */}
        <div className={`allocation-summary${isOverBudget ? ' allocation-summary--over' : isBalanced ? ' allocation-summary--balanced' : ''}`}>
          <div className="allocation-row">
            <span>Allocated</span>
            <span className="allocation-amounts">
              <strong>{formatPeso(totalAllocated)}</strong>
              {' / '}
              {formatPeso(allowance)}
            </span>
          </div>

          {isOverBudget && (
            <p className="allocation-warning">
              ⚠️ Your budget is{' '}
              <strong>{formatPeso(Math.abs(difference))}</strong> over your allowance.
              Reduce some categories to continue.
            </p>
          )}

          {isBalanced && (
            <p className="allocation-ok">
              ✓ Your budget is balanced.
            </p>
          )}

          {!isOverBudget && !isBalanced && (
            <p className="allocation-under">
              <strong>{formatPeso(difference)}</strong> unallocated — this will
              remain available in your balance.
            </p>
          )}
        </div>

        {/* ── Start Budget button ──────────────────────────────── */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleStart}
          disabled={isOverBudget}
        >
          Start Budget
        </button>

        {isOverBudget && (
          <p className="start-blocked-hint">
            Adjust your category amounts before starting.
          </p>
        )}
      </div>

      {/* ── Prototype disclaimer ─────────────────────────────── */}
      <p className="budget-disclaimer">
        These suggested percentages are a prototype starting point and are not
        professional financial advice.
      </p>
    </div>
  );
}
