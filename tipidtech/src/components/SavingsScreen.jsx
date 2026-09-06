// SavingsScreen.jsx
// Full savings goals view — lists all goals (active first, completed below).
// "Add New Goal" button shows/hides SavingsGoalForm inline.

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import NavHeader       from './NavHeader';
import SavingsGoalCard from './SavingsGoalCard';
import SavingsGoalForm from './SavingsGoalForm';
import { getSavingsGoals } from '../utils/storage';

export default function SavingsScreen({ userId, onLogout, userEmail }) {
  const [goals,      setGoals]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [fetchError, setFetchError] = useState('');

  // ── Fetch all goals ───────────────────────────────────────────
  const loadGoals = useCallback(async () => {
    if (!userId) return;
    setFetchError('');
    try {
      setGoals(await getSavingsGoals(userId));
    } catch (err) {
      console.error('TipidTech: failed to load savings goals', err);
      setFetchError('Could not load savings goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  // ── Handlers ──────────────────────────────────────────────────
  function handleGoalCreated() { setShowForm(false); loadGoals(); }
  function handleGoalUpdated() { loadGoals(); }

  // ── Split active / completed ──────────────────────────────────
  const activeGoals    = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <NavHeader onLogout={onLogout} userEmail={userEmail} />

      <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-12 flex flex-col gap-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700"
            >
              + Add New Goal
            </button>
          )}
        </div>

        {/* New goal form */}
        {showForm && (
          <SavingsGoalForm
            userId={userId}
            onCreated={handleGoalCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Loading / error */}
        {loading    && <p className="text-sm text-gray-400 text-center py-8">Loading goals…</p>}
        {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}

        {/* Goals list */}
        {!loading && !fetchError && (
          <>
            {/* Active goals */}
            {activeGoals.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    userId={userId}
                    onGoalUpdated={handleGoalUpdated}
                  />
                ))}
              </div>
            ) : (
              !showForm && (
                <p className="text-sm text-gray-500 text-center py-6">
                  No active savings goals yet. Add one to start saving!
                </p>
              )
            )}

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wide">
                  Completed
                </h2>
                {completedGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    userId={userId}
                    onGoalUpdated={handleGoalUpdated}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Back link */}
        <Link
          to="/dashboard"
          className="self-start text-sm font-medium text-blue-600 no-underline hover:underline"
        >
          ← Back to Dashboard
        </Link>

      </div>
    </>
  );
}
