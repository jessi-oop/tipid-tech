// AdminRoute.jsx
// Route guard for admin-only pages.
// If no session → redirect to /login.
// If session but not admin → redirect to /dashboard.
// Real security is enforced server-side by the SECURITY DEFINER RPC function.

import { Navigate } from 'react-router-dom';

export default function AdminRoute({ session, isAdmin, adminChecked, children }) {
  if (!session)      return <Navigate to="/login"     replace />;
  if (!adminChecked) return null;
  if (!isAdmin)      return <Navigate to="/dashboard" replace />;
  return children;
}
