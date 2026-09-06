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
    const initial = {};
    CATEGORIES.forEach(({ key }) => {
      initial[key] = String(categoryBudgets[key] ?? 0);
    });
    return initial;
  });

  // ─── Derived values ───────────────────────────────────────────
  function getParsedBudgets() {
    const parsed = {};
    CATEGORIES.forEach(({ key }) => {
      parsed[key] = parseFloat(budgets[key]) || 0;
    });
    return parsed;
  }

  const parsedBudgets  = getParsedBudgets();
  const totalAllocated = getTotalAllocated(parsedBudgets);
  const difference     = getBudgetDifference(allowance, parsedBudgets);
  const isOverBudget   = difference < 0;
  const isBalanced     = difference === 0;

  // ─── Handlers ─────────────────────────────────────────────────
  function handleAmountChange(key, value) {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBudgets((prev) => ({ ...prev, [key]: value }));
    }
  }

  function handleStart() {
    if (isOverBudget) return;
    const finalBudgets = {};
    CATEGORIES.forEach(({ key }) => {
      finalBudgets[key] = parseFloat(budgets[key]) || 0;
    });
    onStart(finalBudgets);
  }

  // ── Allocation summary styles ─────────────────────────────────
  const summaryBase = 'p-4 rounded-lg border flex flex-col gap-2';
  const summaryCls = isOverBudget
    ? `${summaryBase} bg-red-50 border-red-200`
    : isBalanced
    ? `${summaryBase} bg-green-50 border-green-200`
    : `${summaryBase} bg-gray-50 border-gray-200`;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-12 flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <button
          className="self-start text-sm font-medium text-blue-600 bg-transparent border-none cursor-pointer p-0 hover:underline"
          onClick={onBack}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Suggested Starting Budget</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          This is a general starting point based on your{' '}
          <strong className="text-gray-900">{formatPeso(allowance)}</strong> allowance.
          Adjust the amounts based on your actual needs.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-5">

        {/* ── Category inputs ──────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {CATEGORIES.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-center gap-3">
              {/* Label */}
              <label
                className="flex items-center gap-2 min-w-[140px] text-sm font-medium text-gray-900 cursor-default"
                htmlFor={`budget-${key}`}
              >
                <span className="text-lg leading-none shrink-0">{emoji}</span>
                <span className="whitespace-nowrap">{label}</span>
              </label>
              {/* Input */}
              <div className="relative flex items-center flex-1 max-w-[180px]">
                <span className="absolute left-4 text-gray-400 font-medium pointer-events-none z-10">₱</span>
                <input
                  id={`budget-${key}`}
                  type="text"
                  inputMode="decimal"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors duration-150 appearance-none"
                  value={budgets[key]}
                  onChange={(e) => handleAmountChange(key, e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Allocation summary ───────────────────────────────── */}
        <div className={summaryCls}>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-700">Allocated</span>
            <span className="text-base">
              <strong>{formatPeso(totalAllocated)}</strong>
              <span className="text-gray-400"> / </span>
              {formatPeso(allowance)}
            </span>
          </div>

          {isOverBudget && (
            <p className="text-sm text-red-600">
              ⚠️ Your budget is{' '}
              <strong>{formatPeso(Math.abs(difference))}</strong> over your allowance.
              Reduce some categories to continue.
            </p>
          )}

          {isBalanced && (
            <p className="text-sm text-green-700">✓ Your budget is balanced.</p>
          )}

          {!isOverBudget && !isBalanced && (
            <p className="text-sm text-gray-500">
              <strong className="text-gray-700">{formatPeso(difference)}</strong> unallocated — this will
              remain available in your balance.
            </p>
          )}
        </div>

        {/* ── Start Budget button ──────────────────────────────── */}
        <button
          className="w-full py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed"
          onClick={handleStart}
          disabled={isOverBudget}
        >
          Start Budget
        </button>

        {isOverBudget && (
          <p className="text-sm text-red-600 text-center -mt-2">
            Adjust your category amounts before starting.
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        These suggested percentages are a prototype starting point and are not
        professional financial advice.
      </p>
    </div>
  );
}
