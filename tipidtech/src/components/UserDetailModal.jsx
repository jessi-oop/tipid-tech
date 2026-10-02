// UserDetailModal.jsx
// Admin-only modal that shows a user's stats and login history.
// Calls get_user_login_history() RPC — enforced server-side via SECURITY DEFINER.

import { useState, useEffect } from 'react';
import { X }                   from 'lucide-react';
import { formatPeso }          from '../utils/calculations';
import { getUserLoginHistory } from '../utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────

function formatLocalDate(isoString) {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatLoginDateTime(isoString) {
  const d = new Date(isoString);
  return `${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

function parseUserAgent(ua) {
  if (!ua) return 'Unknown device';
  if (ua.includes('Edg'))     return 'Edge';       // check Edge before Chrome
  if (ua.includes('Chrome'))  return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari'))  return 'Safari';
  return 'Unknown browser';
}

// ─── Stat card ────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-page p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className="text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────

export default function UserDetailModal({ userEmail, userId, onClose }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getUserLoginHistory(userId)
      .then((res) => setData(res))
      .catch((err) => {
        console.error('TipidTech: failed to load user login history', err);
        setError('Could not load user details. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ─── Render ───────────────────────────────────────────────────
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="flex w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3
            id="user-detail-title"
            className="min-w-0 break-all text-base font-bold text-ink"
          >
            {userEmail}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {loading && (
          <p className="py-6 text-center text-sm text-muted">Loading…</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Member Since"    value={formatLocalDate(data.created_at)} />
              <StatCard label="Total Expenses"  value={data.expense_count}               />
              <StatCard label="Total Spent"     value={formatPeso(data.total_spent)}     />
            </div>

            {/* Login history */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Login History
              </p>
              {!data.login_history || data.login_history.length === 0 ? (
                <p className="text-sm text-muted">No login records yet.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {data.login_history.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between gap-3 px-4 py-3 ${
                        idx < data.login_history.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <span className="text-xs text-muted">
                        {formatLoginDateTime(entry.logged_in_at)}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-ink">
                        {parseUserAgent(entry.user_agent)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50"
        >
          Close
        </button>

      </div>
    </div>
  );
}
