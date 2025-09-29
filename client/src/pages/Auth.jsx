import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (res.ok) navigate('/dashboard');
      } catch { /* noop */ }
    })();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong');

      if (mode === 'register') {
        setMode('login');
      } else {
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
          <h1 className="text-2xl font-semibold text-center">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p className="mt-2 text-center text-gray-600">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Register</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Sign in</button>
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
            This demo sets an httpOnly cookie on successful sign in. Replace nothing — it already uses your database via Prisma.
          </p>
        </div>
      </div>
    </div>
  );
}
