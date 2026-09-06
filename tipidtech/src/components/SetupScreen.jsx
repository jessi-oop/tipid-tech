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
        // Date must be in the future
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

  // Only allow digits and one decimal point in the allowance field
  function handleAllowanceChange(e) {
    const value = e.target.value;
    // Allow empty, digits, and up to one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAllowance(value);
      // Clear error as user types
      if (errors.allowance) setErrors((prev) => ({ ...prev, allowance: undefined }));
    }
  }

  function handlePeriodChange(e) {
    setPeriodType(e.target.value);
    // Clear date error when period changes
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

  // Minimum date for the date picker — tomorrow
  function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="screen setup-screen">
      <div className="setup-hero">
        <h1 className="app-title">TipidTech</h1>
        <p className="app-tagline">Make your allowance last.</p>
      </div>

      <form className="setup-form card" onSubmit={handleContinue} noValidate>

        {/* ── Allowance input ─────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="allowance">
            How much money do you have?
          </label>
          <div className="peso-input-wrapper">
            <span className="peso-prefix">₱</span>
            <input
              id="allowance"
              type="text"
              inputMode="decimal"
              className={`form-input peso-input${errors.allowance ? ' input-error' : ''}`}
              placeholder="0.00"
              value={allowance}
              onChange={handleAllowanceChange}
              autoComplete="off"
            />
          </div>
          {errors.allowance && (
            <p className="error-message">{errors.allowance}</p>
          )}
        </div>

        {/* ── Budget period ────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label">
            How do you want to set your budget period?
          </label>
          <div className="period-options">
            {PERIOD_OPTIONS.map((option) => (
              <label
                key={option.key}
                className={`period-option${periodType === option.key ? ' period-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="periodType"
                  value={option.key}
                  checked={periodType === option.key}
                  onChange={handlePeriodChange}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Date picker (only shown for "Next allowance date") ── */}
        {periodType === 'date' && (
          <div className="form-group">
            <label className="form-label" htmlFor="nextAllowanceDate">
              When will you receive your next allowance?
            </label>
            <input
              id="nextAllowanceDate"
              type="date"
              className={`form-input${errors.nextAllowanceDate ? ' input-error' : ''}`}
              value={nextAllowanceDate}
              min={getTomorrowString()}
              onChange={handleDateChange}
            />
            {errors.nextAllowanceDate && (
              <p className="error-message">{errors.nextAllowanceDate}</p>
            )}
          </div>
        )}

        {/* ── Continue button ─────────────────────────────────── */}
        <button type="submit" className="btn btn-primary btn-full">
          Continue
        </button>

      </form>

      <p className="setup-disclaimer">
        Your data is saved to your account and synced across devices.
      </p>
    </div>
  );
}
