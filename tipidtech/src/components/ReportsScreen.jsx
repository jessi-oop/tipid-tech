// ReportsScreen.jsx
// Two tabs: Daily and Weekly.
//
// IMPORTANT: Both tabs are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom).
//
//   Daily tab  — shows expenses for a specific calendar date chosen by the user.
//                Date picker defaults to today. Changing the date re-fetches.
//
//   Weekly tab — shows expenses for the CURRENT calendar week: Monday 00:00 to
//                Sunday 23:59. This is always the current Mon–Sun window regardless
//                of whether the user has a daily, weekly, monthly, or custom budget.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import NavHeader           from './NavHeader';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }          from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek } from '../utils/storage';

// ─── Calendar helpers ─────────────────────────────────────────────

/** Returns today as 'YYYY-MM-DD'. */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns Monday and Sunday of the CURRENT calendar week as Date objects.
 * Week is always Mon 00:00:00 → Sun 23:59:59, regardless of budget period.
 */
function getCurrentCalendarWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, …, 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

/** Format a Date as 'Monday, Sep 1' etc. */
function formatDayHeading(date) {
  return date.toLocaleDateString('en-PH', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
}

// ─── Shared expense helpers ───────────────────────────────────────

function getCategoryLabel(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : 'Other';
}

function getCategoryEmoji(key) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key);
  return cat ? cat.emoji : '📌';
}

/** Format a Supabase timestamptz → '2:30 PM' */
function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/** Sum amounts from an array of expense rows. */
function sumAmounts(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

// ─── Shared expense row component ────────────────────────────────

function ExpenseRow({ expense }) {
  return (
    <li className="report-expense-item">
      <span className="report-expense-emoji">
        {getCategoryEmoji(expense.category)}
      </span>
      <span className="report-expense-details">
        <span className="report-expense-category">
          {getCategoryLabel(expense.category)}
        </span>
        {expense.note && (
          <span className="report-expense-note">{expense.note}</span>
        )}
        <span className="report-expense-time">
          {formatTime(expense.created_at)}
        </span>
      </span>
      <span className="report-expense-amount">
        −{formatPeso(expense.amount)}
      </span>
    </li>
  );
}

// ─── Daily Tab ────────────────────────────────────────────────────

function DailyTab({ userId }) {
  // selectedDate is a plain calendar date 'YYYY-MM-DD' — no budget period involved
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [expenses,     setExpenses]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getExpensesByDate(userId, selectedDate);
      setExpenses(data);
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
    <div className="report-tab-content">
      {/* Date picker — calendar date only, nothing to do with budget period */}
      <div className="form-group report-date-group">
        <label className="form-label" htmlFor="report-date">Select Date</label>
        <input
          id="report-date"
          type="date"
          className="form-input report-date-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayString()}
        />
      </div>

      {loading && <p className="report-loading">Loading…</p>}
      {error   && <p className="report-error">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="report-empty">No expenses on this date.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          <ul className="report-expense-list">
            {expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
          </ul>
          <div className="report-total">
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

  // Compute current Mon–Sun calendar week once on mount
  const { monday, sunday } = getCurrentCalendarWeek();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // Fetch the current Mon–Sun calendar week — independent of budget period
    getExpensesByWeek(userId, monday, sunday)
      .then((data) => {
        setExpenses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('TipidTech: failed to load weekly report', err);
        setError('Could not load data. Please try again.');
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // monday/sunday are stable for the lifetime of this tab

  // Group expenses by calendar date string 'YYYY-MM-DD'
  const grouped = {};
  expenses.forEach((e) => {
    const dateKey = e.created_at.split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(e);
  });

  // Build an ordered array of the 7 days Mon–Sun
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const weekTotal = sumAmounts(expenses);

  return (
    <div className="report-tab-content">
      {/* Week range label */}
      <p className="report-week-range">
        {monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        {' – '}
        {sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {loading && <p className="report-loading">Loading…</p>}
      {error   && <p className="report-error">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="report-empty">No expenses this week yet.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <>
          {weekDays.map((day) => {
            const dateKey = day.toISOString().split('T')[0];
            const dayExpenses = grouped[dateKey] || [];
            if (dayExpenses.length === 0) return null;

            const dayTotal = sumAmounts(dayExpenses);

            return (
              <div key={dateKey} className="report-day-group">
                <div className="report-day-header">
                  <span className="report-day-label">{formatDayHeading(day)}</span>
                  <span className="report-day-subtotal">{formatPeso(dayTotal)}</span>
                </div>
                <ul className="report-expense-list">
                  {dayExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              </div>
            );
          })}

          <div className="report-total report-total--week">
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly'

  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="screen reports-screen">

      {/* Header */}
      <div className="screen-header">
        <button
          className="btn-back"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <h2 className="screen-title">Reports</h2>
      </div>

      {/* Tab bar */}
      <div className="reports-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'daily'}
          className={`reports-tab${activeTab === 'daily' ? ' reports-tab--active' : ''}`}
          onClick={() => setActiveTab('daily')}
          type="button"
        >
          Daily
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'weekly'}
          className={`reports-tab${activeTab === 'weekly' ? ' reports-tab--active' : ''}`}
          onClick={() => setActiveTab('weekly')}
          type="button"
        >
          Weekly
        </button>
      </div>

      {/* Tab content */}
      <div className="card reports-card">
        {activeTab === 'daily'  && <DailyTab  userId={userId} />}
        {activeTab === 'weekly' && <WeeklyTab userId={userId} />}
      </div>

    </div>
    </>
  );
}
