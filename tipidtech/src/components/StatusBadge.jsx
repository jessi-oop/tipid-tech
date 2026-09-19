// StatusBadge.jsx
// Displays the green / yellow / red spending status indicator as a stat card.
// Receives a status result object from getSpendingStatus(). Icon + colors only.

import { CheckCircle2, AlertTriangle, XCircle, CalendarDays } from 'lucide-react';
import { STATUS } from '../utils/constants';
import { formatPeso } from '../utils/calculations';

const STATUS_CONFIG = {
  [STATUS.GREEN]: {
    icon:      CheckCircle2,
    iconCls:   'text-green-600',
    heading:   "You're on track.",
    message:   'Your spending is currently within your planned pace.',
    wrapperCls: 'border-green-200',
  },
  [STATUS.YELLOW]: {
    icon:      AlertTriangle,
    iconCls:   'text-amber-500',
    heading:   "You're spending a little quickly.",
    message:   "You've used more of your allowance than expected for this point in your budget period.",
    wrapperCls: 'border-amber-200',
  },
  [STATUS.RED]: {
    icon:      XCircle,
    iconCls:   'text-red-600',
    heading:   'You may run out before your next allowance.',
    message:   null,
    wrapperCls: 'border-red-200',
  },
  [STATUS.ENDED]: {
    icon:      CalendarDays,
    iconCls:   'text-muted',
    heading:   'Your budget period has ended.',
    message:   'Start a new budget to continue tracking.',
    wrapperCls: 'border-gray-200',
  },
};

export default function StatusBadge({ statusResult, daysRemaining }) {
  if (!statusResult) return null;

  const { status, currentDaily } = statusResult;
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  let message = config.message;
  if (status === STATUS.RED && daysRemaining > 0) {
    message = `You have ${formatPeso(Math.max(0, currentDaily * daysRemaining))} remaining with ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left. That's about ${formatPeso(currentDaily)}/day.`;
  } else if (status === STATUS.RED && daysRemaining <= 0) {
    message = 'You have used your entire allowance.';
  }

  const Icon = config.icon;

  return (
    <div className={`flex flex-col gap-2 rounded-2xl border bg-white p-5 shadow-sm ${config.wrapperCls}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 shrink-0 ${config.iconCls}`} aria-hidden="true" />
        <strong className="text-sm font-semibold text-ink">{config.heading}</strong>
      </div>
      {message && (
        <p className="text-xs leading-relaxed text-muted">{message}</p>
      )}
    </div>
  );
}