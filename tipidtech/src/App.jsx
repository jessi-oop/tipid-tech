// App.jsx
// Root component — owns all application state and handles screen routing.
// No routing library; the current screen is just a state value.
//
// Screens:
//   'setup'     → SetupScreen   (enter allowance + budget period)
//   'budget'    → BudgetScreen  (review / edit suggested category budgets)
//   'dashboard' → Dashboard     (main tracking view)

import { useState, useEffect } from 'react';
import './App.css';

import SetupScreen   from './components/SetupScreen';
import BudgetScreen  from './components/BudgetScreen';
import Dashboard     from './components/Dashboard';

import { loadData, saveData, clearData } from './utils/localStorage';
import { getSuggestedBudgets }           from './utils/calculations';

// ─── Initial / empty state values ────────────────────────────────
// These are the defaults when no saved data exists.

function getEmptySetup() {
  return {
    allowance:          '',      // string while typing, number after confirmed
    periodType:         'weekly',
    nextAllowanceDate:  '',      // ISO date string, only used when periodType === 'date'
    startDate:          '',      // ISO date string — set when budget starts
  };
}

function getEmptyCategoryBudgets() {
  return {
    food:           0,
    transportation: 0,
    school:         0,
    personal:       0,
    savings:        0,
    emergency:      0,
  };
}

// ─── App ──────────────────────────────────────────────────────────

export default function App() {
  // ── Screen routing ──────────────────────────────────────────────
  // Not persisted — determined on load based on whether saved data exists.
  const [currentScreen, setCurrentScreen] = useState('setup');

  // ── Setup state ─────────────────────────────────────────────────
  const [allowance,         setAllowance]         = useState('');
  const [periodType,        setPeriodType]         = useState('weekly');
  const [nextAllowanceDate, setNextAllowanceDate]  = useState('');
  const [startDate,         setStartDate]          = useState('');

  // ── Budget state ─────────────────────────────────────────────────
  const [categoryBudgets, setCategoryBudgets] = useState(getEmptyCategoryBudgets());

  // ── Expense state ────────────────────────────────────────────────
  const [expenses, setExpenses] = useState([]);

  // ── UI state (not persisted) ─────────────────────────────────────
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // ─── Load saved data on mount ──────────────────────────────────
  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setAllowance(saved.allowance);
      setPeriodType(saved.periodType);
      setNextAllowanceDate(saved.nextAllowanceDate || '');
      setStartDate(saved.startDate || '');
      setCategoryBudgets(saved.categoryBudgets || getEmptyCategoryBudgets());
      setExpenses(saved.expenses || []);
      setCurrentScreen('dashboard');
    }
  }, []); // runs once on mount

  // ─── Persist to localStorage whenever relevant state changes ───
  useEffect(() => {
    // Only save when a budget has actually been started (startDate is set)
    if (!startDate) return;
    saveData({
      allowance,
      periodType,
      nextAllowanceDate,
      startDate,
      categoryBudgets,
      expenses,
    });
  }, [allowance, periodType, nextAllowanceDate, startDate, categoryBudgets, expenses]);

  // ─── Screen transition handlers ────────────────────────────────

  // Called by SetupScreen when the user clicks "Continue"
  function handleSetupComplete(setupData) {
    const numericAllowance = parseFloat(setupData.allowance);
    setAllowance(numericAllowance);
    setPeriodType(setupData.periodType);
    setNextAllowanceDate(setupData.nextAllowanceDate);
    // Pre-fill category budgets with suggested amounts
    setCategoryBudgets(getSuggestedBudgets(numericAllowance));
    setCurrentScreen('budget');
  }

  // Called by BudgetScreen when the user clicks "Start Budget"
  function handleBudgetStart(finalBudgets) {
    setCategoryBudgets(finalBudgets);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setStartDate(today);
    setExpenses([]);
    setCurrentScreen('dashboard');
  }

  // Called by BudgetScreen if the user wants to go back to setup
  function handleBudgetBack() {
    setCurrentScreen('setup');
  }

  // ─── Expense handlers ──────────────────────────────────────────

  // Add a new expense — called by AddExpenseForm
  function handleAddExpense(expenseData) {
    const newExpense = {
      id:          crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      amount:      parseFloat(expenseData.amount),
      category:    expenseData.category,
      description: expenseData.description.trim(),
      date:        new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newExpense]);
    setShowExpenseForm(false);
  }

  // ─── Reset ────────────────────────────────────────────────────
  // Clears all data and returns the user to the setup screen.
  function handleReset() {
    clearData();
    // Reset all state to defaults
    setAllowance('');
    setPeriodType('weekly');
    setNextAllowanceDate('');
    setStartDate('');
    setCategoryBudgets(getEmptyCategoryBudgets());
    setExpenses([]);
    setShowExpenseForm(false);
    setCurrentScreen('setup');
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="app">
      {currentScreen === 'setup' && (
        <SetupScreen
          onComplete={handleSetupComplete}
        />
      )}

      {currentScreen === 'budget' && (
        <BudgetScreen
          allowance={allowance}
          categoryBudgets={categoryBudgets}
          onStart={handleBudgetStart}
          onBack={handleBudgetBack}
        />
      )}

      {currentScreen === 'dashboard' && (
        <Dashboard
          allowance={allowance}
          periodType={periodType}
          nextAllowanceDate={nextAllowanceDate}
          startDate={startDate}
          categoryBudgets={categoryBudgets}
          expenses={expenses}
          showExpenseForm={showExpenseForm}
          onShowExpenseForm={() => setShowExpenseForm(true)}
          onHideExpenseForm={() => setShowExpenseForm(false)}
          onAddExpense={handleAddExpense}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
