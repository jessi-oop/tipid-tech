// ReportsScreen.jsx
// Two tabs: Daily and Weekly.
//
// IMPORTANT: Both tabs are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom).
//
//   Daily tab  — shows expenses for a specific calendar date chosen by the user.
//   Weekly tab — shows expenses for the CURRENT calendar week: Mon 00:00 → Sun 23:59.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import NavHeader              from './NavHeader';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }         from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek } from '../utils/storage';

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

function getCategoryEmoji(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.emoji : '📌';
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
    <li className="flex items-start gap-3">
      <span className="text-lg leading-none shrink-0 mt-0.5">
        {getCategoryEmoji(expense.category)}
      </span>
      <span className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-gray-900">
          {getCategoryLabel(expense.category)}
        </span>
        {expense.note && (
          <span className="text-xs text-gray-400 truncate">{expense.note}</span>
        )}
        <span className="text-xs text-gray-400">{formatTime(expense.created_at)}</span>
      </span>
      <span className="text-sm font-bold text-red-600 shrink-0">
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
      {/* Date picker */}
      <div className="flex flex-col gap-2 max-w-xs">
        <label className="text-sm font-semibold text-gray-900" htmlFor="report-date">
          Select Date
        </label>
        <input
          id="report-date"
          type="date"
          className="px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors duration-150 max-w-xs"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayString()}
        />
      </div>

      {loading && <p className="text-sm text-gray-400 text-center py-6">Loading…</p>}
      {error   && <p className="text-sm text-red-600 text-center py-4">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No expenses on this date.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
          </ul>
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPeso(dayTotal)}</span>
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
      <p className="text-sm font-semibold text-gray-400">
        {monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        {' – '}
        {sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {loading && <p className="text-sm text-gray-400 text-center py-6">Loading…</p>}
      {error   && <p className="text-sm text-red-600 text-center py-4">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No expenses this week yet.</p>
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
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm font-bold text-gray-900">{formatDayHeading(day)}</span>
                  <span className="text-sm font-semibold text-gray-400">{formatPeso(dayTotal)}</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {dayExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200 text-base font-bold text-gray-900">
            <span>Week Total</span>
            <span>{formatPeso(weekTotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ReportsScreen ────────────────────────────────────────────────

export default function ReportsScreen({ userId, onLogout, userEmail }) {
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-12 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <button
            className="self-start text-sm font-medium text-blue-600 bg-transparent border-none cursor-pointer p-0 hover:underline"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to Dashboard"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        </div>

        {/* Tab bar */}
        <div className="flex border-b-2 border-gray-200" role="tablist">
          {[
            { key: 'daily',  label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
          ].map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 px-4 text-base font-semibold border-b-2 -mb-0.5 transition-colors duration-150 cursor-pointer bg-transparent ${
                activeTab === key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          {activeTab === 'daily'  && <DailyTab  userId={userId} />}
          {activeTab === 'weekly' && <WeeklyTab userId={userId} />}
        </div>

      </div>
    </>
  );
}
