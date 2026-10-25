// ui/Card.jsx
// Standard card surface. Two variants:
//   default — p-4 sm:p-6, rounded-2xl, border, white bg, shadow, min-w-0
//   flush   — overflow-hidden, rounded-2xl, border, white bg, shadow, min-w-0
//             (no padding — children supply their own horizontal/vertical spacing)
//
// min-w-0 is always applied so the card never forces its flex/grid parent wider
// than the viewport.
//
// Usage:
//   <Card>…content…</Card>
//   <Card variant="flush">…content with own padding…</Card>
//   <Card className="extra-classes">…</Card>

export default function Card({ children, variant = 'default', className = '' }) {
  const base = 'min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm';

  const variants = {
    default: 'p-4 sm:p-6',
    flush:   'overflow-hidden',
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
