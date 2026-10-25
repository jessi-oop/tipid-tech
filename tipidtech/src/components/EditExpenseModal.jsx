// EditExpenseModal.jsx
// Modal overlay for editing or deleting an existing expense.
// Pre-fills form with the selected expense's current values.
// Delete requires a two-step confirmation before proceeding.
// TipidTech is a decision-support tool — edit/delete are always permitted.

import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatPeso }         from '../utils/calculations';
import { updateExpense, deleteExpense } from '../utils/storage';
import Modal from './ui/Modal';

export default function EditExpenseModal({ expense, onSaved, onClose }) {
  const [amount,            setAmount]            = useState(String(expense.amount));
  const [category,          setCategory]          = useState(expense.category);
  const [note,              setNote]              = useState(expense.note ?? '');
  const [saving,            setSaving]            = useState(false);
  const [deleting,          setDeleting]          = useState(false);
  const [error,             setError]             = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const busy = saving || deleting;

  // ── Input class ───────────────────────────────────────────────
  const inputCls = (hasError) =>
    `w-full px-4 py-3 border rounded-lg text-base text-ink bg-white transition-colors duration-150 focus:outline-none focus:ring-2 appearance-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
        : 'border-gray-200 focus:border-brand focus:ring-brand/15'
    }`;

  function handleAmountChange(e) {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (error) setError('');
    }
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setError('');
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than ₱0.');
      return;
    }
    setSaving(true);
    try {
      await updateExpense(expense.id, { amount: parsed, category, note: note.trim() || null });
      onSaved();
      onClose();
    } catch (err) {
      console.error('TipidTech: failed to update expense', err);
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    setError('');
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error('TipidTech: failed to delete expense', err);
      setError('Could not delete expense. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  // ── Footer: Save (normal) or delete-confirm (when triggered) ──
  const footer = !showDeleteConfirm ? (
    <div className="flex flex-col gap-2">
      <button
        type="submit"
        form="edit-expense-form"
        disabled={busy}
        className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={busy}
        className="w-full cursor-pointer rounded-lg border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Delete Expense
      </button>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-red-700">
        Are you sure you want to delete this expense? This cannot be undone.
      </p>
      <p className="text-xs text-red-600">
        {formatPeso(expense.amount)} · {EXPENSE_CATEGORIES.find((c) => c.key === expense.category)?.label ?? expense.category}
        {expense.note ? ` · ${expense.note}` : ''}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="flex-1 cursor-pointer rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {deleting ? 'Deleting…' : 'Yes, Delete'}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={busy}
          className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Modal
      labelId="edit-expense-title"
      title="Edit Expense"
      description="Update the details of this expense or delete it permanently."
      onClose={onClose}
      busy={busy}
      footer={footer}
    >
      <form
        id="edit-expense-form"
        onSubmit={handleSave}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="edit-amount">Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 z-10 font-medium text-muted pointer-events-none">₱</span>
            <input
              id="edit-amount"
              type="text"
              inputMode="decimal"
              className={`${inputCls(!!error && !amount)} pl-8`}
              value={amount}
              onChange={handleAmountChange}
              autoComplete="off"
              disabled={busy}
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="edit-category">Category</label>
          <select
            id="edit-category"
            className={`${inputCls(false)} cursor-pointer`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
          >
            {EXPENSE_CATEGORIES.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-ink" htmlFor="edit-note">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="edit-note"
            type="text"
            className={inputCls(false)}
            placeholder="e.g. Lunch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            disabled={busy}
          />
        </div>

        {/* Inline error */}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
