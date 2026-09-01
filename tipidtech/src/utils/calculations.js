// calculations.js
// Pure functions for all TipidTech budget calculations.
// No side effects — every function takes inputs and returns a value.

import { SUGGESTED_PERCENTAGES, STATUS, STATUS_THRESHOLDS } from './constants';

// ─── Helpers ──────────────────────────────────────────────────────

// Convert a date string or Date object to a plain calendar date (no time).
// Using noon UTC avoids daylight-saving edge cases when comparing dates.
function toCalendarDate(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12));
}

// Number of whole days between two dates (b - a), floored.
function daysBetween(dateA, dateB) {
  const a = toCalendarDate(dateA);
  const b = toCalendarDate(dateB);
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

// ─── Period / Days ────────────────────────────────────────────────

/**
 * Get the total number of days in the budget period.
 * For 'date', calculates days from startDate to nextAllowanceDate.
 * Minimum is 1 to avoid division-by-zero.
 */
export function getTotalDays(periodType, nextAllowanceDate, startDate) {
  if (periodType === 'daily')   return 1;
  if (periodType === 'weekly')  return 7;
  if (periodType === 'monthly') return 30;
  if (periodType === 'date') {
    const days = daysBetween(startDate, nextAllowanceDate);
    return Math.max(1, days);
  }
  return 1; // fallback
}

/**
 * Get the number of days remaining from today until the end of the period.
 * Clamps to 0 if the period has ended.
 */
export function getDaysRemaining(periodType, nextAllowanceDate, startDate) {
  const totalDays   = getTotalDays(periodType, nextAllowanceDate, startDate);
  const elapsed     = daysBetween(startDate, new Date());
  const remaining   = totalDays - elapsed;
  return Math.max(0, remaining);
}

// ─── Spending ─────────────────────────────────────────────────────

/**
 * Sum of all expense amounts.
 */
export function getTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Remaining balance = allowance - total spent.
 */
export function getRemainingBalance(allowance, expenses) {
  return allowance - getTotalSpent(expenses);
}

/**
 * Amount spent per main category (excludes 'other').
 * Returns an object keyed by category key.
 */
export function getCategorySpending(expenses) {
  const spending = {
    food: 0, transportation: 0, school: 0,
    personal: 0, savings: 0, emergency: 0,
  };
  expenses.forEach((e) => {
    if (e.category in spending) {
      spending[e.category] += e.amount;
    }
  });
  return spending;
}

/**
 * Total amount spent under the 'other' category.
 */
export function getOtherSpending(expenses) {
  return expenses
    .filter((e) => e.category === 'other')
    .reduce((sum, e) => sum + e.amount, 0);
}

// ─── Daily Amounts ────────────────────────────────────────────────

/**
 * Planned daily amount — what a perfectly even spread would look like.
 * Set once when the budget starts; does not change as expenses are added.
 */
export function getPlannedDailyAmount(allowance, totalDays) {
  if (totalDays <= 0) return 0;
  return allowance / totalDays;
}

/**
 * Current approximate daily amount available.
 * Answers: "If I spread my remaining money evenly over remaining days,
 * how much is that per day?"
 */
export function getCurrentDailyAmount(remainingBalance, daysRemaining) {
  if (daysRemaining <= 0) return 0;
  return remainingBalance / daysRemaining;
}

// ─── Spending Status ──────────────────────────────────────────────

/**
 * Calculate the spending status based on:
 *   ratio = currentDailyAmount / plannedDailyAmount
 *
 * Prototype thresholds (not research-validated):
 *   ratio >= 0.80 → Green  (On Track)
 *   ratio >= 0.50 → Yellow (Be Careful)
 *   ratio <  0.50 → Red    (At Risk)
 *
 * Returns an object: { status, ratio, currentDaily, plannedDaily }
 */
export function getSpendingStatus(allowance, expenses, periodType, nextAllowanceDate, startDate) {
  const remainingBalance = getRemainingBalance(allowance, expenses);
  const daysRemaining    = getDaysRemaining(periodType, nextAllowanceDate, startDate);
  const totalDays        = getTotalDays(periodType, nextAllowanceDate, startDate);
  const plannedDaily     = getPlannedDailyAmount(allowance, totalDays);
  const currentDaily     = getCurrentDailyAmount(remainingBalance, daysRemaining);

  // Period has ended
  if (daysRemaining <= 0) {
    return { status: STATUS.ENDED, ratio: null, currentDaily: 0, plannedDaily };
  }

  // Allowance fully spent (or overspent)
  if (remainingBalance <= 0) {
    return { status: STATUS.RED, ratio: 0, currentDaily: 0, plannedDaily };
  }

  const ratio = currentDaily / plannedDaily;

  if (ratio >= STATUS_THRESHOLDS.GREEN)  return { status: STATUS.GREEN,  ratio, currentDaily, plannedDaily };
  if (ratio >= STATUS_THRESHOLDS.YELLOW) return { status: STATUS.YELLOW, ratio, currentDaily, plannedDaily };
  return                                        { status: STATUS.RED,    ratio, currentDaily, plannedDaily };
}

// ─── Overspend Warning ────────────────────────────────────────────

/**
 * Check whether adding an expense would make the student's status worse.
 * Returns an object describing the impact, or null if no warning is needed.
 *
 * A warning is shown when the new status is WORSE than the current status:
 *   Green → Yellow, Green → Red, Yellow → Red
 *
 * The student can always still proceed.
 */
export function checkOverspendWarning(
  enteredAmount,
  allowance,
  expenses,
  periodType,
  nextAllowanceDate,
  startDate
) {
  const currentStatusResult = getSpendingStatus(
    allowance, expenses, periodType, nextAllowanceDate, startDate
  );

  // Calculate what the status would be after adding this expense
  const simulatedExpenses = [
    ...expenses,
    { amount: enteredAmount, category: '_preview', description: '' },
  ];
  const newStatusResult = getSpendingStatus(
    allowance, simulatedExpenses, periodType, nextAllowanceDate, startDate
  );

  const statusOrder = { [STATUS.GREEN]: 0, [STATUS.YELLOW]: 1, [STATUS.RED]: 2, [STATUS.ENDED]: 3 };
  const currentOrder = statusOrder[currentStatusResult.status] ?? 0;
  const newOrder     = statusOrder[newStatusResult.status] ?? 0;

  // Only warn if status gets worse
  if (newOrder <= currentOrder) return null;

  const daysRemaining = getDaysRemaining(periodType, nextAllowanceDate, startDate);
  const newRemaining  = getRemainingBalance(allowance, simulatedExpenses);

  return {
    currentStatus:   currentStatusResult.status,
    newStatus:       newStatusResult.status,
    newRemaining,
    newDailyAmount:  getCurrentDailyAmount(newRemaining, daysRemaining),
    daysRemaining,
  };
}

// ─── Budget Setup Calculations ────────────────────────────────────

/**
 * Generate suggested category budgets from allowance using prototype percentages.
 * Amounts are rounded to whole pesos.
 */
export function getSuggestedBudgets(allowance) {
  const budgets = {};
  Object.entries(SUGGESTED_PERCENTAGES).forEach(([key, pct]) => {
    budgets[key] = Math.round(allowance * pct);
  });
  return budgets;
}

/**
 * Sum of all six category budget allocations.
 */
export function getTotalAllocated(categoryBudgets) {
  return Object.values(categoryBudgets).reduce((sum, v) => sum + (v || 0), 0);
}

/**
 * Difference between allowance and total allocated.
 * Positive = under-allocated (allowed).
 * Negative = over-allocated (block Start Budget).
 */
export function getBudgetDifference(allowance, categoryBudgets) {
  return allowance - getTotalAllocated(categoryBudgets);
}

// ─── Formatting Helpers ───────────────────────────────────────────

/**
 * Format a number as Philippine Peso.
 * e.g. 1234.5 → "₱1,235"
 * Always rounds to whole pesos for display.
 */
export function formatPeso(amount) {
  const rounded = Math.round(amount);
  return '₱' + rounded.toLocaleString('en-PH');
}
