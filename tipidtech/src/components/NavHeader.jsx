// NavHeader.jsx
// Shared navigation header shown on all protected screens.
// Links: Dashboard · History · Reports · Savings Goals
// Right side: user email + Logout button

import { NavLink } from 'react-router-dom';

export default function NavHeader({ onLogout, userEmail }) {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-13 flex items-center gap-4">

        {/* Brand */}
        <NavLink
          to="/dashboard"
          className="text-lg font-extrabold text-blue-600 no-underline tracking-tight shrink-0 hover:text-blue-700"
        >
          TipidTech
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1" aria-label="Main navigation">
          {[
            { to: '/dashboard',  label: 'Dashboard' },
            { to: '/history',    label: 'History' },
            { to: '/reports',    label: 'Reports' },
            { to: '/savings',    label: 'Savings Goals' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium no-underline px-3 py-2 rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-2 shrink-0">
          {userEmail && (
            <span className="text-xs text-gray-400 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap hidden sm:block">
              {userEmail}
            </span>
          )}
          {onLogout && (
            <button
              type="button"
              className="text-xs font-medium text-gray-500 border border-gray-200 rounded px-3 py-1 bg-transparent cursor-pointer transition-colors duration-150 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap"
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
