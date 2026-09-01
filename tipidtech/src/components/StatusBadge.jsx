// StatusBadge.jsx
// Displays the green / yellow / red spending status indicator.
// Receives a status result object from getSpendingStatus().

import { STATUS } from '../utils/constants';
import { formatPeso } from '../utils/calculations';

// Config for each status level
const STATUS_CONFIG = {
  [STATUS.GREEN]: {
    indicator: '🟢',
    heading:   "You're on track.",
    message:   'Your spending is currently within your planned pace.',
    className: 'status-badge--green',
  },
  [STATUS.YELLOW]: {
    indicator: '🟡',
    heading:   "You're spending a little quickly.",
    message:   "You've used more of your allowance than expected for this point in your budget period.",
    className: 'status-badge--yellow',
  },
  [STATUS.RED]: {
    indicator: '🔴',
    heading:   'You may run out before your next allowance.',
    message:   null, // built dynamically below
    className: 'status-badge--red',
  },
  [STATUS.ENDED]: {
    indicator: '📅',
    heading:   'Your budget period has ended.',
    message:   'Start a new budget to continue tracking.',
    className: 'status-badge--ended',
  },
};

export default function StatusBadge({ statusResult, daysRemaining }) {
  if (!statusResult) return null;

  const { status, currentDaily } = statusResult;
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  // For Red status, build a message that includes the numbers
  let message = config.message;
  if (status === STATUS.RED && daysRemaining > 0) {
    message = `You have ${formatPeso(Math.max(0, currentDaily * daysRemaining))} remaining with ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left. That's about ${formatPeso(currentDaily)}/day.`;
  } else if (status === STATUS.RED && daysRemaining <= 0) {
    message = 'You have used your entire allowance.';
  }

  return (
    <div className={`status-badge ${config.className}`}>
      <div className="status-badge-heading">
        <span className="status-indicator">{config.indicator}</span>
        <strong>{config.heading}</strong>
      </div>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
