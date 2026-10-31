// ui/SegmentedControl.jsx
// Pill-shaped segmented toggle. Replaces the ad-hoc
// "flex w-fit rounded-full bg-page p-1" + px-6 py-2 button pattern
// that overflows on 320-360px phones.
//
// Mobile:  w-full, grid grid-flow-col auto-cols-fr so every segment
//          gets an equal share of the available width. No overflow.
// sm+:     w-fit, the pill shrinks to its content like before.
//
// Segments: px-3 xs:px-5 (not the old px-6), py-2, min-h-[2.75rem]
//           (44px tap target), labels wrap rather than push past the edge.
//
// Accessibility:
//   role="tablist" + role="tab" + aria-selected by default.
//   Pass role="radiogroup" to switch to radiogroup/radio/aria-checked.
//   Arrow keys cycle focus and selection within the group.
//
// Props:
//   options    [{ value: string, label: string }]   required
//   value      string                               required
//   onChange   (value: string) => void              required
//   ariaLabel  string                               required
//   role       'tablist' | 'radiogroup'             default 'tablist'
//   className  string                               optional

import { useRef } from 'react';

export default function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  role      = 'tablist',
  className = '',
}) {
  const isRadio        = role === 'radiogroup';
  const segmentRole    = isRadio ? 'radio'   : 'tab';
  const selectedAttr   = isRadio ? 'aria-checked' : 'aria-selected';
  const containerRef   = useRef(null);

  function handleKeyDown(e, idx) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight'
      ? (idx + 1) % options.length
      : (idx - 1 + options.length) % options.length;
    onChange(options[next].value);
    // Move DOM focus to the newly selected button
    const buttons = containerRef.current?.querySelectorAll('[role]');
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      // Mobile: full-width grid so segments split available space equally.
      // sm+: w-fit so the pill hugs its content.
      className={`grid w-full grid-flow-col auto-cols-fr rounded-full bg-page p-1 sm:w-fit sm:flex ${className}`}
    >
      {options.map((opt, idx) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role={segmentRole}
            {...{ [selectedAttr]: selected }}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            tabIndex={selected ? 0 : -1}
            className={`
              min-h-[2.75rem] min-w-0 cursor-pointer rounded-full
              px-3 py-2 text-center text-sm font-semibold
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
              xs:px-5
              ${selected
                ? 'bg-brand text-ink'
                : 'bg-transparent text-muted hover:text-ink'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
