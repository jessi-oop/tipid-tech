// SetupScreen.jsx
// Screen 1 — Welcome screen.
// Student enters their allowance and selects how long it needs to last.
// Calls onComplete(setupData) when the student clicks "Continue".

import { useState } from 'react';
import { PERIOD_OPTIONS } from '../utils/constants';

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
    `w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors duration-150 focus:outline-none focus:ring-2 appearance-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
    }`;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-12 pb-12 flex flex-col gap-5">

      {/* Hero */}
      <div className="text-center pb-2">
        <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight">TipidTech</h1>
        <p className="text-lg text-gray-500 mt-1">Make your allowance last.</p>
      </div>

      {/* Form card */}
      <form
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-5"
        onSubmit={handleContinue}
        noValidate
      >
        {/* ── Allowance input ───────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900" htmlFor="allowance">
            How much money do you have?
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400 font-medium pointer-events-none z-10">₱</span>
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
            <p className="text-sm text-red-600 mt-0.5">{errors.allowance}</p>
          )}
        </div>

        {/* ── Budget period ──────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">
            How do you want to set your budget period?
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PERIOD_OPTIONS.map((option) => {
              const selected = periodType === option.key;
              return (
                <label
                  key={option.key}
                  className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-150 select-none ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    value={option.key}
                    checked={selected}
                    onChange={handlePeriodChange}
                    className="accent-blue-600 w-4 h-4 shrink-0"
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
            <label className="text-sm font-semibold text-gray-900" htmlFor="nextAllowanceDate">
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
              <p className="text-sm text-red-600 mt-0.5">{errors.nextAllowanceDate}</p>
            )}
          </div>
        )}

        {/* ── Continue button ───────────────────────────────── */}
        <button
          type="submit"
          className="w-full py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700"
        >
          Continue
        </button>
      </form>

      <p className="text-sm text-gray-400 text-center">
        Your data is saved to your account and synced across devices.
      </p>
    </div>
  );
}
