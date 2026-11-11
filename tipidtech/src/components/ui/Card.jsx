// ui/Card.jsx
// Standard card surface. Two variants, two tones.
//
// variant:
//   default — p-4 sm:p-6, rounded-2xl, border, shadow, min-w-0
//   flush   — overflow-hidden, rounded-2xl, border, shadow, min-w-0
//             (no padding — children supply their own spacing)
//
// tone:
//   surface — bg-white  (default, same as before)
//   page    — bg-page   (for completed / muted cards that sit on the same bg)
//
// min-w-0 is always applied so the card never forces its flex/grid parent wider.
//
// Usage:
//   <Card>…</Card>
//   <Card variant="flush">…</Card>
//   <Card tone="page">…</Card>
//   <Card variant="flush" tone="page" className="extra">…</Card>

export default function Card({ children, variant = 'default', tone = 'surface', className = '' }) {
  const tones = {
    surface: 'bg-white',
    page:    'bg-page',
  };

  const variants = {
    default: 'p-4 sm:p-6',
    flush:   'overflow-hidden',
  };

  return (
    <div className={`min-w-0 rounded-2xl border border-gray-200 shadow-sm ${tones[tone]} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
