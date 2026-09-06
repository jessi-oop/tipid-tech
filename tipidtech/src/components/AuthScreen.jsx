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
  const [info,    setInfo]    = useState(''); // e.g. "Check your email"

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

  // Map Supabase error messages to friendlier copy
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

    if (authError) {
      setError(friendlyError(authError.message));
    }
    // On success: App.jsx onAuthStateChange fires and handles redirect
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
      // Supabase may send a confirmation email depending on project settings.
      // If email confirmation is disabled, onAuthStateChange fires immediately.
      setInfo('Account created! If you were not logged in automatically, check your email to confirm your account.');
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="screen auth-screen">
      {/* Brand */}
      <div className="auth-hero">
        <h1 className="app-title">TipidTech</h1>
        <p className="app-tagline">Plan. Track. Understand.</p>
      </div>

      {/* Card */}
      <div className="card auth-card">
        {/* Tab toggle */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Log In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab${mode === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Feedback messages */}
        {error && (
          <p className="auth-error" role="alert">{error}</p>
        )}
        {info && (
          <p className="auth-info" role="status">{info}</p>
        )}

        {/* ── Login form ── */}
        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        )}

        {/* ── Register form ── */}
        {mode === 'register' && (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle link */}
        <p className="auth-switch">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-switch-btn" onClick={() => switchMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-switch-btn" onClick={() => switchMode('login')}>
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
