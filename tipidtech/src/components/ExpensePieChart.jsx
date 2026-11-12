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
  ResponsiveContainer,
} from 'recharts';
import SegmentedControl from './ui/SegmentedControl';

import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso, toLocalDateKey } from '../utils/calculations';
import { getExpensesByDate, getExpensesByWeek } from '../utils/storage';

// ─── Calendar helpers ─────────────────────────────────────────────

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

// ─── Category colours (blue-free palette anchored on the brand green) ──

const CATEGORY_COLORS = {
  food:           '#80ed99',
  transportation: '#57cc99',
  school:         '#f4d35e',
  personal:       '#f4a261',
  savings:        '#74c69d',
  emergency:      '#e76f51',
  other:          '#9ca3af',
};

// ─── Custom tooltip ───────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-medium text-muted">{name}</span>
      <span className="text-sm font-bold text-ink">{formatPeso(value)}</span>
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

export default function ExpensePieChart({ userId, refreshKey, budgetId }) {
  const [view,      setView]      = useState('today');
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let expenses = [];
      if (view === 'today') {
        expenses = await getExpensesByDate(userId, toLocalDateKey(), budgetId);
      } else {
        const { monday, sunday } = getCurrentCalendarWeek();
        expenses = await getExpensesByWeek(userId, monday, sunday, budgetId);
      }
      setChartData(groupByCategory(expenses));
    } catch (err) {
      console.error('TipidTech: failed to load chart data', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, view, refreshKey, budgetId]);

  useEffect(() => { loadData(); }, [loadData]);

  function getColor(entry) {
    return CATEGORY_COLORS[entry.key] ?? '#9ca3af';
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header + toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">Spending Breakdown</h2>
        <SegmentedControl
          options={[
            { value: 'today', label: 'Today' },
            { value: 'week',  label: 'This Week' },
          ]}
          value={view}
          onChange={setView}
          ariaLabel="Chart period"
          role="radiogroup"
        />
      </div>

      {/* Chart area */}
      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading…</p>
      ) : chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No expenses recorded {view === 'today' ? 'today' : 'this week'}.
        </p>
      ) : (
        <>
          {/* Ring only; the legend is the HTML list below so it scales with text size
              and never overlaps the chart on narrow phones. */}
          <ResponsiveContainer width="100%" height={210}>
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
            </PieChart>
          </ResponsiveContainer>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 xs:grid-cols-2" aria-label="Spending by category">
            {chartData.map((entry) => (
              <li key={entry.key} className="flex min-w-0 items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getColor(entry) }} aria-hidden="true" />
                <span className="min-w-0 flex-1 break-words hyphens-auto text-ink">{entry.name}</span>
                <span className="shrink-0 font-semibold text-ink">{formatPeso(entry.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}