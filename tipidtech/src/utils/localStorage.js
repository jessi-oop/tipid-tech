// localStorage.js
// Simple helpers to load, save, and clear TipidTech data from localStorage.
// All app data is stored as a single JSON object under one key.

import { STORAGE_KEY } from './constants';

/**
 * Load saved TipidTech data from localStorage.
 * Returns the parsed object, or null if nothing is saved or data is invalid.
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Basic sanity check — must have an allowance to be considered valid
    if (!data || typeof data.allowance !== 'number') return null;
    return data;
  } catch {
    // Corrupted data — treat as empty
    return null;
  }
}

/**
 * Save TipidTech data to localStorage.
 * Pass the full data object; it will be serialised to JSON.
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore in prototype
    console.warn('TipidTech: could not save to localStorage.');
  }
}

/**
 * Clear all TipidTech data from localStorage.
 * Called when the user clicks "Reset Budget".
 */
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn('TipidTech: could not clear localStorage.');
  }
}
