// constants.js
// Centralised configuration for TipidTech V1.
// Prototype rules — not research-validated financial thresholds.

// ─── Budget categories ────────────────────────────────────────────
// These are the six main budget categories shown throughout the app.
export const CATEGORIES = [
  { key: 'food',           label: 'Food',           emoji: '🍚' },
  { key: 'transportation', label: 'Transportation',  emoji: '🚌' },
  { key: 'school',         label: 'School',          emoji: '📚' },
  { key: 'personal',       label: 'Personal',        emoji: '🧴' },
  { key: 'savings',        label: 'Savings',         emoji: '💰' },
  { key: 'emergency',      label: 'Emergency',       emoji: '🏥' },
];

// The "Other" category is available when adding expenses but does NOT
// appear as one of the six budget category bars.
export const OTHER_CATEGORY = { key: 'other', label: 'Other', emoji: '📌' };

// All expense categories (the 6 main ones + Other)
export const EXPENSE_CATEGORIES = [...CATEGORIES, OTHER_CATEGORY];

// ─── Suggested budget percentages ────────────────────────────────
// Used on the Budget Setup screen to pre-fill category amounts.
// These are prototype starting points — students should adjust them.
export const SUGGESTED_PERCENTAGES = {
  food:           0.30,
  transportation: 0.20,
  school:         0.15,
  personal:       0.10,
  savings:        0.15,
  emergency:      0.10,
};

// ─── Budget period options ────────────────────────────────────────
export const PERIOD_OPTIONS = [
  { key: 'daily',   label: 'Daily',               days: 1  },
  { key: 'weekly',  label: 'Weekly',               days: 7  },
  { key: 'monthly', label: 'Monthly',              days: 30 },
  { key: 'date',    label: 'Next allowance date',  days: null }, // calculated from date
];

// ─── Spending status thresholds ───────────────────────────────────
// These are simple prototype rules.
// ratio = currentDailyAmount / plannedDailyAmount
// A ratio of 1.0 means the student is exactly on pace.
export const STATUS_THRESHOLDS = {
  GREEN:  0.80, // ratio >= 0.80 → On Track
  YELLOW: 0.50, // ratio >= 0.50 and < 0.80 → Be Careful
  // ratio < 0.50 → At Risk (Red)
};

// Status keys
export const STATUS = {
  GREEN:  'green',
  YELLOW: 'yellow',
  RED:    'red',
  ENDED:  'ended',  // budget period has ended
};

// ─── Display config ───────────────────────────────────────────────
// How many recent expenses to show on the dashboard.
export const MAX_RECENT_EXPENSES = 5;

// localStorage key — all app data is stored under this single key.
export const STORAGE_KEY = 'tipidtech_data';
