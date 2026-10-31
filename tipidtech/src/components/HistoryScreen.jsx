// HistoryScreen.jsx
// Two-mode expense history view.
//
// "This Period" mode (default):
//   Fetches all expenses for the current budget_id and groups them into
//   four collapsible time buckets: Today, This Week, This Month, Older.
//
// "Custom Range" mode:
//   Two date inputs + Filter button. Calls getExpensesByRange (crosses
//   budget boundaries by design). Results grouped by calendar date.

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp }  from 'lucide-react';

import ExpenseRow              from './ExpenseRow';
import { getAllExpenses, getExpensesByRange } from '../utils/storage';
import { formatPeso }          from '../utils/calculations';
import EditExpenseModal        from './EditExpenseModal';
import SectionHeader           from './ui/SectionHeader';
import Card                    from './ui/Card';
import SegmentedControl        from './ui/SegmentedControl';

// ─── Helpers ──────────────────────────────────────────────────────

// formatDate is used for date group subheaders in Custom Range mode.
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function groupExpensesByTime(expenses) {
  const result = { today: [], thisWeek: [], thisMonth: [], older: [] };
  if (!expenses || expenses.length === 0) return result;

  const now           = new Date();
  const todayStr      = now.toISOString().split('T')[0];
  const weekStart     = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr  = weekStart.toISOString().split('T')[0];
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  for (const expense of expenses) {
    const dateStr = expense.created_at.slice(0, 10);
    if (dateStr === todayStr)                                     result.today.push(expense);
    else if (dateStr >= weekStartStr && dateStr <= todayStr)      result.thisWeek.push(expense);
    else if (dateStr >= monthStartStr && dateStr <= todayStr)     result.thisMonth.push(expense);
    else                                                          result.older.push(expense);
  }
  return result;
}

function sumExpenses(list) {
  return list.reduce((sum, e) => sum + Number(e.amount), 0);
}

function groupByDate(expenses) {
  const map = new Map();
  for (const expense of expenses) {
    const dateStr = expense.created_at.slice(0, 10);
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr).push(expense);
  }
  return Array.from(map.entries());
}

// ─── Sub-components ───────────────────────────────────────────────

/** Collapsible section used in "This Period" mode. Uses Card variant="flush". */
function CollapsibleSection({ label, expenses, defaultOpen, onEdit }) {
  const [open, setOpen] = useState(defaultOpen);
  const total           = sumExpenses(expenses);

  return (
    <Card variant="flush">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent px-4 py-3.5 sm:px-5"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="rounded-full bg-page px-2 py-0.5 text-xs font-medium text-muted">
            {expenses.length}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {expenses.length > 0 && (
            <span className="text-sm font-bold text-red-600">
              −{formatPeso(total)}
            </span>
          )}
          {open
            ? <ChevronUp   className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            : <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          }
        </span>
      </button>

      {/* Body */}
      {open && (
        expenses.length === 0 ? (
          <p className="border-t border-gray-100 px-5 py-4 text-sm text-muted">
            No expenses.
          </p>
        ) : (
          <ul aria-label={`${label} expenses`} className="border-t border-gray-100">
            {expenses.map((expense, idx) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                dateMode="dateTime"
                isLast={idx === expenses.length - 1}
                onEdit={onEdit}
              />
            ))}
          </ul>
        )
      )}
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────

const TAB_OPTIONS = [
  { value: 'period', label: 'This Period'  },
  { value: 'range',  label: 'Custom Range' },
];

export default function HistoryScreen({ userId, budgetId, onLogout, userEmail }) {

  const [mode, setMode] = useState('period');
  const [editingExpense, setEditingExpense] = useState(null);

  // ── Period mode state ─────────────────────────────────────────
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [grouped,  setGrouped]  = useState({ today: [], thisWeek: [], thisMonth: [], older: [] });

  // ── Range mode state ──────────────────────────────────────────
  const [rangeStart,    setRangeStart]    = useState('');
  const [rangeEnd,      setRangeEnd]      = useState('');
  const [rangeExpenses, setRangeExpenses] = useState([]);
  const [rangeLoading,  setRangeLoading]  = useState(false);
  const [rangeError,    setRangeError]    = useState('');
  const [rangeFiltered, setRangeFiltered] = useState(false);

  // ── Load period expenses ──────────────────────────────────────
  const loadPeriodExpenses = useCallback(() => {
    if (!userId || !budgetId) return;
    setLoading(true);
    setError('');
    getAllExpenses(userId, budgetId)
      .then((data) => {
        setExpenses(data);
        setGrouped(groupExpensesByTime(data));
      })
      .catch((err) => {
        console.error('TipidTech: failed to load history', err);
        setError('Could not load expense history. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [userId, budgetId]);

  useEffect(() => { loadPeriodExpenses(); }, [loadPeriodExpenses]);

  // ── Tab switch ────────────────────────────────────────────────
  function handleTabSwitch(newMode) {
    if (newMode === mode) return;
    if (newMode === 'period') {
      setRangeExpenses([]);
      setRangeStart('');
      setRangeEnd('');
      setRangeError('');
      setRangeFiltered(false);
      loadPeriodExpenses();
    }
    if (newMode === 'range') {
      setRangeExpenses([]);
      setRangeFiltered(false);
      setRangeError('');
    }
    setMode(newMode);
  }

  // ── Range filter ──────────────────────────────────────────────
  async function handleRangeFilter() {
    setRangeError('');
    if (!rangeStart || !rangeEnd) {
      setRangeError('Please select both a start and end date.');
      return;
    }
    if (rangeStart > rangeEnd) {
      setRangeError('"From" date must be on or before the "To" date.');
      return;
    }
    setRangeLoading(true);
    try {
      const data = await getExpensesByRange(userId, rangeStart, rangeEnd);
      setRangeExpenses(data);
      setRangeFiltered(true);
    } catch (err) {
      console.error('TipidTech: failed to load range expenses', err);
      setRangeError('Could not load expenses. Please try again.');
    } finally {
      setRangeLoading(false);
    }
  }

  const inputCls     = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-ink bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors duration-150 appearance-none';
  const periodTotal  = sumExpenses(expenses);
  const rangeTotal   = sumExpenses(rangeExpenses);
  const rangeByDate  = groupByDate(rangeExpenses);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Page header ──────────────────────────────────────── */}
      <SectionHeader
        as="h2"
        title="Expense History"
        description="Your expenses for this budget period, grouped by time. Use Custom Range to look up specific dates."
      />

      {/* ── Tab toggle ─────────────────────────────────────────
          SegmentedControl is w-full on mobile (no overflow),
          w-fit from sm up. Uses rounded-full pill look.        */}
      <SegmentedControl
        options={TAB_OPTIONS}
        value={mode}
        onChange={handleTabSwitch}
        ariaLabel="Expense view"
      />

      {/* ═══════════════════════════════════════════════════════
          THIS PERIOD MODE
      ═══════════════════════════════════════════════════════ */}
      {mode === 'period' && (
        <>
          {!loading && !error && (
            <p className="text-sm text-muted">
              {expenses.length === 0
                ? 'No expenses recorded this period.'
                : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} · ${formatPeso(periodTotal)} total`}
            </p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted">Loading…</p>}
          {error   && <p className="py-4 text-center text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="flex flex-col gap-3">
              <CollapsibleSection label="Today"      expenses={grouped.today}     defaultOpen={true}  onEdit={setEditingExpense} />
              <CollapsibleSection label="This Week"  expenses={grouped.thisWeek}  defaultOpen={true}  onEdit={setEditingExpense} />
              <CollapsibleSection label="This Month" expenses={grouped.thisMonth} defaultOpen={true}  onEdit={setEditingExpense} />
              <CollapsibleSection label="Older"      expenses={grouped.older}     defaultOpen={false} onEdit={setEditingExpense} />
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          CUSTOM RANGE MODE
      ═══════════════════════════════════════════════════════ */}
      {mode === 'range' && (
        <>
          {/* Filter card — Card default (p-4 sm:p-6) */}
          <Card className="flex flex-col gap-3">
            {/* Date inputs: 1 col on phones, 2 cols from xs (400px) up */}
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink" htmlFor="range-start">From</label>
                <input
                  id="range-start"
                  type="date"
                  className={inputCls}
                  value={rangeStart}
                  onChange={(e) => { setRangeStart(e.target.value); setRangeError(''); }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink" htmlFor="range-end">To</label>
                <input
                  id="range-end"
                  type="date"
                  className={inputCls}
                  value={rangeEnd}
                  onChange={(e) => { setRangeEnd(e.target.value); setRangeError(''); }}
                />
              </div>
            </div>

            {rangeError && <p className="text-sm text-red-600">{rangeError}</p>}

            <button
              type="button"
              onClick={handleRangeFilter}
              disabled={rangeLoading}
              className="w-full cursor-pointer rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
            >
              {rangeLoading ? 'Loading…' : 'Filter'}
            </button>
          </Card>

          {!rangeFiltered && !rangeLoading && (
            <p className="py-4 text-center text-sm text-muted">
              Select a date range and tap Filter to see expenses.
            </p>
          )}
          {rangeFiltered && !rangeLoading && rangeExpenses.length === 0 && (
            <p className="py-4 text-center text-sm text-muted">
              No expenses found for this date range.
            </p>
          )}

          {rangeFiltered && !rangeLoading && rangeExpenses.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                {rangeExpenses.length} expense{rangeExpenses.length !== 1 ? 's' : ''} · {formatPeso(rangeTotal)} total
              </p>

              {/* Each date group uses Card variant="flush" */}
              {rangeByDate.map(([dateStr, dateExpenses]) => (
                <Card key={dateStr} variant="flush">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 sm:px-5">
                    <span className="text-xs font-semibold text-muted">
                      {formatDate(dateStr + 'T00:00:00')}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      −{formatPeso(sumExpenses(dateExpenses))}
                    </span>
                  </div>
                  <ul aria-label={`Expenses on ${formatDate(dateStr + 'T00:00:00')}`}>
                    {dateExpenses.map((expense, idx) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        dateMode="dateTime"
                        isLast={idx === dateExpenses.length - 1}
                        onEdit={setEditingExpense}
                      />
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Edit expense modal ────────────────────────────────── */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSaved={() => { setEditingExpense(null); loadPeriodExpenses(); }}
          onClose={() => setEditingExpense(null)}
        />
      )}

    </div>
  );
}
