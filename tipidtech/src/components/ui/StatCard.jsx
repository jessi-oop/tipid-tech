// ui/StatCard.jsx
// Metric card: uppercase label, bold value, optional helper line, optional icon.
// min-w-0 and break-words so long values (peso amounts, long strings) never overflow.
//
// Props:
//   label          string             required
//   value          string|ReactNode   required
//   helper         string|ReactNode   optional — secondary line below value
//   icon           ReactNode          optional — small icon, right of label
//   size           'default'|'compact' default 'default'
//                    default  → p-4 sm:p-5, value text-2xl sm:text-3xl
//                    compact  → p-3,        value text-lg sm:text-xl
//                    (compact is used inside modals and tight grids)
//   tone           'surface'|'page'   default 'surface'
//                    surface → bg-white
//                    page    → bg-page  (muted/completed contexts)
//   valueClassName string             optional — extra classes on the value <p>
//                    e.g. "text-red-600" for Total Spent in PeriodSummaryModal
//   className      string             optional — extra classes on the root div
//
// Usage:
//   <StatCard label="Days Left" value={7} helper="Weekly period" />
//   <StatCard label="Total Spent" value={formatPeso(n)} size="compact" tone="page" valueClassName="text-red-600" />

export default function StatCard({ label, value, helper, icon, size = 'default', tone = 'surface', valueClassName = '', className = '' }) {
  const tones = {
    surface: 'bg-white',
    page:    'bg-page',
  };

  const sizes = {
    default: { wrap: 'p-4 sm:p-5', value: 'text-2xl sm:text-3xl' },
    compact: { wrap: 'p-3',        value: 'text-lg sm:text-xl'   },
  };

  const s = sizes[size] ?? sizes.default;

  return (
    <div className={`flex min-w-0 flex-col gap-2 rounded-2xl border border-gray-200 shadow-sm ${tones[tone]} ${s.wrap} ${className}`}>
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
      <p className={`min-w-0 break-words font-extrabold leading-tight ${s.value} ${valueClassName || 'text-ink'}`}>
        {value}
      </p>
      {helper && (
        <p className="text-xs leading-snug text-muted">{helper}</p>
      )}
    </div>
  );
}
