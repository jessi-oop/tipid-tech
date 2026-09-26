// ReportsScreen.jsx
// Two tabs: Daily and Weekly.
//
// IMPORTANT: Both tabs are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom).
//
//   Daily tab  — shows expenses for a specific calendar date chosen by the user.
//   Weekly tab — shows expenses for the CURRENT calendar week: Mon 00:00 → Sun 23:59.

import { useState, useEffect, useCallback } from 'react';

import CategoryIcon         from './CategoryIcon';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }         from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek, getExpensesByRange } from '../utils/storage';

// ─── Calendar helpers ─────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

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

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function sumAmounts(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

// ─── Shared expense row ───────────────────────────────────────────

function ExpenseRow({ expense }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
        <CategoryIcon category={expense.category} className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline gap-2">
          <span className="shrink-0 text-sm font-semibold text-ink">
            {getCategoryLabel(expense.category)}
          </span>
          {expense.note && (
            <span className="truncate text-xs text-muted">{expense.note}</span>
          )}
        </span>
        <span className="inline-flex w-fit items-center rounded-full bg-page px-2.5 py-0.5 text-xs font-medium text-muted">
          {formatTime(expense.created_at)}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold text-red-600">
        −{formatPeso(expense.amount)}
      </span>
    </li>
  );
}

// ─── Daily Tab ────────────────────────────────────────────────────

function DailyTab({ userId }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
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
      <p className="text-sm text-muted mt-0.5">See everything you spent on a specific day. Tap the date to change it.</p>
      {/* Date picker */}
      <div className="flex max-w-xs flex-col gap-2">
        <label className="text-sm font-semibold text-ink" htmlFor="report-date">
          Select Date
        </label>
        <input
          id="report-date"
          type="date"
          className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayString()}
        />
      </div>

      {loading && <p className="py-6 text-center text-sm text-muted">Loading…</p>}
      {error   && <p className="py-4 text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">No expenses on this date.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
          </ul>
          <div className="flex items-center justify-between rounded-xl border border-brand/40 bg-brand/15 px-5 py-4">
            <span className="text-sm font-bold text-ink">Total</span>
            <span className="text-base font-extrabold text-ink">{formatPeso(dayTotal)}</span>
          </div>
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
    const dateKey = e.created_at.split('T')[0];
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
      {/* Week range */}
      <p className="text-sm font-semibold text-muted">
        {monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        {' – '}
        {sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className="text-sm text-muted mt-0.5">See your spending for the current calendar week, broken down by day.</p>

      {loading && <p className="py-6 text-center text-sm text-muted">Loading…</p>}
      {error   && <p className="py-4 text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">No expenses this week yet.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          {weekDays.map((day) => {
            const dateKey    = day.toISOString().split('T')[0];
            const dayExpenses = grouped[dateKey] || [];
            if (dayExpenses.length === 0) return null;
            const dayTotal = sumAmounts(dayExpenses);

            return (
              <div key={dateKey} className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-bold text-ink">{formatDayHeading(day)}</span>
                  <span className="inline-flex items-center rounded-full bg-page px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {formatPeso(dayTotal)}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {dayExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              </div>
            );
          })}

          <div className="mt-1 flex items-center justify-between rounded-xl border border-brand/40 bg-brand/15 px-5 py-4">
            <span className="text-sm font-bold text-ink">Week Total</span>
            <span className="text-base font-extrabold text-ink">{formatPeso(weekTotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Custom Range helpers ─────────────────────────────────────────

/** Group a flat expense array by calendar date string 'YYYY-MM-DD', newest first. */
function groupByDate(expenses) {
  const map = new Map();
  for (const expense of expenses) {
    const dateStr = expense.created_at.slice(0, 10);
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

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';
  const rangeTotal = rangeExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byDate     = groupByDate(rangeExpenses);

  return (
    <div className="flex flex-col gap-4">
      {/* Date inputs + Filter */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink" htmlFor="range-start-r">From</label>
            <input
              id="range-start-r"
              type="date"
              className={inputCls}
              value={rangeStart}
              onChange={(e) => { setRangeStart(e.target.value); setRangeError(''); }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink" htmlFor="range-end-r">To</label>
            <input
              id="range-end-r"
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
          onClick={handleFilter}
          disabled={rangeLoading}
          className="w-full cursor-pointer rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
        >
          {rangeLoading ? 'Loading…' : 'Filter'}
        </button>
      </div>

      {/* Results */}
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
            const dayTotal = dateExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            return (
              <div key={dateStr} className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-bold text-ink">{displayDate}</span>
                  <span className="inline-flex items-center rounded-full bg-page px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {formatPeso(dayTotal)}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {dateExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              </div>
            );
          })}

          <div className="mt-1 flex items-center justify-between rounded-xl border border-brand/40 bg-brand/15 px-5 py-4">
            <span className="text-sm font-bold text-ink">Total</span>
            <span className="text-base font-extrabold text-ink">{formatPeso(rangeTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ReportsScreen ────────────────────────────────────────────────

export default function ReportsScreen({ userId, onLogout, userEmail }) {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-ink">Reports</h2>
        <p className="text-sm text-muted mt-0.5">Calendar-based spending reports. These are independent of your budget period — use them to look up any date.</p>
      </div>

      {/* Pill-style tab toggle */}
      <div className="flex w-fit rounded-full bg-page p-1" role="tablist">
        {[
          { key: 'daily',  label: 'Daily'        },
          { key: 'weekly', label: 'Weekly'       },
          { key: 'custom', label: 'Custom Range' },
        ].map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-150 ${
              activeTab === key
                ? 'bg-brand text-ink'
                : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {activeTab === 'daily'  && <DailyTab       userId={userId} />}
        {activeTab === 'weekly' && <WeeklyTab      userId={userId} />}
        {activeTab === 'custom' && <CustomRangeTab userId={userId} />}
      </div>

    </div>
  );
}