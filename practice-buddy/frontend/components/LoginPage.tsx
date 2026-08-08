'use client';

import React, { useState } from 'react';
import api from '../lib/api';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isRegister
        ? await api.register({ username, password, email, firstName, lastName })
        : await api.login(username, password);
      localStorage.setItem('pb_token', data.token);
      localStorage.setItem('pb_user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <style>{`
        .login-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2.5rem; width: 100%; max-width: 420px; }
        .login-input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
        .login-input:focus { outline: none; border-color: #1a56db; }
        .login-btn { width: 100%; padding: 0.875rem; border-radius: 8px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .login-btn-primary { background: #1a56db; color: white; }
        .login-btn-primary:hover { background: #1648c0; }
        .login-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
      `}</style>

      <div className="login-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AEEG Practice Buddy</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your practice</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username" />
            </div>
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input className="login-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input className="login-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
            </div>
          </div>

          <button className="login-btn login-btn-primary mt-6" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:underline" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo Accounts:</p>
          <p>Student: student / student123</p>
          <p>Teacher: teacher / teacher123</p>
          <p>Admin: admin / admin123</p>
          <p>Access Code: AEEG-DEMO-2024</p>
        </div>
      </div>
    </div>
  );
}