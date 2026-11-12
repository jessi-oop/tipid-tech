// ProtectedRoute.jsx
// Wraps routes that require an active Supabase session.
// Redirects unauthenticated users to /login.

import { Navigate } from 'react-router-dom';

// Waits for authChecked so a page reload doesn't redirect before the session is restored.
export default function ProtectedRoute({ session, authChecked, children }) {
  if (!authChecked) return null;
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
