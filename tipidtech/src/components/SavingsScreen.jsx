// SavingsScreen.jsx
// Full savings goals view — lists all goals (active first, completed below).
// "Add New Goal" button shows/hides SavingsGoalForm inline.
// Desktop: 2-column goal card grid. Mobile: single column.

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';

import SavingsGoalCard from './SavingsGoalCard';
import SavingsGoalForm from './SavingsGoalForm';
import EditGoalModal           from './EditGoalModal';
import GoalContributionSummary from './GoalContributionSummary';
import { getSavingsGoals } from '../utils/storage';

export default function SavingsScreen({ userId, onLogout, userEmail }) {
  const [goals,        setGoals]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [fetchError,   setFetchError]   = useState('');
  const [editingGoal,  setEditingGoal]  = useState(null);
  const [viewingGoal,  setViewingGoal]  = useState(null);

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
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">Savings Goals</h1>
        <p className="text-sm text-muted mt-0.5">Tap a goal card to see your contribution history. Tap the pencil icon to edit or delete a goal.</p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add New Goal
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
      {loading    && <p className="py-8 text-center text-sm text-muted">Loading goals…</p>}
      {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}

      {/* Goals list */}
      {!loading && !fetchError && (
        <>
          {/* Active goals */}
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  userId={userId}
                  onGoalUpdated={handleGoalUpdated}
                  onEdit={(g) => setEditingGoal(g)}
                  onCardTap={(g) => setViewingGoal(g)}
                />
              ))}
            </div>
          ) : (
            !showForm && (
              <p className="py-6 text-center text-sm text-muted">
                No active savings goals yet. Add one to start saving!
              </p>
            )
          )}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Completed
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {completedGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    userId={userId}
                    onGoalUpdated={handleGoalUpdated}
                    onEdit={(g) => setEditingGoal(g)}
                    onCardTap={(g) => setViewingGoal(g)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Edit goal modal */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          onSaved={() => { setEditingGoal(null); loadGoals(); }}
          onClose={() => setEditingGoal(null)}
        />
      )}

      {/* Goal contribution summary modal */}
      {viewingGoal && (
        <GoalContributionSummary
          goal={viewingGoal}
          userId={userId}
          onClose={() => setViewingGoal(null)}
        />
      )}

    </div>
  );
}