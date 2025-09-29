// client/src/pages/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already logged in with Supabase, go to dashboard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const ok = await pingMe(session.access_token);
        if (ok) navigate('/dashboard');
      }
    })();
  }, [navigate]);

  async function pingMe(token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include' // safe to include; backend ignores cookie on Bearer path
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr) throw signUpErr;
        // Optional: Supabase may require email confirmation depending on your project settings.
        // For now, flip back to login.
        setMode('login');
        setLoading(false);
        return;
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;

        const token = data.session?.access_token;
        if (!token) throw new Error('No session token from Supabase');

        // Call backend /me to upsert/resolve profile & confirm access
        const ok = await pingMe(token);
        if (!ok) throw new Error('Backend rejected the token');

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow p-8 border">
          <h1 className="text-2xl font-semibold text-center">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="mt-2 text-center text-gray-600">
            {mode === 'login' ? (
              <>New here?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>
                  Register
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Signed in with Supabase. We pass a Bearer token to your API; server verifies and links your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
