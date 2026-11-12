// FirstTimeGuide.jsx
// Handoff 1.3: four skippable cards shown once after the first budget setup,
// reopened anytime from Menu → How it works. Rendered by AppLayout.
//
// "Seen" flag is device-first and per user: localStorage 'tipidtech-guide-seen-<userId>'.
// App.jsx decides and marks it when the guide auto-shows; reopening from the menu
// doesn't touch it.
//
// Props:
//   onClose  () => void  required
//   welcome  boolean     default false — first card titled "Welcome to TipidTech!" (auto-open after setup)

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Modal from './ui/Modal';
import { STATUS_THRESHOLDS } from '../utils/constants';

const seenKey = (userId) => `tipidtech-guide-seen-${userId}`;

export function isGuideSeen(userId) {
  try { return localStorage.getItem(seenKey(userId)) === '1'; } catch (_) { return false; }
}

export function markGuideSeen(userId) {
  try { localStorage.setItem(seenKey(userId), '1'); } catch (_) {}
}

const green  = Math.round(STATUS_THRESHOLDS.GREEN * 100);
const yellow = Math.round(STATUS_THRESHOLDS.YELLOW * 100);

const STATUSES = [
  { icon: CheckCircle2,  cls: 'text-green-600', word: 'On track', text: `You can still spend at least ${green}% of your planned daily amount.` },
  { icon: AlertTriangle, cls: 'text-amber-500', word: 'Careful',  text: `You can spend ${yellow}% to ${green - 1}% of it.` },
  { icon: XCircle,       cls: 'text-red-600',   word: 'At risk',  text: `You can spend less than ${yellow}%, or nothing is left.` },
];

const note = 'mt-4 text-xs text-muted';

const CARDS = [
  {
    title: 'How TipidTech works', // replaced by "Welcome to TipidTech!" when shown after first setup
    body: (
      <>
      <p className="text-sm text-ink">Here's a quick look at how to use TipidTech, in 4 short cards. You can skip anytime.</p>
      <h3 className="mb-2 mt-4 text-sm font-semibold text-ink">Plan, Track, Understand</h3>
      <ul className="flex flex-col gap-3 text-sm text-ink">
        <li><strong>Plan:</strong> Set your allowance and how long it needs to last. We suggest a split you can change.</li>
        <li><strong>Track:</strong> Log each expense when you spend. It only takes a few seconds.</li>
        <li><strong>Understand:</strong> See if you're on pace, and where your money goes.</li>
      </ul>
      </>
    ),
  },
  {
    title: 'What the colors mean',
    body: (
      <>
        <p className="text-sm text-ink">TipidTech compares what you can still spend per day with what you planned per day.</p>
        <ul className="mt-3 flex flex-col gap-3">
          {STATUSES.map(({ icon: Icon, cls, word, text }) => (
            <li key={word} className="flex items-start gap-2 text-sm text-ink">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} aria-hidden="true" />
              <span className="min-w-0"><strong>{word}.</strong> {text}</span>
            </li>
          ))}
        </ul>
        <p className={note}>These cutoffs are prototype guides, not tested rules. This is general guidance, not professional financial advice.</p>
      </>
    ),
  },
  {
    title: 'Savings vs. Savings Goals',
    body: (
      <>
        <ul className="flex flex-col gap-3 text-sm text-ink">
          <li><strong>Savings category:</strong> Part of this period's budget, set aside on your budget screen.</li>
          <li><strong>Savings Goals:</strong> Something specific you're saving toward, like a new phone. Add money to a goal with <strong>Add Contribution</strong> on the Savings Goals page.</li>
        </ul>
        <p className={note}>They're separate. Money in one doesn't count toward the other.</p>
      </>
    ),
  },
  {
    title: 'Add your first expense',
    body: (
      <>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm text-ink">
          <li>On your Dashboard, tap <strong>Add Expense</strong> under Recent Expenses.</li>
          <li>Enter the amount and pick a category. A note is optional.</li>
          <li>Tap <strong>Add Expense</strong> to save.</li>
        </ol>
        <p className={note}>You can open this guide again anytime from the menu: <strong>How it works</strong>.</p>
      </>
    ),
  },
];

const btn = 'min-h-11 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-150';
const secondary = `${btn} border border-gray-200 bg-white hover:bg-gray-50`;
const primary   = `${btn} flex-1 bg-brand hover:bg-brand-dark`;

export default function FirstTimeGuide({ onClose, welcome = false }) {
  const [step, setStep] = useState(0);
  const last = step === CARDS.length - 1;

  return (
    <Modal
      title={welcome && step === 0 ? 'Welcome to TipidTech!' : CARDS[step].title}
      description={`${step + 1} of ${CARDS.length}`}
      onClose={onClose}
      labelId="guide-title"
      titleAs="h2"
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-2" aria-hidden="true">
            {CARDS.map((c, i) => (
              <span key={c.title} className={`h-2 rounded-full ${i === step ? 'w-5 bg-brand-dark' : 'w-2 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" className={secondary} onClick={() => setStep(step - 1)}>Back</button>
            )}
            {!last && (
              <button type="button" className={secondary} onClick={onClose}>Skip</button>
            )}
            <button type="button" className={primary} onClick={last ? onClose : () => setStep(step + 1)}>
              {last ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      }
    >
      {CARDS[step].body}
    </Modal>
  );
}
