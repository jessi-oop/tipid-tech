// ReportsScreen.jsx
// Three tabs: Daily, Weekly, Custom Range.
//
// IMPORTANT: All tabs are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom).
//
//   Daily tab        — shows expenses for a specific calendar date.
//   Weekly tab       — shows expenses for the CURRENT calendar week: Mon 00:00 → Sun 23:59.
//   Custom Range tab — user picks From / To dates.

import { useState, useEffect, useCallback } from 'react';

import ExpenseRow             from './ExpenseRow';
import { formatPeso, toLocalDateKey } from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek, getExpensesByRange } from '../utils/storage';
import SectionHeader          from './ui/SectionHeader';
import Card                   from './ui/Card';
import SegmentedControl       from './ui/SegmentedControl';

// ─── Calendar helpers ─────────────────────────────────────────────

function getCurrentCalendarWeek() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function formatDayHeading(date) {
  return date.toLocaleDateString('en-PH', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
}

// ─── Shared helpers ───────────────────────────────────────────────

function sumAmounts(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

// ─── Total bar (branded) ──────────────────────────────────────────

function TotalBar({ label, amount }) {
  return (
    <div className="flex min-w-0 items-center justify-between rounded-xl border border-brand/40 bg-brand/15 px-5 py-4">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="min-w-0 break-words text-base font-extrabold text-ink">{formatPeso(amount)}</span>
    </div>
  );
}

// ─── Day group (flush card: header + rows, like HistoryScreen) ────

function DayCard({ heading, expenses, dateMode }) {
  return (
    <Card variant="flush">
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 sm:px-5">
        <span className="min-w-0 text-sm font-bold text-ink">{heading}</span>
        <span className="shrink-0 rounded-full bg-page px-2.5 py-0.5 text-xs font-semibold text-muted">
          {formatPeso(sumAmounts(expenses))}
        </span>
      </div>
      <ul aria-label={`Expenses on ${heading}`}>
        {expenses.map((e, idx) => (
          <ExpenseRow key={e.id} expense={e} dateMode={dateMode} isLast={idx === expenses.length - 1} />
        ))}
      </ul>
    </Card>
  );
}

// ─── Shared date input class (DESIGN.md §7 input) ─────────────────

const dateCls = 'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-ink transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

// ─── Daily Tab ────────────────────────────────────────────────────

function DailyTab({ userId }) {
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey());
  const [expenses,     setExpenses]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      setExpenses(await getExpensesByDate(userId, selectedDate));
    } catch (err) {
      console.error('TipidTech: failed to load daily report', err);
      setError('Could not load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const dayTotal = sumAmounts(expenses);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-muted">See everything you spent on a specific day. Tap the date to change it.</p>

        {/* Date picker — max-w-xs caps it on wide screens */}
        <div className="flex max-w-xs flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="report-date">
            Select Date
          </label>
          <input
            id="report-date"
            type="date"
            className={dateCls}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={toLocalDateKey()}
          />
        </div>
      </Card>

      {loading && <p className="py-6 text-center text-sm text-muted">Loading…</p>}
      {error   && <p className="py-4 text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">No expenses on this date.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          <Card variant="flush">
            <ul aria-label="Expenses on selected date">
              {expenses.map((e, idx) => (
                <ExpenseRow key={e.id} expense={e} dateMode="timeOnly" isLast={idx === expenses.length - 1} />
              ))}
            </ul>
          </Card>
          <TotalBar label="Total" amount={dayTotal} />
        </>
      )}
    </div>
  );
}

// ─── Weekly Tab ───────────────────────────────────────────────────

function WeeklyTab({ userId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { monday, sunday } = getCurrentCalendarWeek();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getExpensesByWeek(userId, monday, sunday)
      .then((data) => setExpenses(data))
      .catch((err) => {
        console.error('TipidTech: failed to load weekly report', err);
        setError('Could not load data. Please try again.');
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const grouped = {};
  expenses.forEach((e) => {
    const dateKey = toLocalDateKey(e.created_at);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(e);
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const weekTotal = sumAmounts(expenses);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-1">
        {/* Week range label */}
        <p className="text-sm font-semibold text-ink">
          {monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
          {' – '}
          {sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-sm text-muted">See your spending for the current calendar week, broken down by day.</p>
      </Card>

      {loading && <p className="py-6 text-center text-sm text-muted">Loading…</p>}
      {error   && <p className="py-4 text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">No expenses this week yet.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          {weekDays.map((day) => {
            const dateKey     = toLocalDateKey(day);
            const dayExpenses = grouped[dateKey] || [];
            if (dayExpenses.length === 0) return null;
            return (
              <DayCard key={dateKey} heading={formatDayHeading(day)} expenses={dayExpenses} dateMode="timeOnly" />
            );
          })}
          <TotalBar label="Week Total" amount={weekTotal} />
        </>
      )}
    </div>
  );
}

// ─── Custom Range helpers ─────────────────────────────────────────

function groupByDate(expenses) {
  const map = new Map();
  for (const expense of expenses) {
    const dateStr = toLocalDateKey(expense.created_at);
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr).push(expense);
  }
  return map;
}

// ─── Custom Range Tab ─────────────────────────────────────────────

function CustomRangeTab({ userId }) {
  const [rangeStart,    setRangeStart]    = useState('');
  const [rangeEnd,      setRangeEnd]      = useState('');
  const [rangeExpenses, setRangeExpenses] = useState([]);
  const [rangeLoading,  setRangeLoading]  = useState(false);
  const [rangeError,    setRangeError]    = useState('');
  const [rangeFiltered, setRangeFiltered] = useState(false);

  async function handleFilter() {
    setRangeError('');
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      setRangeError('Please select a valid date range.');
      return;
    }
    setRangeLoading(true);
    try {
      const data = await getExpensesByRange(userId, rangeStart, rangeEnd);
      setRangeExpenses(data);
      setRangeFiltered(true);
    } catch (err) {
      console.error('TipidTech: failed to load custom range report', err);
      setRangeError('Could not load expenses. Please try again.');
    } finally {
      setRangeLoading(false);
    }
  }

  const rangeTotal = rangeExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byDate     = groupByDate(rangeExpenses);

  return (
    <div className="flex flex-col gap-4">
      {/* Date inputs — 1 col on phones, 2 cols from xs (400px) up */}
      <Card className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink" htmlFor="range-start-r">From</label>
            <input
              id="range-start-r"
              type="date"
              className={dateCls}
              value={rangeStart}
              onChange={(e) => { setRangeStart(e.target.value); setRangeError(''); }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink" htmlFor="range-end-r">To</label>
            <input
              id="range-end-r"
              type="date"
              className={dateCls}
              value={rangeEnd}
              onChange={(e) => { setRangeEnd(e.target.value); setRangeError(''); }}
            />
          </div>
        </div>
        {rangeError && <p className="text-sm text-red-600">{rangeError}</p>}
        <button
          type="button"
          onClick={handleFilter}
          disabled={rangeLoading}
          className="min-h-[2.75rem] w-full cursor-pointer rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
        >
          {rangeLoading ? 'Loading…' : 'Filter'}
        </button>
      </Card>

      {!rangeFiltered && !rangeLoading && (
        <p className="py-6 text-center text-sm text-muted">
          Select a date range and tap Filter to see expenses.
        </p>
      )}
      {rangeFiltered && !rangeLoading && rangeExpenses.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">
          No expenses found for this date range.
        </p>
      )}

      {rangeFiltered && !rangeLoading && rangeExpenses.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {rangeExpenses.length} expense{rangeExpenses.length !== 1 ? 's' : ''} · {formatPeso(rangeTotal)} total
          </p>

          {Array.from(byDate.entries()).map(([dateStr, dateExpenses]) => {
            const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            return <DayCard key={dateStr} heading={displayDate} expenses={dateExpenses} dateMode="timeOnly" />;
          })}

          <TotalBar label="Total" amount={rangeTotal} />
        </div>
      )}
    </div>
  );
}

// ─── Tab options ──────────────────────────────────────────────────

const TAB_OPTIONS = [
  { value: 'daily',  label: 'Daily'        },
  { value: 'weekly', label: 'Weekly'       },
  { value: 'custom', label: 'Custom Range' },
];

// ─── ReportsScreen ────────────────────────────────────────────────

export default function ReportsScreen({ userId, onLogout, userEmail }) {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="flex flex-col gap-4">

      {/* Page header */}
      <SectionHeader
        as="h1"
        title="Reports"
        description="Daily and weekly totals by calendar day, separate from your budget period."
      />

      {/* Tab toggle — SegmentedControl is w-full on mobile (no overflow),
          w-fit from sm up. Replaces the old w-fit rounded-full px-6 py-2
          pattern that overflowed on 320-360px at Extra Large text.    */}
      <SegmentedControl
        options={TAB_OPTIONS}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Report period"
      />

      {/* Tab content — each tab renders its own cards (controls card + flush list cards) */}
      {activeTab === 'daily'  && <DailyTab       userId={userId} />}
      {activeTab === 'weekly' && <WeeklyTab      userId={userId} />}
      {activeTab === 'custom' && <CustomRangeTab userId={userId} />}

    </div>
  );
}
