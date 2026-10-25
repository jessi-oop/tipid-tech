// ui/SectionHeader.jsx
// Responsive section header. Enforces the rule: never put title + description +
// action in one horizontal row on mobile.
//
// Mobile  (below sm):
//   Title
//   Description  (text-sm text-muted, full width)
//   Action       (if a <button>: full width w-full; if a <Link> or inline element:
//                 w-fit left-aligned — caller controls this via the element itself)
//
// sm+ :
//   [Title + Description stacked, min-w-0 flex-1]   [Action shrink-0 self-start]
//
// Props:
//   title        string | ReactNode   required
//   description  string | ReactNode   optional
//   action       ReactNode            optional
//   as           'h1' | 'h2'          default 'h2'
//   className    string               default ''
//
// Usage:
//   <SectionHeader
//     as="h1"
//     title="Savings Goals"
//     description="Tap a card to see contribution history."
//     action={<button className="w-full sm:w-auto …">Add Goal</button>}
//   />

export default function SectionHeader({ title, description, action, as: Tag = 'h2', className = '' }) {
  return (
    <div className={`flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4 ${className}`}>

      {/* Title + description */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {typeof title === 'string' ? (
          <Tag className="text-2xl font-bold text-ink">{title}</Tag>
        ) : (
          title
        )}
        {description && (
          typeof description === 'string'
            ? <p className="text-sm text-muted">{description}</p>
            : description
        )}
      </div>

      {/* Action — rendered below on mobile, beside title from sm */}
      {action && (
        <div className="shrink-0 self-start pt-1">
          {action}
        </div>
      )}

    </div>
  );
}
