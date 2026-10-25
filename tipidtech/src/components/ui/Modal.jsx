// ui/Modal.jsx
// Responsive modal shell used by every modal in the app.
//
// Mobile  (below sm):
//   Bottom sheet — slides up from the bottom, w-full, rounded-t-2xl,
//   max-h-[90dvh], scrollable body, sticky footer with safe-area inset.
//   No gap eaten by vertical padding on the backdrop.
//
// sm+ :
//   Centered dialog — max-w-md, rounded-2xl, same header/body/footer split.
//
// Behaviour:
//   • Closes on backdrop click (unless busy=true)
//   • Closes on Escape key   (unless busy=true)
//   • Locks body scroll while open
//
// Props:
//   title       string | ReactNode  required — rendered in sticky header
//   description string | ReactNode  optional — rendered below title in text-sm,
//                                   NEVER in the same flex row as the close button
//   onClose     () => void          required — called on backdrop/Escape/X
//   footer      ReactNode           optional — sticky bottom area (primary actions)
//   children    ReactNode           required — scrollable body
//   labelId     string              default 'modal-title' — for aria-labelledby
//   titleAs     'h2' | 'h3'        default 'h3'
//   busy        boolean             default false — blocks backdrop & Escape dismiss

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  title,
  description,
  onClose,
  footer,
  children,
  labelId  = 'modal-title',
  titleAs  = 'h3',
  busy     = false,
}) {
  // ── Body scroll lock ──────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Escape key ────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [busy, onClose]);

  // ── Backdrop click ────────────────────────────────────────────
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !busy) onClose();
  }

  const TitleTag = titleAs;

  return (
    /* Backdrop:
       mobile  → items-end   (sheet rises from bottom, no vertical padding)
       sm+     → items-center justify-center + px-4 (centered dialog)       */
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={handleBackdropClick}
    >
      {/* Sheet / dialog card */}
      <div
        className="flex w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl max-h-[90dvh] sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Sticky header ──────────────────────────────────────
            Title and close button are always in the same row.
            Description (if provided) lives BELOW the title row,
            never squeezed between title and X.                    */}
        <div className="shrink-0 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <TitleTag id={labelId} className="min-w-0 text-lg font-bold text-ink">
              {title}
            </TitleTag>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-45"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* ── Sticky footer ──────────────────────────────────────
            Primary actions live here so they're always visible
            without scrolling, even on short phones (360×640).
            pb-[safe-area] handles iPhone home bar.                */}
        {footer && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
