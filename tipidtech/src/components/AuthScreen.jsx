// AuthScreen.jsx
// Login and Register screen.
// Two modes toggled on the same page: 'login' and 'register'.
// Wired to Supabase email+password auth.
// On success, the onAuthStateChange listener in App.jsx handles the redirect.

import { useState } from 'react';
import { supabase } from '../utils/supabase';

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
  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white transition-colors duration-150 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none';
  const labelCls = 'text-sm font-semibold text-gray-900';

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12 flex flex-col gap-5 min-h-dvh justify-center">

      {/* Brand */}
      <div className="text-center pb-2">
        <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight">TipidTech</h1>
        <p className="text-lg text-gray-500 mt-1">Plan. Track. Understand.</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col gap-5 p-5">

        {/* Tab toggle */}
        <div className="flex border-b-2 border-gray-200" role="tablist">
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
              className={`flex-1 py-3 px-4 text-base font-semibold border-b-2 -mb-0.5 transition-colors duration-150 cursor-pointer bg-transparent ${
                mode === key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feedback messages */}
        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 leading-relaxed">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 leading-relaxed">
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
              className="w-full py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed"
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
              className="w-full py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle link */}
        <p className="text-sm text-gray-500 text-center">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-blue-600 font-semibold bg-transparent border-none cursor-pointer underline underline-offset-1 hover:text-blue-700"
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
                className="text-blue-600 font-semibold bg-transparent border-none cursor-pointer underline underline-offset-1 hover:text-blue-700"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
