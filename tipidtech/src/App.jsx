// App.jsx
// Root component — owns auth state and budget state.
// Uses React Router v6 for screen navigation.
// Expenses are now owned per-component (Dashboard loads its own from Supabase).
//
// Routes:
//   /login      → AuthScreen        (unauthenticated)
//   /           → redirects based on session + budget state
//   /setup      → SetupScreen       (protected)
//   /budget     → BudgetScreen      (protected)
//   /dashboard  → Dashboard         (protected, inside AppLayout)
//   /history    → HistoryScreen     (protected, inside AppLayout)

import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

import SetupScreen    from './components/SetupScreen';
import BudgetScreen   from './components/BudgetScreen';
import Dashboard      from './components/Dashboard';
import AuthScreen     from './components/AuthScreen';
import ProtectedRoute from './components/ProtectedRoute';
import HistoryScreen  from './components/HistoryScreen';
import AppLayout      from './components/AppLayout';

import { supabase }            from './utils/supabase';
import { getBudget, saveBudget, deleteBudget, logLogin } from './utils/storage';
import { getSuggestedBudgets } from './utils/calculations';


// ─── Helpers ──────────────────────────────────────────────────────

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

// Map a Supabase budget row → App state fields
function budgetRowToState(row) {
  return {
    allowance:          Number(row.allowance),
    periodType:         row.period,
    nextAllowanceDate:  row.next_allowance_date || '',
    startDate:          row.start_date,
    categoryBudgets: {
      food:           Number(row.food_budget),
      transportation: Number(row.transport_budget),
      school:         Number(row.school_budget),
      personal:       Number(row.personal_budget),
      savings:        Number(row.savings_budget),
      emergency:      Number(row.emergency_budget),
    },
  };
}

// Map App state fields → Supabase budget row shape
function stateToBudgetRow(allowance, periodType, nextAllowanceDate, startDate, categoryBudgets, endDate) {
  return {
    allowance,
    period:              periodType,
    next_allowance_date: nextAllowanceDate || null,
    start_date:          startDate,
    end_date:            endDate || null,
    total_days:          0, // retained for schema compatibility; recalculated in calculations.js
    food_budget:         categoryBudgets.food,
    transport_budget:    categoryBudgets.transportation,
    school_budget:       categoryBudgets.school,
    personal_budget:     categoryBudgets.personal,
    savings_budget:      categoryBudgets.savings,
    emergency_budget:    categoryBudgets.emergency,
  };
}

// Calculate end_date (YYYY-MM-DD) from startDate + periodType
function calcEndDate(startDate, periodType, nextAllowanceDate, customDays) {
  const start = new Date(startDate + 'T00:00:00');
  if (periodType === 'date') {
    return nextAllowanceDate || null;
  }
  let daysToAdd = null;
  if (periodType === 'daily')   daysToAdd = 1;
  if (periodType === 'weekly')  daysToAdd = 7;
  if (periodType === 'monthly') daysToAdd = 30;
  if (periodType === 'custom')  daysToAdd = parseInt(customDays, 10);
  if (!daysToAdd || isNaN(daysToAdd)) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + daysToAdd);
  return end.toISOString().split('T')[0];
}

// ─── App ──────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();

  // ── Auth state ────────────────────────────────────────────────
  const [session,     setSession]     = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Budget state ──────────────────────────────────────────────
  const budgetLoadedRef = useRef(false);
  const [budgetLoaded,      setBudgetLoaded]      = useState(false);
  const [allowance,         setAllowance]         = useState('');
  const [periodType,        setPeriodType]        = useState('weekly');
  const [nextAllowanceDate, setNextAllowanceDate] = useState('');
  const [startDate,         setStartDate]         = useState('');
  const [budgetId,          setBudgetId]          = useState('');
  const [categoryBudgets,   setCategoryBudgets]   = useState(getEmptyCategoryBudgets());
  const [customDays,        setCustomDays]        = useState('');

  // ─── Auth initialisation ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing ?? false);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession ?? false);
        if (_event === 'SIGNED_IN' && newSession?.user) {
          try {
            await logLogin(newSession.user.id);
          } catch (err) {
            console.error('TipidTech: failed to log login', err);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Load budget from Supabase when session becomes available ─
  useEffect(() => {
    if (!session?.user) return;
    if (budgetLoadedRef.current) return;

    getBudget(session.user.id)
      .then((row) => {
        if (row) {
          const state = budgetRowToState(row);
          setAllowance(state.allowance);
          setPeriodType(state.periodType);
          setNextAllowanceDate(state.nextAllowanceDate);
          setStartDate(state.startDate);
          setCategoryBudgets(state.categoryBudgets);
          setBudgetId(row.id);

          // Auto-reset check: if end_date exists and today is past it,
          // immediately trigger a reset so the user starts a fresh period.
          if (row.end_date) {
            const today = new Date().toISOString().split('T')[0];
            if (today > row.end_date) {
              // Fire-and-forget: delete and redirect to setup
              deleteBudget(session.user.id)
                .catch((err) => console.error('TipidTech: failed to delete expired budget', err))
                .finally(() => {
                  setBudgetId('');
                  setBudgetLoaded(false);
                  budgetLoadedRef.current = false;
                  navigate('/setup');
                });
              return; // skip setBudgetLoaded(true) — we're navigating away
            }
          }
        }
      })
      .catch((err) => console.error('TipidTech: failed to load budget', err))
      .finally(() => {
        budgetLoadedRef.current = true;
        setBudgetLoaded(true);
      });
  }, [session?.user?.id]);

  // ─── Screen transition handlers ───────────────────────────────

  function handleSetupComplete(setupData) {
    const numericAllowance = parseFloat(setupData.allowance);
    setAllowance(numericAllowance);
    setPeriodType(setupData.periodType);
    setNextAllowanceDate(setupData.nextAllowanceDate);
    setCustomDays(setupData.customDays || '');
    setCategoryBudgets(getSuggestedBudgets(numericAllowance));
    navigate('/budget');
  }

  async function handleBudgetStart(finalBudgets) {
    const today   = new Date().toISOString().split('T')[0];
    const endDate = calcEndDate(today, periodType, nextAllowanceDate, customDays);

    if (session?.user) {
      try {
        const saved = await saveBudget(
          session.user.id,
          stateToBudgetRow(allowance, periodType, nextAllowanceDate, today, finalBudgets, endDate)
        );
        setBudgetId(saved.id);
      } catch (err) {
        console.error('TipidTech: failed to save budget', err);
      }
    }

    navigate('/dashboard');
  }

  function handleBudgetBack() {
    navigate('/setup');
  }

  // ─── Logout ───────────────────────────────────────────────────

  async function handleLogout() {
    await supabase.auth.signOut();
    setAllowance('');
    setPeriodType('weekly');
    setNextAllowanceDate('');
    setStartDate('');
    setCategoryBudgets(getEmptyCategoryBudgets());
    setBudgetLoaded(false);
    budgetLoadedRef.current = false;
    navigate('/login');
  }

  // ─── Reset budget ─────────────────────────────────────────────

  async function handleReset() {
    if (session?.user) {
      try {
        await deleteBudget(session.user.id);
      } catch (err) {
        console.error('TipidTech: failed to delete budget', err);
      }
    }
    setAllowance('');
    setPeriodType('weekly');
    setNextAllowanceDate('');
    setStartDate('');
    setCustomDays('');
    setCategoryBudgets(getEmptyCategoryBudgets());
    setBudgetId('');
    setBudgetLoaded(false);
    budgetLoadedRef.current = false;
    navigate('/setup');
  }

  // ─── Root redirect ────────────────────────────────────────────
  function RootRedirect() {
    if (!authChecked)  return null;
    if (!session)      return <Navigate to="/login"     replace />;
    if (!budgetLoaded) return null;
    if (!startDate)    return <Navigate to="/setup"     replace />;
    return                    <Navigate to="/dashboard" replace />;
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/login"
          element={
            !authChecked ? null : session
              ? <Navigate to="/" replace />
              : <AuthScreen />
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute session={session}>
              <SetupScreen onComplete={handleSetupComplete} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <ProtectedRoute session={session}>
              <BudgetScreen
                allowance={allowance}
                categoryBudgets={categoryBudgets}
                onStart={handleBudgetStart}
                onBack={handleBudgetBack}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <AppLayout
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              >
                <Dashboard
                  key={`${session?.user?.id}-${budgetId}`}
                  userId={session?.user?.id}
                  onReset={handleReset}
                  onLogout={handleLogout}
                  userEmail={session?.user?.email ?? ''}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute session={session}>
              <AppLayout
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              >
                <HistoryScreen
                  userId={session?.user?.id}
                  budgetId={budgetId}
                  onLogout={handleLogout}
                  userEmail={session?.user?.email ?? ''}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
