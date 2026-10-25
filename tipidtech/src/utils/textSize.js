// textSize.js
// Manages the user's text-size preference.
//
// Three settings:
//   'normal'  →  --text-scale: 1      (default, looks identical to today)
//   'large'   →  --text-scale: 1.125  (+12.5%)
//   'xl'      →  --text-scale: 1.25   (+25%)
//
// Persistence  : localStorage key 'tipidtech-text-size'
// DOM effect   : sets/removes data-text-size on <html>, which the CSS
//                custom-property selectors in index.css pick up.
// Flash guard  : index.html has an inline <script> that reads the same
//                key and sets the attribute synchronously before first paint.

import { useState, useEffect } from 'react';

export const STORAGE_KEY = 'tipidtech-text-size';

const VALID = new Set(['normal', 'large', 'xl']);

export const TEXT_SIZE_OPTIONS = [
  { key: 'normal', label: 'Normal'      },
  { key: 'large',  label: 'Large'       },
  { key: 'xl',     label: 'Extra Large' },
];

/** Read the saved preference; falls back to 'normal'. */
export function getTextSize() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID.has(saved)) return saved;
  } catch (_) {}
  return 'normal';
}

/**
 * Persist a new preference and apply it to the DOM immediately.
 * Safe to call before React mounts (index.html uses the same logic).
 */
export function setTextSize(size) {
  if (!VALID.has(size)) return;
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch (_) {}
  if (size === 'normal') {
    document.documentElement.removeAttribute('data-text-size');
  } else {
    document.documentElement.setAttribute('data-text-size', size);
  }
}

/**
 * React hook — returns [currentSize, setSizeAndPersist].
 * Reads from localStorage on mount; updating calls setTextSize() so
 * the DOM attribute, localStorage, and React state stay in sync.
 */
export function useTextSize() {
  const [size, setSize] = useState(getTextSize);

  useEffect(() => {
    setTextSize(size);
  }, [size]);

  return [size, setSize];
}
