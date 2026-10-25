// ui/StatCard.jsx
// Metric card: label (uppercase xs), value (large bold), optional helper line,
// optional icon. min-w-0 and break-words so long values never overflow.
//
// Props:
//   label    string             required — short uppercase descriptor
//   value    string|ReactNode   required — primary metric
//   helper   string|ReactNode   optional — secondary line below value (was "sub")
//   icon     ReactNode          optional — small icon, right of label
//   className string            optional
//
// Usage:
//   <StatCard label="Days Left" value={7} helper="Weekly budget period" />
//   <StatCard label="Total Users" value={count} icon={<Users className="h-4 w-4" />} />

export default function StatCard({ label, value, helper, icon, className = '' }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </p>
        {icon && (
          <span className="shrink-0 text-brand-dark" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="min-w-0 break-words text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
        {value}
      </p>
      {helper && (
        <p className="text-xs leading-snug text-muted">{helper}</p>
      )}
    </div>
  );
}
