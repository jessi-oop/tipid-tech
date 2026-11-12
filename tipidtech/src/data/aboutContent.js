// data/aboutContent.js
// All copy for the About page (handoff 1.5). Edit text here, not in AboutScreen.
// Placeholders are marked TODO(about) — search for that to find them.
//
// Only claim what's true: no "secure", "bank-level" or "proven".
// "What data is stored" / "Who can see it" were written from storage.js and the
// admin screens on 2026-11-12. Update them if those change.
// Icons are lucide components; swap freely.

import {
  Wallet, ReceiptText, PieChart,
  UserRound, CalendarRange, Receipt, PiggyBank, LogIn,
  ShieldCheck, Database,
} from 'lucide-react';
import { CATEGORIES, SUGGESTED_PERCENTAGES, STATUS_THRESHOLDS, STATUS } from '../utils/constants';

const pct = (n) => `${Math.round(n * 100)}%`;
const green = pct(STATUS_THRESHOLDS.GREEN);
const yellow = pct(STATUS_THRESHOLDS.YELLOW);

export const ABOUT = {
  hero: {
    title: 'About TipidTech',
    description: 'A budget and expense tracker for Filipino students.',
    intro:
      "TipidTech helps you plan your allowance, track what you spend, and see if you're on pace before the money runs out.",
    steps: [
      { icon: Wallet, title: 'Plan', text: 'Set your allowance and how long it has to last.' },
      { icon: ReceiptText, title: 'Track', text: 'Log expenses as you go.' },
      { icon: PieChart, title: 'Understand', text: "The app tells you how you're doing: On track, Careful, or At risk." },
    ],
    note: "It gives you warnings, but it never stops you from saving an expense.",
  },

  data: {
    eyebrow: 'Your data',
    heading: 'What data is stored',
    items: [
      { icon: UserRound, label: 'Your account', text: 'Your email and password. No one can see your password, not even admins.' },
      { icon: CalendarRange, label: 'Your budget', text: 'Your allowance, how long it lasts, and how much you set for each category.' },
      { icon: Receipt, label: 'Your expenses', text: 'Amount, category, note, and when you added it.' },
      { icon: PiggyBank, label: 'Your savings goals', text: 'Each goal and the money you add to it.' },
      { icon: LogIn, label: 'Your logins', text: 'When you log in and what device you used.' },
    ],
  },

  access: {
    heading: 'Who can see it',
    items: [
      { icon: UserRound, label: 'You.', text: "Other users can't see your data." },
      { icon: ShieldCheck, label: 'TipidTech admins', text: "can see your email, how much you've spent in total, and when you log in. They can't see your individual expenses, budget, or savings goals." },
      { icon: Database, label: 'The people who run the database', text: 'can technically see everything stored in it.' },
    ],
    note: 'There\'s no "delete my account" button yet.',
  },

  numbers: {
    eyebrow: 'Honest numbers',
    heading: 'About the numbers',
    intro:
      "The suggested budget split and the On track / Careful / At risk colors are prototype guides. They're starting points we picked, not tested or proven rules.",
    splitHeading: 'Suggested budget split',
    split: CATEGORIES.map((c) => ({ ...c, share: SUGGESTED_PERCENTAGES[c.key], pct: pct(SUGGESTED_PERCENTAGES[c.key]) })),
    statusHeading: 'The status compares what you can still spend per day with what you planned per day:',
    statuses: [
      { key: STATUS.GREEN, text: `You can still spend at least ${green} of your planned daily amount.` },
      { key: STATUS.YELLOW, text: `Between ${yellow} and ${green}.` },
      { key: STATUS.RED, text: `Less than ${yellow}, or nothing left.` },
    ],
    note: 'This is general guidance, not professional financial advice.',
  },

  team: {
    heading: 'Who made it',
    // TODO(about): team names, school/course, why we built it
    text: 'Team details coming soon.',
  },

  contact: {
    heading: 'Contact and feedback',
    // href: mailto: or https:// shows a link; leave it out to show plain text.
    items: [
      { label: 'Email', value: 'juerine01202400700@usep.edu.ph', href: 'mailto:juerine01202400700@usep.edu.ph' },
      // TODO(about): add the Facebook profile URL as href to make this a link
      { label: 'Facebook', value: 'Jelian Erine' },
      { label: 'GitHub', value: 'github.com/jessi-oop', href: 'https://github.com/jessi-oop' },
    ],
  },

  // Logged-out visitors only
  cta: {
    heading: 'Ready to make your allowance last?',
    button: 'Log in or create an account',
  },
};
