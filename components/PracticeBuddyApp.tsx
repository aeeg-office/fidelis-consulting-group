'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import PracticePage from './PracticePage';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';

export default function PracticeBuddyApp() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pb_token');
    const savedUser = localStorage.getItem('pb_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function handleLogin(newToken: string, newUser: any) {
    setToken(newToken);
    setUser(newUser);
  }

  function handleLogout() {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    setToken(null);
    setUser(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = ['administrator', 'superAdministrator'].includes(user.role);
  const isTeacher = ['teacher', 'seniorTeacher'].includes(user.role);

  return (
    <div>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-blue-700 mr-2">AEEG</span>
            <span className="text-gray-700 font-medium">Practice Buddy</span>
            <div className="h-5 w-px bg-gray-300 mx-3" />
            <button onClick={() => setPage('dashboard')} className={`px-3 py-1.5 rounded text-sm font-medium ${page === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</button>
            <button onClick={() => setPage('practice')} className={`px-3 py-1.5 rounded text-sm font-medium ${page === 'practice' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Practice</button>
            {isTeacher && (
              <button onClick={() => setPage('teacher')} className={`px-3 py-1.5 rounded text-sm font-medium ${page === 'teacher' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Teacher</button>
            )}
            {isAdmin && (
              <button onClick={() => setPage('admin')} className={`px-3 py-1.5 rounded text-sm font-medium ${page === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Admin</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.displayName || user.username}</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">{user.role}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {page === 'dashboard' && <StudentDashboard />}
      {page === 'practice' && <PracticePage />}
      {page === 'teacher' && isTeacher && <TeacherDashboard />}
      {page === 'admin' && isAdmin && <AdminDashboard />}
    </div>
  );
}