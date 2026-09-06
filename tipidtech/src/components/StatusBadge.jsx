// StatusBadge.jsx
// Displays the green / yellow / red spending status indicator.
// Receives a status result object from getSpendingStatus().

import { STATUS } from '../utils/constants';
import { formatPeso } from '../utils/calculations';

const STATUS_CONFIG = {
  [STATUS.GREEN]: {
    indicator: '🟢',
    heading:   "You're on track.",
    message:   'Your spending is currently within your planned pace.',
    wrapperCls: 'bg-green-50 border-green-200',
    headingCls: 'text-green-700',
  },
  [STATUS.YELLOW]: {
    indicator: '🟡',
    heading:   "You're spending a little quickly.",
    message:   "You've used more of your allowance than expected for this point in your budget period.",
    wrapperCls: 'bg-yellow-50 border-yellow-200',
    headingCls: 'text-yellow-700',
  },
  [STATUS.RED]: {
    indicator: '🔴',
    heading:   'You may run out before your next allowance.',
    message:   null,
    wrapperCls: 'bg-red-50 border-red-200',
    headingCls: 'text-red-700',
  },
  [STATUS.ENDED]: {
    indicator: '📅',
    heading:   'Your budget period has ended.',
    message:   'Start a new budget to continue tracking.',
    wrapperCls: 'bg-gray-100 border-gray-200',
    headingCls: 'text-gray-600',
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

  return (
    <div className={`rounded-2xl border px-5 py-4 flex flex-col gap-2 ${config.wrapperCls}`}>
      <div className="flex items-center gap-2 text-base">
        <span className="text-lg leading-none shrink-0">{config.indicator}</span>
        <strong className={config.headingCls}>{config.heading}</strong>
      </div>
      {message && (
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
      )}
    </div>
  );
}
