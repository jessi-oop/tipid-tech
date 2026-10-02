// AdminDashboard.jsx
// Admin metrics page — wrapped in AppLayout by the /admin route in App.jsx.
// Fetches all metrics via the get_admin_metrics() RPC function,
// which enforces the is_admin check server-side via SECURITY DEFINER.

import { useState, useEffect } from 'react';
import { formatPeso }          from '../utils/calculations';
import { getAdminMetrics }     from '../utils/storage';
import UserDetailModal         from './UserDetailModal';

// ─── Small helpers ────────────────────────────────────────────────

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatLocalDate(isoString) {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Metric card ──────────────────────────────────────────────────

function MetricCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className="text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────

export default function AdminDashboard({ userId }) {
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // { email, id } | null

  useEffect(() => {
    getAdminMetrics()
      .then((metrics) => setData(metrics))
      .catch((err) => {
        console.error('TipidTech: failed to load admin metrics', err);
        setError('Unable to load admin data. You may not have admin access.');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return <p className="py-10 text-center text-sm text-muted">Loading metrics…</p>;
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <p className="mx-auto max-w-sm py-10 text-center text-sm text-red-600">{error}</p>
    );
  }

  // ── Derived ───────────────────────────────────────────────────
  const completionRate =
    data.total_goals > 0
      ? `${Math.round((data.completed_goals / data.total_goals) * 100)}%`
      : 'N/A';

  const maxLogins = data.daily_logins?.length
    ? Math.max(...data.daily_logins.map((d) => d.logins), 1)
    : 1;

  const topCategoryMax = data.top_categories?.length
    ? data.top_categories[0].count
    : 1;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted">Platform overview and user engagement metrics.</p>
      </div>

      {/* ── Primary stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Users"           value={data.total_users}              />
        <MetricCard label="Active This Week"      value={data.active_users_7d}          />
        <MetricCard label="Total Expenses Logged" value={data.total_expenses}           />
        <MetricCard label="Total Amount Tracked"  value={formatPeso(data.total_amount)} />
      </div>

      {/* ── Secondary stats row ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard label="New Users This Week"   value={data.new_users_7d}        />
        <MetricCard label="New Users Last Week"   value={data.new_users_last_week} />
        <MetricCard label="Goals Completion Rate" value={completionRate}           />
      </div>

      {/* ── Top categories ────────────────────────────────────── */}
      {data.top_categories?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Top Spending Categories</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {data.top_categories.map((cat, idx) => {
              const barPct = Math.round((cat.count / topCategoryMax) * 100);
              return (
                <div
                  key={cat.category}
                  className={`flex flex-col gap-2 px-5 py-4 ${
                    idx < data.top_categories.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-ink">{capitalize(cat.category)}</span>
                    <span className="text-xs text-muted">
                      {cat.count} expense{cat.count !== 1 ? 's' : ''} · {formatPeso(cat.total)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Daily logins chart ────────────────────────────────── */}
      {data.daily_logins?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Daily Logins (Last 30 Days)</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex min-w-max items-end gap-1.5" style={{ height: '120px' }}>
              {data.daily_logins.map((entry) => {
                // Map logins to pixel height (max 100px so it fits the 120px container
                // with room for labels above and below). Min 4px so bars are always visible.
                const heightPx = Math.max(4, Math.round((entry.logins / maxLogins) * 100));
                const dayNum   = entry.day.slice(8, 10).replace(/^0/, '');
                return (
                  <div
                    key={entry.day}
                    className="flex flex-col items-center gap-1"
                    style={{ width: '24px' }}
                  >
                    <span className="text-[9px] leading-none text-muted">{entry.logins}</span>
                    <div
                      className="w-full rounded-t bg-brand transition-all duration-300"
                      style={{ height: `${heightPx}px` }}
                    />
                    <span className="text-[9px] leading-none text-muted">{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── User activity table ───────────────────────────────── */}
      {data.user_activity?.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">User Activity</h2>
            <p className="mt-0.5 text-sm text-muted">
              Sorted by most active users. Tap an email to see login history.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted">Expenses</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted">Total Spent</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {data.user_activity.map((user, idx) => (
                  <tr
                    key={user.email}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-page'}
                  >
                    <td
                      className="cursor-pointer px-4 py-3 font-medium text-ink hover:text-brand-dark hover:underline"
                      onClick={() => setSelectedUser({ email: user.email, id: user.id })}
                    >
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-muted">{user.expense_count}</td>
                    <td className="px-4 py-3 text-muted">{formatPeso(user.total_spent)}</td>
                    <td className="px-4 py-3 text-muted">{formatLocalDate(user.last_login)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── User detail modal ─────────────────────────────────── */}
      {selectedUser && (
        <UserDetailModal
          userEmail={selectedUser.email}
          userId={selectedUser.id}
          onClose={() => setSelectedUser(null)}
        />
      )}

    </div>
  );
}
