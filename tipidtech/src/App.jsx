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
//   /dashboard  → Dashboard         (protected)
//   /history    → HistoryScreen     (protected)
//   /reports    → ReportsScreen     (protected)
//   /savings    → SavingsScreen     (protected) — added in Phase 14

import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

import SetupScreen     from './components/SetupScreen';
import BudgetScreen    from './components/BudgetScreen';
import Dashboard       from './components/Dashboard';
import AuthScreen      from './components/AuthScreen';
import ProtectedRoute  from './components/ProtectedRoute';
import HistoryScreen   from './components/HistoryScreen';
import ReportsScreen   from './components/ReportsScreen';
import SavingsScreen   from './components/SavingsScreen';

import { supabase }              from './utils/supabase';
import { getBudget, saveBudget, deleteBudget} from './utils/storage';
import { getSuggestedBudgets }   from './utils/calculations';


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
function stateToBudgetRow(allowance, periodType, nextAllowanceDate, startDate, categoryBudgets) {
  return {
    allowance,
    period:              periodType,
    next_allowance_date: nextAllowanceDate || null,
    start_date:          startDate,
    total_days:          0, // retained for schema compatibility; recalculated in calculations.js
    food_budget:         categoryBudgets.food,
    transport_budget:    categoryBudgets.transportation,
    school_budget:       categoryBudgets.school,
    personal_budget:     categoryBudgets.personal,
    savings_budget:      categoryBudgets.savings,
    emergency_budget:    categoryBudgets.emergency,
  };
}

// ─── App ──────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();

  // ── Auth state ────────────────────────────────────────────────
  const [session,     setSession]     = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  

  // ── Budget state ──────────────────────────────────────────────
  const budgetLoadedRef = useRef(false);
  const [budgetLoaded, setBudgetLoaded] = useState(false);
  const [allowance,         setAllowance]        = useState('');
  const [periodType,        setPeriodType]        = useState('weekly');
  const [nextAllowanceDate, setNextAllowanceDate] = useState('');
  const [startDate,         setStartDate]         = useState('');
  const [budgetId, setBudgetId] = useState('');
  const [categoryBudgets,   setCategoryBudgets]   = useState(getEmptyCategoryBudgets());
  const [budgetStartDate, setBudgetStartDate] = useState('');

  // ─── Auth initialisation ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing ?? false);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? false);
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
    setCategoryBudgets(getSuggestedBudgets(numericAllowance));
    navigate('/budget');
  }

  async function handleBudgetStart(finalBudgets) {
    const today = new Date().toISOString().split('T')[0];

    if (session?.user) {
      try {
        const saved = await saveBudget(
          session.user.id,
          stateToBudgetRow(allowance, periodType, nextAllowanceDate, today, finalBudgets)
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
    setBudgetId('');
    navigate('/setup');
}

  // ─── Root redirect ────────────────────────────────────────────
  function RootRedirect() {
    if (!authChecked) return null;
    if (!session)     return <Navigate to="/login"     replace />;
    if (!budgetLoaded) return null;
    if (!startDate)   return <Navigate to="/setup"     replace />;
    return                   <Navigate to="/dashboard" replace />;
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
              <Dashboard
                key={`${session?.user?.id}-${budgetId}`}
                userId={session?.user?.id}
                onReset={handleReset}
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute session={session}>
              <HistoryScreen
                userId={session?.user?.id}
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute session={session}>
              <ReportsScreen
                userId={session?.user?.id}
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/savings"
          element={
            <ProtectedRoute session={session}>
              <SavingsScreen
                userId={session?.user?.id}
                onLogout={handleLogout}
                userEmail={session?.user?.email ?? ''}
              />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
