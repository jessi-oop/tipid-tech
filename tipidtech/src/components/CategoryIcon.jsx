// CategoryIcon.jsx
// Maps an expense category key to a Lucide icon so the UI stays emoji-free.
// Purely presentational — the category data in constants.js is untouched.

import { Utensils, Bus, BookOpen, ShoppingBag, PiggyBank, HeartPulse, Pin } from 'lucide-react';

const ICONS = {
  food:           Utensils,
  transportation: Bus,
  school:         BookOpen,
  personal:       ShoppingBag,
  savings:        PiggyBank,
  emergency:      HeartPulse,
  other:          Pin,
};

export default function CategoryIcon({ category, className = 'w-4 h-4' }) {
  const Icon = ICONS[category] ?? Pin;
  return <Icon className={className} aria-hidden="true" />;
}