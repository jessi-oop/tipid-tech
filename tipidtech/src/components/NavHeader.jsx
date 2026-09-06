// NavHeader.jsx
// Shared navigation header shown on all protected screens.
// Links: Dashboard · History · Reports
// Right side: user email + Logout button

import { NavLink } from 'react-router-dom';

export default function NavHeader({ onLogout, userEmail }) {
  return (
    <header className="nav-header">
      <div className="nav-header-inner">

        {/* Brand */}
        <NavLink to="/dashboard" className="nav-brand">
          TipidTech
        </NavLink>

        {/* Nav links */}
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link--active' : ''}`
            }
          >
            Reports
          </NavLink>
        </nav>

        {/* User + logout */}
        <div className="nav-right">
          {userEmail && (
            <span className="nav-user-email">{userEmail}</span>
          )}
          {onLogout && (
            <button
              type="button"
              className="nav-logout-btn"
              onClick={onLogout}
            >
              Log Out
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
