import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth.jsx';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold">My Dashboard</h1>
        <a className="text-sm text-blue-600" href="/">Log out</a>
      </nav>
      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Welcome!</h2>
            <p className="mt-2 text-gray-600">You are logged in. Replace this with your real dashboard.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}