// SetupScreen.jsx
// Screen 1 — Welcome screen.
// Centered 480px card with logo + step indicator.
// Student enters their allowance and selects how long it needs to last.
// Calls onComplete(setupData) when the student clicks "Continue".

import { useState } from 'react';
import { PERIOD_OPTIONS } from '../utils/constants';
import StepIndicator from './StepIndicator';

export default function SetupScreen({ onComplete }) {
  const [allowance,         setAllowance]         = useState('');
  const [periodType,        setPeriodType]         = useState('weekly');
  const [nextAllowanceDate, setNextAllowanceDate]  = useState('');
  const [errors,            setErrors]             = useState({});

  // ─── Validation ──────────────────────────────────────────────
  function validate() {
    const newErrors = {};
    const amount = parseFloat(allowance);
    if (!allowance || isNaN(amount) || amount <= 0) {
      newErrors.allowance = 'Please enter a valid allowance amount greater than ₱0.';
    }
    if (periodType === 'date') {
      if (!nextAllowanceDate) {
        newErrors.nextAllowanceDate = 'Please select your next allowance date.';
      } else {
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(nextAllowanceDate + 'T00:00:00');
        if (selected <= today) {
          newErrors.nextAllowanceDate = 'Your next allowance date must be in the future.';
        }
      }
    }
    return newErrors;
  }

  // ─── Submit ───────────────────────────────────────────────────
  function handleContinue(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onComplete({
      allowance,
      periodType,
      nextAllowanceDate: periodType === 'date' ? nextAllowanceDate : '',
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function handleAllowanceChange(e) {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAllowance(value);
      if (errors.allowance) setErrors((prev) => ({ ...prev, allowance: undefined }));
    }
  }

  function handlePeriodChange(e) {
    setPeriodType(e.target.value);
    if (errors.nextAllowanceDate) {
      setErrors((prev) => ({ ...prev, nextAllowanceDate: undefined }));
    }
  }

  function handleDateChange(e) {
    setNextAllowanceDate(e.target.value);
    if (errors.nextAllowanceDate) {
      setErrors((prev) => ({ ...prev, nextAllowanceDate: undefined }));
    }
  }

  function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-10">

      {/* Logo + step indicator */}
      <div className="flex flex-col items-center gap-3 pb-1">
        <img src="/logo-mark.png" alt="TipidTech" className="h-16 w-fit" />
        <StepIndicator current={1} />
      </div>

      {/* Form card */}
      <form
        className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        onSubmit={handleContinue}
        noValidate
      >
        {/* ── Allowance input ───────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="allowance">
            How much money do you have?
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 z-10 font-medium text-muted pointer-events-none">₱</span>
            <input
              id="allowance"
              type="text"
              inputMode="decimal"
              className={`${inputCls(!!errors.allowance)} pl-8`}
              placeholder="0.00"
              value={allowance}
              onChange={handleAllowanceChange}
              autoComplete="off"
            />
          </div>
          {errors.allowance && (
            <p className="mt-0.5 text-sm text-red-600">{errors.allowance}</p>
          )}
        </div>

        {/* ── Budget period ──────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">
            How do you want to set your budget period?
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PERIOD_OPTIONS.map((option) => {
              const selected = periodType === option.key;
              return (
                <label
                  key={option.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors duration-150 select-none ${
                    selected
                      ? 'border-brand bg-brand/10 text-ink'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    value={option.key}
                    checked={selected}
                    onChange={handlePeriodChange}
                    className="h-4 w-4 shrink-0 [accent-color:#80ed99]"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Date picker ───────────────────────────────────── */}
        {periodType === 'date' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink" htmlFor="nextAllowanceDate">
              When will you receive your next allowance?
            </label>
            <input
              id="nextAllowanceDate"
              type="date"
              className={`${inputCls(!!errors.nextAllowanceDate)} max-w-xs`}
              value={nextAllowanceDate}
              min={getTomorrowString()}
              onChange={handleDateChange}
            />
            {errors.nextAllowanceDate && (
              <p className="mt-0.5 text-sm text-red-600">{errors.nextAllowanceDate}</p>
            )}
          </div>
        )}

        {/* ── Continue button ───────────────────────────────── */}
        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark"
        >
          Continue
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        Your data is saved to your account and synced across devices.
      </p>
    </div>
  );
}