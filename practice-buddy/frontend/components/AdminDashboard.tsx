'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [a, e, ac] = await Promise.all([
        api.admin.getAdminAnalytics().catch(() => null),
        api.admin.getExams(),
        api.admin.getAccessCodes().catch(() => []),
      ]);
      setAnalytics(a);
      setExams(e);
      setAccessCodes(ac);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function loadQuestions() {
    const data = await api.admin.getQuestions({ limit: '50' });
    setQuestions(data.questions);
  }

  async function loadUsers() {
    const data = await api.admin.getUsers();
    setUsers(data.users);
  }

  async function loadFlags() {
    const data = await api.admin.getFlags();
    setFlags(data);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <style>{`
        .admin-tab { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
        .admin-tab.active { background: #1a56db; color: white; }
        .admin-tab:not(.active) { background: #f3f4f6; color: #374151; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .admin-table th { text-align: left; padding: 0.75rem; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
        .admin-table td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        .admin-table tr:hover td { background: #f9fafb; }
      `}</style>

      <h1 className="text-2xl font-bold mb-6">Administrator Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview', 'questions', 'users', 'exams', 'codes', 'flags'].map(tab => (
          <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); if (tab === 'questions') loadQuestions(); if (tab === 'users') loadUsers(); if (tab === 'flags') loadFlags(); }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{analytics?.totalUsers || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total Users</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{analytics?.totalQuestions || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Published Questions</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{analytics?.totalSessions || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Practice Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">{analytics?.activeToday || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Active Today</div>
          </div>
        </div>
      )}

      {/* Questions */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Question Bank ({questions.length})</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Question</button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>AEEG ID</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q: any) => (
                  <tr key={q.id}>
                    <td className="font-mono text-xs">{q.aeeqId}</td>
                    <td>{q.category?.name || '—'}</td>
                    <td><span className="capitalize">{q.difficulty}</span></td>
                    <td className="text-xs">{q.questionFormat === 'multipleChoice' ? 'MC' : 'SPR'}</td>
                    <td><span className="text-green-600">Active</span></td>
                    <td className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No questions yet. Import or create questions to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">User Management ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Display Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.username}</td>
                    <td>{u.displayName}</td>
                    <td><span className="capitalize">{u.role}</span></td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <button className="text-blue-600 text-sm hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exams/Hierarchy */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Content Hierarchy</h2>
          {exams.map((exam: any) => (
            <div key={exam.id} className="mb-4">
              <h3 className="font-bold text-blue-700">{exam.name} ({exam.code})</h3>
              {exam.subjects?.map((subj: any) => (
                <div key={subj.id} className="ml-4 mt-2">
                  <h4 className="font-semibold text-gray-700">{subj.name}</h4>
                  {subj.domains?.map((dom: any) => (
                    <div key={dom.id} className="ml-4 mt-1">
                      <span className="text-sm text-gray-600">{dom.name}</span>
                      <div className="flex flex-wrap gap-1 ml-4 mt-1">
                        {dom.categories?.map((cat: any) => (
                          <span key={cat.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{cat.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Access Codes */}
      {activeTab === 'codes' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Access Codes</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Generate Code</button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Uses</th>
                <th>Max Uses</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accessCodes.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-mono font-bold">{c.code}</td>
                  <td className="capitalize">{c.codeType}</td>
                  <td>{c.currentUses}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td>{c.maxUses || '∞'}</td>
                  <td className="text-xs">{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Flags */}
      {activeTab === 'flags' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Question Flags ({flags.length})</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f: any) => (
                <tr key={f.id}>
                  <td className="font-mono text-xs">{f.question?.aeeqId}</td>
                  <td className="capitalize">{f.flagType}</td>
                  <td>{f.user?.username}</td>
                  <td className="text-xs max-w-xs truncate">{f.description}</td>
                  <td className="text-xs">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="text-green-600 text-sm hover:underline mr-2">Resolve</button>
                    <button className="text-red-600 text-sm hover:underline">Dismiss</button>
                  </td>
                </tr>
              ))}
              {flags.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No pending flags.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}