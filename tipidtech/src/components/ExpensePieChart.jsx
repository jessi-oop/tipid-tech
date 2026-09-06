// ExpensePieChart.jsx
// Shows a pie chart of expenses broken down by category.
//
// Two views, toggled by the user:
//   "Today"     — all expenses whose created_at falls on today's calendar date
//   "This Week" — all expenses whose created_at falls in the current Mon–Sun calendar week
//
// IMPORTANT: These ranges are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom). A user with a
// monthly budget still sees "Today" = today's date and "This Week" = Mon–Sun.

import { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }          from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek } from '../utils/storage';

// ─── Calendar helpers (calendar dates only — no budget period involved) ───────

/** Returns today's date as an ISO 'YYYY-MM-DD' string. */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns the Monday and Sunday of the current calendar week as Date objects.
 * Week is always Mon 00:00:00 → Sun 23:59:59 local time, regardless of budget period.
 */
function getCurrentCalendarWeek() {
  const now     = new Date();
  const day     = now.getDay(); // 0 = Sun, 1 = Mon, …, 6 = Sat
  const diffToMonday = (day === 0) ? -6 : 1 - day; // Sunday wraps to previous Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

// ─── Category colours (one per category + other) ──────────────────

const CATEGORY_COLORS = {
  food:           '#2563eb',
  transportation: '#16a34a',
  school:         '#ca8a04',
  personal:       '#9333ea',
  savings:        '#0891b2',
  emergency:      '#dc2626',
  other:          '#6b7280',
};

// Build the full category colour list in EXPENSE_CATEGORIES order
const ORDERED_COLORS = EXPENSE_CATEGORIES.map((c) => CATEGORY_COLORS[c.key] ?? '#6b7280');

// ─── Custom tooltip ───────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="pie-tooltip">
      <span className="pie-tooltip-name">{name}</span>
      <span className="pie-tooltip-value">{formatPeso(value)}</span>
    </div>
  );
}

// ─── Group expenses by category ───────────────────────────────────

function groupByCategory(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });

  // Return in EXPENSE_CATEGORIES order so colours are consistent
  return EXPENSE_CATEGORIES
    .filter((cat) => totals[cat.key] > 0)
    .map((cat) => ({
      name:  cat.label,
      key:   cat.key,
      value: totals[cat.key],
    }));
}

// ─── Component ────────────────────────────────────────────────────

export default function ExpensePieChart({ userId, refreshKey }) {
  const [view,      setView]      = useState('today'); // 'today' | 'week'
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(false);

  // ─── Fetch expenses for the selected calendar range ───────────
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let expenses = [];

      if (view === 'today') {
        // Calendar date only — has nothing to do with the user's budget period
        const today = getTodayString();
        expenses = await getExpensesByDate(userId, today);
      } else {
        // Current Mon–Sun calendar week — independent of budget period
        const { monday, sunday } = getCurrentCalendarWeek();
        expenses = await getExpensesByWeek(userId, monday, sunday);
      }

      setChartData(groupByCategory(expenses));
    } catch (err) {
      console.error('TipidTech: failed to load chart data', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, view, refreshKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map a category key back to its colour for the Cell fill
  function getColor(entry) {
    return CATEGORY_COLORS[entry.key] ?? '#6b7280';
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="card section-card pie-chart-section">
      {/* Header + toggle */}
      <div className="pie-chart-header">
        <h2 className="section-title">Spending Breakdown</h2>
        <div className="pie-toggle" role="group" aria-label="Chart period">
          <button
            type="button"
            className={`pie-toggle-btn${view === 'today' ? ' pie-toggle-btn--active' : ''}`}
            onClick={() => setView('today')}
          >
            Today
          </button>
          <button
            type="button"
            className={`pie-toggle-btn${view === 'week' ? ' pie-toggle-btn--active' : ''}`}
            onClick={() => setView('week')}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <p className="pie-loading">Loading…</p>
      ) : chartData.length === 0 ? (
        <p className="pie-empty">
          No expenses recorded {view === 'today' ? 'today' : 'this week'}.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={getColor(entry)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry) =>
                `${value}: ${formatPeso(entry.payload.value)}`
              }
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
