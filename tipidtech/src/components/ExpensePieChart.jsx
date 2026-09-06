// ExpensePieChart.jsx
// Shows a pie chart of expenses broken down by category.
//
// Two views, toggled by the user:
//   "Today"     — all expenses whose created_at falls on today's calendar date
//   "This Week" — all expenses whose created_at falls in the current Mon–Sun calendar week
//
// IMPORTANT: These ranges are purely calendar-based. They have no relation to the
// user's chosen budget period (daily / weekly / monthly / custom).

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

// ─── Calendar helpers ─────────────────────────────────────────────

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentCalendarWeek() {
  const now  = new Date();
  const day  = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

// ─── Category colours ─────────────────────────────────────────────

const CATEGORY_COLORS = {
  food:           '#2563eb',
  transportation: '#16a34a',
  school:         '#ca8a04',
  personal:       '#9333ea',
  savings:        '#0891b2',
  emergency:      '#dc2626',
  other:          '#6b7280',
};

// ─── Custom tooltip ───────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col gap-0.5 shadow-sm">
      <span className="text-xs text-gray-400 font-medium">{name}</span>
      <span className="text-sm font-bold text-gray-900">{formatPeso(value)}</span>
    </div>
  );
}

// ─── Group expenses by category ───────────────────────────────────

function groupByCategory(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
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
  const [view,      setView]      = useState('today');
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let expenses = [];
      if (view === 'today') {
        expenses = await getExpensesByDate(userId, getTodayString());
      } else {
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

  useEffect(() => { loadData(); }, [loadData]);

  function getColor(entry) {
    return CATEGORY_COLORS[entry.key] ?? '#6b7280';
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      {/* Header + toggle */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Spending Breakdown</h2>
        <div
          className="flex border border-gray-200 rounded-lg overflow-hidden"
          role="group"
          aria-label="Chart period"
        >
          {[
            { key: 'today', label: 'Today' },
            { key: 'week',  label: 'This Week' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer border-none ${
                view === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              } ${key === 'week' ? 'border-l border-gray-200' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
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
