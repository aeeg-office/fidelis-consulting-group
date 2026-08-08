'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  trend?: { direction: 'up' | 'down'; value: string };
  color: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'diagnostic', label: 'Diagnostic Platform', icon: '🔬', description: 'Take diagnostic tests across all exam types', roles: ['student', 'parent'] },
  { id: 'mock-exam', label: 'Mock Exam Center', icon: '📝', description: 'Full-length mock exams with real-time scoring', roles: ['student', 'parent'] },
  { id: 'learning-objects', label: 'Learning Objects', icon: '📚', description: 'Interactive lessons with worked examples', roles: ['student', 'teacher', 'parent'] },
  { id: 'speaking', label: 'Speaking Platform', icon: '🎤', description: 'AI-powered speaking assessment and practice', roles: ['student', 'teacher'] },
  { id: 'writing', label: 'Secure Writing', icon: '✍️', description: 'Secure writing environment with AI feedback', roles: ['student', 'teacher'] },
  { id: 'teacher-workflow', label: 'Teacher Workflow', icon: '👩‍🏫', description: 'Review submissions, provide feedback, manage classes', roles: ['teacher'] },
  { id: 'analytics', label: 'Analytics Dashboard', icon: '📊', description: 'Deep insights into performance and growth', roles: ['student', 'teacher', 'parent', 'admin'] },
  { id: 'cms', label: 'Content Management', icon: '⚙️', description: 'Administer questions, exams, and curriculum', roles: ['admin'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: '💳', description: 'Manage plans, seats, and billing', roles: ['admin', 'parent'] },
  { id: 'adaptive', label: 'Adaptive Learning', icon: '🧠', description: 'AI-driven personalized study recommendations', roles: ['student', 'teacher'] },
  { id: 'parent-portal', label: 'Parent Portal', icon: '👨‍👩‍👧', description: 'Monitor your child\'s progress and activity', roles: ['parent'] },
];

const QUICK_STATS: Record<string, QuickStat[]> = {
  student: [
    { label: 'Questions Answered', value: '—', icon: '📝', color: 'from-blue-500 to-blue-600' },
    { label: 'Accuracy', value: '—%', icon: '🎯', color: 'from-green-500 to-green-600' },
    { label: 'Skills Mastered', value: '—/—', icon: '🏆', color: 'from-purple-500 to-purple-600' },
    { label: 'Study Streak', value: '— days', icon: '🔥', color: 'from-orange-500 to-orange-600' },
  ],
  teacher: [
    { label: 'Active Students', value: '—', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Pending Reviews', value: '—', icon: '📋', color: 'from-amber-500 to-amber-600' },
    { label: 'Classes', value: '—', icon: '🏫', color: 'from-purple-500 to-purple-600' },
    { label: 'Avg. Student Score', value: '—%', icon: '📈', color: 'from-green-500 to-green-600' },
  ],
  parent: [
    { label: 'Children Enrolled', value: '—', icon: '👨‍👩‍👧', color: 'from-blue-500 to-blue-600' },
    { label: 'Avg. Score', value: '—%', icon: '🎯', color: 'from-green-500 to-green-600' },
    { label: 'Sessions This Week', value: '—', icon: '📅', color: 'from-purple-500 to-purple-600' },
    { label: 'Next Payment', value: '—', icon: '💳', color: 'from-amber-500 to-amber-600' },
  ],
  admin: [
    { label: 'Total Users', value: '—', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Active Sessions', value: '—', icon: '🔄', color: 'from-green-500 to-green-600' },
    { label: 'Questions Published', value: '—', icon: '📚', color: 'from-purple-500 to-purple-600' },
    { label: 'Revenue (MTD)', value: '—', icon: '💰', color: 'from-amber-500 to-amber-600' },
  ],
};

export default function EnterpriseDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role || 'student';
  const isStudent = ['student'].includes(role);
  const isTeacher = ['teacher', 'seniorTeacher'].includes(role);
  const isParent = role === 'parent';
  const isAdmin = ['administrator', 'superAdministrator'].includes(role);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const userData = await api.getMe().catch(() => null);
      setUser(userData);
      const roleKey = userData?.role === 'parent' ? 'parent'
        : ['teacher', 'seniorTeacher'].includes(userData?.role) ? 'teacher'
        : ['administrator', 'superAdministrator'].includes(userData?.role) ? 'admin'
        : 'student';
      const loadedStats = QUICK_STATS[roleKey].map(s => ({ ...s }));
      setStats(loadedStats);

      // Try to populate real data
      if (roleKey === 'student') {
        const [analytics, summary] = await Promise.all([
          api.getStudentAnalytics().catch(() => null),
          api.getMasterySummary().catch(() => null),
        ]);
        if (analytics) {
          loadedStats[0].value = analytics.totalAttempts || 0;
          loadedStats[1].value = (analytics.firstAttemptAccuracy || 0) + '%';
        }
        if (summary) {
          loadedStats[2].value = `${summary.mastered || 0}/${summary.total || 0}`;
        }
        setStats([...loadedStats]);
      } else if (roleKey === 'teacher') {
        const [classes, students, assignments] = await Promise.all([
          api.teacher.getClasses().catch(() => []),
          api.teacher.getStudents().catch(() => []),
          api.teacher.getAssignments().catch(() => []),
        ]);
        loadedStats[0].value = students.length || 0;
        loadedStats[2].value = classes.length || 0;
        setStats([...loadedStats]);
      } else if (roleKey === 'admin') {
        const analytics = await api.admin.getAdminAnalytics().catch(() => null);
        if (analytics) {
          loadedStats[0].value = analytics.totalUsers || 0;
          loadedStats[2].value = analytics.totalQuestions || 0;
        }
        setStats([...loadedStats]);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button onClick={loadData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  const availableNavItems = NAV_ITEMS.filter(item => {
    if (isAdmin) return true;
    if (isTeacher) return item.roles.includes('teacher') || item.roles.includes('student') || item.roles.includes('admin');
    if (isParent) return item.roles.includes('parent');
    return item.roles.includes('student');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome{user?.displayName ? `, ${user.displayName}` : ''}!
              </h1>
              <p className="text-[#C9A84C] mt-1 text-sm">
                {isStudent && 'Continue your learning journey'}
                {isTeacher && 'Manage your classes and students'}
                {isParent && 'Track your child\'s academic progress'}
                {isAdmin && 'Oversee the entire platform'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs capitalize">{role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Navigation */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-[#C9A84C] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1B2A4A]">{item.label}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#C9A84C] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}