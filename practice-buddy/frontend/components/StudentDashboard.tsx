'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export default function StudentDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [mastery, setMastery] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userData, analyticsData, masteryData, summaryData, sessionsData, assignmentsData] = await Promise.all([
        api.getMe(),
        api.getStudentAnalytics(),
        api.getMastery(),
        api.getMasterySummary(),
        api.getSessions(),
        api.getAssignments(),
      ]);
      setUser(userData);
      setAnalytics(analyticsData);
      setMastery(masteryData);
      setSummary(summaryData);
      setSessions(sessionsData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <style>{`
        .dash-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .dash-stat { text-align: center; padding: 1rem; }
        .dash-stat-value { font-size: 2rem; font-weight: 700; color: #1a56db; }
        .dash-stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
        .mastery-level { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .mastery-not-assessed { background: #f3f4f6; color: #6b7280; }
        .mastery-beginning { background: #fee2e2; color: #991b1b; }
        .mastery-developing { background: #fef3c7; color: #92400e; }
        .mastery-approaching { background: #dbeafe; color: #1e40af; }
        .mastery-mastered { background: #d1fae5; color: #065f46; }
        .mastery-needs-review { background: #fce7f3; color: #9d174d; }
      `}</style>

      {/* Welcome */}
      <div className="dash-card mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.targetTest ? `Preparing for ${user.targetTest}` : 'Start practicing to build your skills'}
          {user?.targetScore ? ` • Target: ${user.targetScore}` : ''}
          {user?.testDate ? ` • Test: ${new Date(user.testDate).toLocaleDateString()}` : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="dash-grid mb-6">
        <div className="dash-card dash-stat">
          <div className="dash-stat-value">{analytics?.totalAttempts || 0}</div>
          <div className="dash-stat-label">Questions Answered</div>
        </div>
        <div className="dash-card dash-stat">
          <div className="dash-stat-value">{analytics?.firstAttemptAccuracy || 0}%</div>
          <div className="dash-stat-label">First-Attempt Accuracy</div>
        </div>
        <div className="dash-card dash-stat">
          <div className="dash-stat-value">{analytics?.secondAttemptRecovery || 0}%</div>
          <div className="dash-stat-label">Second-Attempt Recovery</div>
        </div>
        <div className="dash-card dash-stat">
          <div className="dash-stat-value">{summary?.mastered || 0}/{summary?.total || 0}</div>
          <div className="dash-stat-label">Skills Mastered</div>
        </div>
      </div>

      {/* Mastery Progress */}
      <div className="dash-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Skill Mastery</h2>
        {summary?.overallProgress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold">{summary.overallProgress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${summary.overallProgress}%` }} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mastery.slice(0, 10).map((m: any) => (
            <div key={m.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{m.category?.name || m.subcategory?.name || 'Unknown'}</span>
                <span className={`mastery-level ${`mastery-${m.level}`}`}>
                  {m.level === 'notAssessed' ? 'Not Assessed' : 
                   m.level === 'beginning' ? 'Beginning' :
                   m.level === 'developing' ? 'Developing' :
                   m.level === 'approaching' ? 'Approaching' :
                   m.level === 'mastered' ? 'Mastered' : 'Needs Review'}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`mastery-fill h-full rounded-full ${
                  m.level === 'beginning' ? 'bg-red-500' :
                  m.level === 'developing' ? 'bg-yellow-500' :
                  m.level === 'approaching' ? 'bg-blue-500' :
                  m.level === 'mastered' ? 'bg-green-500' : 'bg-pink-500'
                }`} 
                style={{ width: `${Math.min(100, (m.firstAttemptCount > 0 ? m.firstAttemptCorrect / m.firstAttemptCount * 100 : 0))}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {m.firstAttemptCount} attempts • {m.firstAttemptCorrect} correct
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest & Strongest */}
      <div className="dash-grid mb-6">
        {summary?.weakest?.length > 0 && (
          <div className="dash-card">
            <h2 className="text-lg font-semibold mb-3 text-red-700">Needs Practice</h2>
            <div className="space-y-2">
              {summary.weakest.map((w: any) => (
                <div key={w.id} className="flex justify-between text-sm">
                  <span>{w.category?.name || w.subcategory?.name || 'Unknown'}</span>
                  <span className="text-red-600 font-medium">
                    {w.firstAttemptCount > 0 ? Math.round(w.firstAttemptCorrect / w.firstAttemptCount * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {summary?.strongest?.length > 0 && (
          <div className="dash-card">
            <h2 className="text-lg font-semibold mb-3 text-green-700">Strengths</h2>
            <div className="space-y-2">
              {summary.strongest.map((s: any) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span>{s.category?.name || s.subcategory?.name || 'Unknown'}</span>
                  <span className="text-green-600 font-medium">
                    {s.firstAttemptCount > 0 ? Math.round(s.firstAttemptCorrect / s.firstAttemptCount * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="dash-card mb-6">
        <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No practice sessions yet. Start practicing to see your history!</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <span className="font-medium text-sm capitalize">{s.sessionType} Practice</span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(s.startedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{s.firstAttemptCorrect}/{s.questionsAnswered}</span>
                  <span className="text-gray-400 ml-1">correct</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Assignments */}
      {assignments.filter((a: any) => a.status === 'pending').length > 0 && (
        <div className="dash-card">
          <h2 className="text-lg font-semibold mb-3 text-amber-700">Pending Assignments</h2>
          <div className="space-y-2">
            {assignments.filter((a: any) => a.status === 'pending').map((a: any) => (
              <div key={a.id} className="flex justify-between items-center p-3 border border-amber-200 rounded-lg bg-amber-50">
                <div>
                  <span className="font-medium text-sm">{a.assignment.title}</span>
                  {a.assignment.dueDate && (
                    <span className="text-xs text-red-500 ml-2">Due: {new Date(a.assignment.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
                <button className="text-sm text-blue-600 hover:underline" onClick={() => {/* start assignment */}}>Start</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}