// ui/OptionGroup.jsx
// Radio-tile option group. 1 column below xs (400px), 2 columns from xs up.
// Each tile is at least 56px tall (min-h-14) so it always meets the 44px tap
// target rule with comfortable room. The radio input is shrink-0 so it never
// squishes; the label text wraps freely. Keeps the current selected style
// (brand border + bg-brand/10).
//
// Props:
//   options      array of { key, label }   required
//   value        string (selected key)     required
//   onChange     (key: string) => void     required
//   name         string (radio group name) required
//   renderExtra  (option) => ReactNode     optional — rendered after label text
//   className    string                    optional
//
// Usage:
//   <OptionGroup
//     name="periodType"
//     options={PERIOD_OPTIONS}
//     value={periodType}
//     onChange={(key) => setPeriodType(key)}
//   />

export default function OptionGroup({ options, value, onChange, name, renderExtra, className = '' }) {
  return (
    <div className={`grid grid-cols-1 gap-2 xs:grid-cols-2 ${className}`}>
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <label
            key={option.key}
            className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors duration-150 select-none ${
              selected
                ? 'border-brand bg-brand/10 text-ink'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.key}
              checked={selected}
              onChange={() => onChange(option.key)}
              className="h-4 w-4 shrink-0 [accent-color:#80ed99]"
            />
            <span className="min-w-0">{option.label}</span>
            {renderExtra && renderExtra(option)}
          </label>
        );
      })}
    </div>
  );
}
