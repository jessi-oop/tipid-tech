// storage.js
// All Supabase database queries for TipidTech V2.
// This replaces localStorage.js as the single source of truth for persisted data.
// Every function is async and returns the data directly (throws on error).

import { supabase } from './supabase';

// ─── Budget ───────────────────────────────────────────────────────

/**
 * Fetch the active budget row for the given user.
 * Returns the budget object, or null if none exists.
 */
export async function getBudget(userId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data; // null if no budget yet
}

/**
 * Insert or update the budget row for the given user.
 * Uses upsert so calling this when a budget already exists updates it.
 */
export async function saveBudget(userId, budgetData) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { ...budgetData, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudget(userId) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// ─── Expenses ─────────────────────────────────────────────────────

/**
 * Insert a new expense row for the given user.
 * expenseData: { amount, category, note }
 * created_at is set by the database default.
 */
export async function addExpense(userId, expenseData) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expenseData, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch the N most recent expenses for the user.
 * Defaults to 5 (matches MAX_RECENT_EXPENSES in constants.js).
 */
export async function getRecentExpenses(userId, limit = 5) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch every expense for the user, newest first.
 * Used by HistoryScreen.
 */
export async function getAllExpenses(userId) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all expenses for the user on a specific calendar date.
 * date: ISO string 'YYYY-MM-DD'
 * Used by the Daily Report and the pie chart "Today" toggle.
 */
export async function getExpensesByDate(userId, date) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', `${date}T00:00:00`)
    .lte('created_at', `${date}T23:59:59`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all expenses for the user within a date range (inclusive).
 * weekStart / weekEnd: Date objects or ISO strings.
 * Used by the Weekly Report and the pie chart "This Week" toggle.
 */
export async function getExpensesByWeek(userId, weekStart, weekEnd) {
  const start = new Date(weekStart).toISOString();
  const end   = new Date(weekEnd).toISOString();

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Return the sum of all expense amounts for the user's current budget period.
 * budgetStartDate: ISO string 'YYYY-MM-DD' — expenses before this date are excluded.
 */
export async function getTotalExpenses(userId, budgetStartDate) {
  const start = `${budgetStartDate}T00:00:00`;

  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', start);

  if (error) throw error;

  const total = (data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  return total;
}
