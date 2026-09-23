// AuthScreen.jsx
// Login and Register screen.
// Desktop: split layout — left green branded panel with logo + tagline,
//          right half the login/register form. Mobile: single column.
// Two modes toggled on the same page: 'login' and 'register'.
// Wired to Supabase email+password auth.

import { useState } from 'react';
import { Wallet, PieChart, PiggyBank } from 'lucide-react';
import { supabase } from '../utils/supabase';

const BRAND_POINTS = [
  { icon: Wallet,   text: 'Track every peso you spend' },
  { icon: PieChart, text: 'See exactly where your money goes' },
  { icon: PiggyBank, text: 'Build savings goals that stick' },
];

export default function AuthScreen() {
  // ── Mode toggle ──────────────────────────────────────────────
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // ── Form fields ──────────────────────────────────────────────
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI state ─────────────────────────────────────────────────
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [info,    setInfo]    = useState('');

  // ─── Helpers ─────────────────────────────────────────────────

  function clearMessages() {
    setError('');
    setInfo('');
  }

  function switchMode(next) {
    setMode(next);
    clearMessages();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  function friendlyError(msg) {
    if (!msg) return 'Something went wrong. Please try again.';
    if (msg.includes('Invalid login credentials'))
      return 'Incorrect email or password.';
    if (msg.includes('Email not confirmed'))
      return 'Please confirm your email before logging in.';
    if (msg.includes('User already registered') || msg.includes('already been registered'))
      return 'An account with this email already exists. Try logging in.';
    if (msg.includes('Password should be at least'))
      return 'Password must be at least 6 characters.';
    if (msg.includes('Unable to validate email address'))
      return 'Please enter a valid email address.';
    return msg;
  }

  // ─── Submit handlers ──────────────────────────────────────────

  async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) setError(friendlyError(authError.message));
  }

  async function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(friendlyError(authError.message));
    } else {
      setInfo('Account created! If you were not logged in automatically, check your email to confirm your account.');
    }
  }

  // ── Shared input classes ──────────────────────────────────────
  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-ink bg-white transition-colors duration-150 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 appearance-none';
  const labelCls = 'text-sm font-semibold text-ink';

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-dvh bg-page">

      {/* Left branded panel — desktop only */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand p-12 lg:flex">
        <img src="/logo-mark.png" alt="TipidTech" className="h-20 w-fit" />

        <div className="flex flex-col gap-6">
          <h2 className="text-5xl font-extrabold leading-tight text-ink">
            Plan. Track.<br />Understand.
          </h2>
          <p className="text-xl font-medium text-ink/70">
            Make your allowance last.
          </p>
          <ul className="flex flex-col gap-3">
            {BRAND_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-ink">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70">
                  <Icon className="h-4 w-4 text-ink" aria-hidden="true" />
                </span>
                <span className="text-base font-medium">{text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-6xl font-extrabold leading-none tracking-tight">
            <span className="text-ink">Be Money</span>{' '}
            <span className="text-white">Wise.</span>
          </p>
        </div>

        <p className="text-sm font-medium text-ink/60">
          A simple spending-awareness tool for Filipino students.
        </p>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="flex w-full max-w-md flex-col gap-6">

          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-1 pb-1 lg:hidden">
            <img src="/logo-mark.png" alt="TipidTech" className="h-16 w-fit" />
          </div>

          {/* Card */}
          <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            {/* Pill tab toggle */}
            <div className="flex w-fit self-center rounded-full bg-page p-1" role="tablist">
              {[
                { key: 'login',    label: 'Log In' },
                { key: 'register', label: 'Register' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={mode === key}
                  type="button"
                  onClick={() => switchMode(key)}
                  className={`cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-150 ${
                    mode === key
                      ? 'bg-brand text-ink'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Feedback messages */}
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-600">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-relaxed text-green-700">
                {info}
              </p>
            )}

            {/* ── Login form ── */}
            {mode === 'login' && (
              <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className={inputCls}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className={inputCls}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? 'Logging in…' : 'Log In'}
                </button>
              </form>
            )}

            {/* ── Register form ── */}
            {mode === 'register' && (
              <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate>
                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="reg-email">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    className={inputCls}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    className={inputCls}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls} htmlFor="reg-confirm">Confirm Password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    className={inputCls}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Toggle link */}
            <p className="text-center text-sm text-muted">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="cursor-pointer border-none bg-transparent font-semibold text-ink underline underline-offset-2 hover:text-brand-dark"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="cursor-pointer border-none bg-transparent font-semibold text-ink underline underline-offset-2 hover:text-brand-dark"
                  >
                    Log In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}