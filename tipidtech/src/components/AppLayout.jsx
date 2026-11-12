// AppLayout.jsx
// App shell for all authenticated screens.
// Desktop: fixed 240px left sidebar (always visible, never collapsible).
// Mobile:  hamburger → overlay drawer.
// Both sidebar and drawer share SidebarContent, which includes the
// Text Size control so it works identically in both places.

import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  PiggyBank,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ALargeSmall,
  BookOpen,
  Info,
  HelpCircle,
} from 'lucide-react';
import { TEXT_SIZE_OPTIONS, useTextSize } from '../utils/textSize';
import FirstTimeGuide from './FirstTimeGuide';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/history',   label: 'History',      icon: History         },
  { to: '/reports',   label: 'Reports',      icon: BarChart3       },
  { to: '/savings',   label: 'Savings Goals', icon: PiggyBank      },
  { to: '/learn',     label: 'Learn',        icon: BookOpen        },
  { to: '/about',     label: 'About',        icon: Info            },
];

function SidebarContent({ onLogout, userEmail, onNavigate, isAdmin, onOpenGuide }) {
  const [textSize, setTextSize] = useTextSize();

  return (
    <div className="flex h-full flex-col">

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <img
          src="/logo-mark.png"
          alt="TipidTech"
          className="h-10 w-auto max-w-[120px] object-contain"
        />
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150 no-underline ${
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
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150 no-underline ${
                isActive
                  ? 'bg-brand font-semibold text-ink'
                  : 'font-medium text-muted hover:bg-gray-50 hover:text-ink'
              }`
            }
          >
            <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            Admin
          </NavLink>
        )}
        <button
          type="button"
          onClick={() => { onNavigate?.(); onOpenGuide(); }}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent px-4 py-2.5 text-left text-sm font-medium text-muted transition-colors duration-150 hover:bg-gray-50 hover:text-ink"
        >
          <HelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          How it works
        </button>
      </nav>

      {/* Text size + user email + logout */}
      <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 p-4">

        {/* ── Text size control ─────────────────────────────────
            Three buttons; selected one gets brand fill.
            Each button is min 44 px tall (py-3 = 0.75rem × 2 + line
            height ≈ 44 px at 16 px root) for WCAG 2.5.5 tap target.
        ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span
            className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-widest text-muted"
            id="text-size-label"
          >
            <ALargeSmall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Text size
          </span>
          <div
            className="flex gap-1"
            role="group"
            aria-labelledby="text-size-label"
          >
            {TEXT_SIZE_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTextSize(key)}
                aria-pressed={textSize === key}
                className={`min-h-11 flex-1 cursor-pointer rounded-lg border py-3 text-xs font-semibold transition-colors duration-150 leading-none ${
                  textSize === key
                    ? 'border-brand bg-brand text-ink'
                    : 'border-gray-200 bg-white text-muted hover:border-gray-300 hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {userEmail && (
          <p className="truncate px-1 text-xs text-muted" title={userEmail}>
            {userEmail}
          </p>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark hover:border-brand-dark"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Log Out
          </button>
        )}
      </div>

    </div>
  );
}

export default function AppLayout({ children, onLogout, userEmail, isAdmin }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  // false | 'welcome' (auto, after first setup) | 'menu' (How it works).
  // App.jsx sets state.showGuide only for a user who hasn't seen it yet.
  const [guideOpen, setGuideOpen] = useState(() => (state?.showGuide ? 'welcome' : false));
  const openGuide = () => setGuideOpen('menu');

  // Drop the flag from history so a refresh or Back doesn't reopen it.
  useEffect(() => {
    if (state?.showGuide) navigate(pathname, { replace: true, state: null });
  }, [state, pathname, navigate]);

  // SPA navigation keeps the old scroll position; start each page at the top.
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-dvh bg-page">

      {/* Desktop sidebar — fixed, always visible */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 overflow-y-auto border-r border-gray-200 bg-white lg:block">
        <SidebarContent onLogout={onLogout} userEmail={userEmail} isAdmin={isAdmin} onOpenGuide={openGuide} />
      </aside>

      {/* Mobile top bar with hamburger */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg p-2 text-ink transition-colors duration-150 hover:bg-gray-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <img
          src="/logo-mark.png"
          alt="TipidTech"
          className="h-10 w-auto max-w-[120px] object-contain"
        />
      </div>

      {/* Mobile overlay drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {/* Drawer header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4">
              <img
                src="/logo.png"
                alt="TipidTech"
                className="h-8 w-auto max-w-[120px] object-contain"
              />
              <button
                type="button"
                onClick={closeDrawer}
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-ink"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {/* Scrollable sidebar content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarContent
                onLogout={onLogout}
                userEmail={userEmail}
                onNavigate={closeDrawer}
                isAdmin={isAdmin}
                onOpenGuide={openGuide}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-dvh bg-page lg:pl-60">
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
          {children}
        </div>
      </main>

      {guideOpen && <FirstTimeGuide welcome={guideOpen === 'welcome'} onClose={() => setGuideOpen(false)} />}

    </div>
  );
}
