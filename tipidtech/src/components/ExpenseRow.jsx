// ExpenseRow.jsx
// Shared expense row used by HistoryScreen, ExpenseList (Dashboard), and ReportsScreen.
//
// Layout (mobile-first, items-start so tall rows don't misalign short ones):
//
//   [icon]  [middle: category / note / date line]  [right: amount + optional edit]
//
// dateMode prop controls the date/time line:
//   "dateTime" — two separate nowrap pieces: "Oct 25, 2026 · " and "11:43 PM"
//                Joined inside a flex-wrap row so the break happens BETWEEN them,
//                never inside a date or time string. " · " is attached to the END
//                of the date span so a wrapped line never starts with a dot.
//   "combined" — "Oct 25, " + "11:43 PM" (no year), two nowrap pieces that wrap
//                like dateTime. Used by ExpenseList (Dashboard).
//   "timeOnly" — time string only, one nowrap span. Used by ReportsScreen.
//
// onEdit (optional): if provided, renders a Pencil button in the right column.
//   Below xs: amount above edit button (stacked).
//   xs+:      amount and edit button side-by-side in one row.
//   44×44 px tap target on the button at all sizes.
//   If onEdit is omitted, no button is rendered and no space is reserved.
//
// isLast (optional, default false): suppresses the bottom border on the last row.

import { Pencil } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }          from '../utils/calculations';

// ─── Formatting helpers (kept local — no logic changes) ───────────

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// Used by dateMode="combined" (ExpenseList). Short month+day, no year.
function formatShortDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────

export default function ExpenseRow({
  expense,
  dateMode = 'dateTime',
  onEdit,
  isLast   = false,
}) {
  const categoryLabel = getCategoryLabel(expense.category);

  // Build the date/time line based on mode.
  let dateLine;
  if (dateMode === 'dateTime') {
    // Two nowrap pieces inside a flex-wrap row.
    // " · " is appended inside the date span so a wrapped line never starts with a dot.
    dateLine = (
      <span className="flex flex-wrap gap-x-0 text-xs text-muted">
        <span className="whitespace-nowrap">{formatDate(expense.created_at)} · </span>
        <span className="whitespace-nowrap">{formatTime(expense.created_at)}</span>
      </span>
    );
  } else if (dateMode === 'combined') {
    // Same wrap rule as dateTime: break between date and time, never under the edit button.
    dateLine = (
      <span className="flex flex-wrap text-xs text-muted">
        <span className="whitespace-nowrap">{formatShortDate(expense.created_at)},&nbsp;</span>
        <span className="whitespace-nowrap">{formatTime(expense.created_at)}</span>
      </span>
    );
  } else {
    // timeOnly
    dateLine = (
      <span className="whitespace-nowrap text-xs text-muted">
        {formatTime(expense.created_at)}
      </span>
    );
  }

  return (
    <li
      className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      {/* ── Icon chip ─────────────────────────────────────────── */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
        <CategoryIcon category={expense.category} className="h-4 w-4" />
      </span>

      {/* ── Middle column ─────────────────────────────────────── */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">

        {/* Category name — wraps onto 2 lines max, never overflows */}
        <span className="line-clamp-2 min-w-0 break-words hyphens-auto text-sm font-semibold text-ink">
          {categoryLabel}
        </span>

        {/* Note (if present) — own line, 2-line clamp */}
        {expense.note && (
          <span className="line-clamp-2 min-w-0 break-words text-xs text-muted">
            {expense.note}
          </span>
        )}

        {/* Date / time line — no pill chip, plain text, wraps between pieces */}
        {dateLine}

      </span>

      {/* ── Right column ──────────────────────────────────────── */}
      {/* Below xs: stacked (amount on top, edit below, column alignment).
          xs+:      side-by-side row (amount | edit button).              */}
      <span className={`flex shrink-0 flex-col items-end gap-0.5 xs:flex-row xs:items-center xs:gap-1`}>

        {/* Amount — whitespace-nowrap keeps it on one line; no tabular-nums
            since the existing rows don't use it and spec says keep classes.  */}
        <span className="whitespace-nowrap text-sm font-semibold text-red-600">
          −{formatPeso(expense.amount)}
        </span>

        {/* Edit button — only rendered when onEdit is provided.
            44×44 px target via min-h/min-w so it never reserves space when absent. */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
            className="flex min-h-[2.75rem] min-w-[2.75rem] cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
            aria-label="Edit expense"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

      </span>
    </li>
  );
}
