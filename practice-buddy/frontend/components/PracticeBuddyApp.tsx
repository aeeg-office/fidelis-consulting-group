'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import PracticePage from './PracticePage';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import EnterpriseDashboard from './EnterpriseDashboard';
import DiagnosticPlatform from './DiagnosticPlatform';
import MockExamCenter from './MockExamCenter';
import LearningObjectViewer from './LearningObjectViewer';
import SpeakingPlatform from './SpeakingPlatform';
import SecureWritingPlatform from './SecureWritingPlatform';
import TeacherWorkflowPanel from './TeacherWorkflowPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import EnterpriseCMS from './EnterpriseCMS';
import SubscriptionManagement from './SubscriptionManagement';
import AdaptiveLearningEngine from './AdaptiveLearningEngine';
import ParentDashboard from './ParentDashboard';

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
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" /></div>;
  }

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = ['administrator', 'superAdministrator'].includes(user.role);
  const isTeacher = ['teacher', 'seniorTeacher'].includes(user.role);
  const isParent = user.role === 'parent';
  const isStudent = user.role === 'student';

  const navBtn = (key: string, label: string, show: boolean = true) =>
    show ? (
      <button
        key={key}
        onClick={() => setPage(key)}
        className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap ${
          page === key ? 'bg-[#1B2A4A] text-[#C9A84C]' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {label}
      </button>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#1B2A4A] mr-2">AEEG</span>
            <span className="text-gray-700 font-medium">Practice Buddy</span>
            <div className="h-5 w-px bg-gray-300 mx-3" />
            {navBtn('dashboard', 'Dashboard')}
            {navBtn('practice', 'Practice', isStudent || isTeacher)}
            {navBtn('diagnostics', 'Diagnostics', isStudent)}
            {navBtn('mock-exams', 'Mock Exams', isStudent)}
            {navBtn('learning', 'Learn', isStudent)}
            {navBtn('speaking', 'Speaking', isStudent)}
            {navBtn('writing', 'Writing', isStudent)}
            {navBtn('adaptive', 'AI Coach', isStudent)}
            {navBtn('analytics', 'Analytics', isStudent || isTeacher || isParent)}
            {navBtn('teacher', 'Teacher', isTeacher)}
            {navBtn('reviews', 'Reviews', isTeacher)}
            {navBtn('parent', 'Parent', isParent)}
            {navBtn('subscriptions', 'Plans', true)}
            {navBtn('admin', 'Admin', isAdmin)}
            {navBtn('cms', 'CMS', isAdmin)}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <span className="text-sm text-gray-500">{user.displayName || user.username}</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">{user.role}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto">
        {page === 'dashboard' && (isStudent ? <StudentDashboard /> : <EnterpriseDashboard user={user} onNavigate={setPage} />)}
        {page === 'practice' && <PracticePage />}
        {page === 'diagnostics' && <DiagnosticPlatform />}
        {page === 'mock-exams' && <MockExamCenter />}
        {page === 'learning' && <LearningObjectViewer />}
        {page === 'speaking' && <SpeakingPlatform />}
        {page === 'writing' && <SecureWritingPlatform />}
        {page === 'adaptive' && <AdaptiveLearningEngine />}
        {page === 'analytics' && <AnalyticsDashboard userRole={user.role} />}
        {page === 'teacher' && isTeacher && <TeacherDashboard />}
        {page === 'reviews' && isTeacher && <TeacherWorkflowPanel />}
        {page === 'parent' && isParent && <ParentDashboard />}
        {page === 'subscriptions' && <SubscriptionManagement />}
        {page === 'admin' && isAdmin && <AdminDashboard />}
        {page === 'cms' && isAdmin && <EnterpriseCMS />}
      </div>
    </div>
  );
}