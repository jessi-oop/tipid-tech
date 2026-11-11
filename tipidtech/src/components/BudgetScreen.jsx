// BudgetScreen.jsx
// Screen 2 — Suggested Starting Budget.
// Shows six editable category budget amounts pre-filled with suggested percentages.
// Validates that the total allocation does not exceed the allowance.
// Calls onStart(finalBudgets) when the student clicks "Start Budget".

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { getTotalAllocated, getBudgetDifference, formatPeso } from '../utils/calculations';
import CategoryIcon    from './CategoryIcon';
import StepIndicator   from './StepIndicator';
import Card            from './ui/Card';
import SectionHeader   from './ui/SectionHeader';

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
    <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-5 px-4 py-10">

      {/* Logo + step indicator */}
      <div className="flex flex-col items-center gap-3 pb-1">
        <img src="/logo-mark.png" alt="TipidTech" className="h-16 w-auto max-w-[160px] object-contain" />
        <StepIndicator current={2} />
      </div>

      {/* Header — Back button above SectionHeader, outside it per spec */}
      <div className="flex flex-col gap-2">
        <button
          className="flex w-fit cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink hover:underline"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <SectionHeader
          as="h2"
          title="Suggested Starting Budget"
          description={
            <>
              This is a general starting point based on your{' '}
              <strong className="text-ink">{formatPeso(allowance)}</strong> allowance.
              Adjust the amounts based on your actual needs.
            </>
          }
        />
      </div>
      <Card className="flex flex-col gap-5">

        {/* ── Category inputs ───────────────────────────────────
            Mobile: label stacks above input (flex-col).
            xs+:    label and input side-by-side (xs:flex-row).
            Removed min-w-[140px] and whitespace-nowrap — label
            wraps freely, icon+text are in a flex row with min-w-0.
        ── */}
        <div className="flex flex-col gap-4">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5 xs:flex-row xs:items-center xs:gap-3">
              <label
                className="flex min-w-0 shrink-0 cursor-default items-center gap-2 text-sm font-medium text-ink xs:w-[9rem]"
                htmlFor={`budget-${key}`}
              >
                <CategoryIcon category={key} className="h-4 w-4 shrink-0 text-muted" />
                <span className="min-w-0">{label}</span>
              </label>
              <div className="relative flex flex-1 items-center">
                <span className="absolute left-4 z-10 font-medium text-muted pointer-events-none">₱</span>
                <input
                  id={`budget-${key}`}
                  type="text"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-8 text-base text-ink transition-colors duration-150 appearance-none focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
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
          <div className="flex min-w-0 items-center justify-between gap-2 text-sm font-medium">
            <span className="shrink-0 text-gray-700">Allocated</span>
            <span className="min-w-0 break-words text-base">
              <strong>{formatPeso(totalAllocated)}</strong>
              <span className="text-gray-400"> / </span>
              {formatPeso(allowance)}
            </span>
          </div>

          {isOverBudget && (
            <p className="text-sm text-red-600">
              Your budget is{' '}
              <strong>{formatPeso(Math.abs(difference))}</strong> over your allowance.
              Reduce some categories to continue.
            </p>
          )}
          {isBalanced && (
            <p className="text-sm text-green-700">Your budget is balanced.</p>
          )}
          {!isOverBudget && !isBalanced && (
            <p className="text-sm text-muted">
              <strong className="text-gray-700">{formatPeso(difference)}</strong> unallocated — this will
              remain available in your balance.
            </p>
          )}
        </div>

        {/* ── Start Budget button ──────────────────────────────── */}
        <button
          className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
          onClick={handleStart}
          disabled={isOverBudget}
        >
          Start Budget
        </button>

        {isOverBudget && (
          <p className="text-center text-sm text-red-600">
            Adjust your category amounts before starting.
          </p>
        )}
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs leading-relaxed text-muted">
        These suggested percentages are a prototype starting point and are not
        professional financial advice.
      </p>
    </div>
  );
}
