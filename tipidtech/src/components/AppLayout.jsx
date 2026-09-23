// AppLayout.jsx
// App shell for all authenticated screens.
// Desktop: fixed 240px left sidebar (always visible, never collapsible) with
//          logo, nav links, user email and logout at the bottom.
// Mobile:  sidebar becomes a hamburger button that opens an overlay drawer,
//          and the main content takes the full width.
// Receives page content as children — no routing or data logic lives here.

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  PiggyBank,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/history',   label: 'History',     icon: History },
  { to: '/reports',   label: 'Reports',     icon: BarChart3 },
  { to: '/savings',   label: 'Savings Goals', icon: PiggyBank },
];

function SidebarContent({ onLogout, userEmail, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <img src="/logo-mark.png" alt="TipidTech" className="h-10 w-auto" />
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150 no-underline ${
                isActive
                  ? 'bg-brand font-semibold text-ink'
                  : 'font-medium text-muted hover:bg-gray-50 hover:text-ink'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 p-4">
        {userEmail && (
          <p className="truncate px-1 text-xs text-muted" title={userEmail}>
            {userEmail}
          </p>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark hover:border-brand-dark"          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children, onLogout, userEmail }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-dvh bg-page">
      {/* Desktop sidebar — fixed, always visible, never collapsible */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-gray-200 bg-white lg:block">
        <SidebarContent onLogout={onLogout} userEmail={userEmail} />
      </aside>

      {/* Mobile top bar with hamburger */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="cursor-pointer rounded-lg p-2 text-ink transition-colors duration-150 hover:bg-gray-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <img src="/logo-mark.png" alt="TipidTech" className="h-10 w-auto" />
      </div>

      {/* Mobile overlay drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
              <img src="/logo.png" alt="TipidTech" className="h-8 w-auto" />
              <button
                type="button"
                onClick={closeDrawer}
                className="cursor-pointer rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent onLogout={onLogout} userEmail={userEmail} onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      {/* Main content — right of the sidebar on desktop, full width on mobile */}
      <main className="min-h-dvh bg-page lg:pl-60">
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}