// StepIndicator.jsx
// Small "Step X of 2" indicator shown at the top of the setup flow screens.

export default function StepIndicator({ current }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold text-muted uppercase tracking-widest">
        Step {current} of 2
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className={`h-1.5 w-8 rounded-full ${current >= 1 ? 'bg-brand' : 'bg-gray-200'}`} />
        <span className={`h-1.5 w-8 rounded-full ${current >= 2 ? 'bg-brand' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
}