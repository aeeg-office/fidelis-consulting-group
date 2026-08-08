'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [c, s, a] = await Promise.all([
        api.teacher.getClasses(),
        api.teacher.getStudents().catch(() => []),
        api.teacher.getAssignments(),
      ]);
      setClasses(c);
      setStudents(s);
      setAssignments(a);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function loadClass(id: string) {
    const data = await api.teacher.getClass(id);
    setSelectedClass(data);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <style>{`
        .tch-tab { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; font-size: 0.9rem; }
        .tch-tab.active { background: #1a56db; color: white; }
        .tch-tab:not(.active) { background: #f3f4f6; color: #374151; }
        .tch-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .tch-table th { text-align: left; padding: 0.75rem; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
        .tch-table td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
      `}</style>

      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['classes', 'students', 'assignments', 'reports'].map(tab => (
          <button key={tab} className={`tch-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Classes */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create Class Card */}
          <div className="bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-blue-400">
            <span className="text-3xl text-gray-400 mb-2">+</span>
            <span className="text-sm text-gray-500 font-medium">Create New Class</span>
          </div>
          {/* Class Cards */}
          {classes.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition" onClick={() => { setSelectedClass(c); loadClass(c.id); }}>
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
              <div className="flex gap-3 mt-3 text-sm text-gray-500">
                <span>{c._count?.students || 0} students</span>
                <span>{c._count?.assignments || 0} assignments</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">Code: <span className="font-mono font-bold">{c.code}</span></div>
            </div>
          ))}
          {classes.length === 0 && <div className="text-gray-400 text-sm col-span-full text-center py-8">No classes yet. Create your first class!</div>}
        </div>
      )}

      {/* Selected Class Detail */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{selectedClass.name}</h2>
              <p className="text-sm text-gray-500">Code: <span className="font-mono font-bold">{selectedClass.code}</span></p>
            </div>
            <button className="text-sm text-blue-600 hover:underline" onClick={() => setSelectedClass(null)}>Close</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Students */}
            <div>
              <h3 className="font-semibold mb-2">Students ({selectedClass.students?.length || 0})</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {selectedClass.students?.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>{s.student?.displayName || s.student?.username}</span>
                    <span className="text-xs text-gray-400">{s.student?.gradeLevel || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Assignments */}
            <div>
              <h3 className="font-semibold mb-2">Assignments ({selectedClass.assignments?.length || 0})</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {selectedClass.assignments?.map((a: any) => (
                  <div key={a.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-400">{a._count?.questions || 0} questions • due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'no due date'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students */}
      {activeTab === 'students' && (
        <div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Students ({students.length})</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Student</button>
            </div>
            <table className="tch-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Grade</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.displayName}</td>
                    <td className="text-gray-500">{s.username}</td>
                    <td>{s.gradeLevel || '—'}</td>
                    <td>{s.targetTest || '—'} {s.targetScore ? `/ ${s.targetScore}` : ''}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-blue-600 text-xs hover:underline">Progress</button>
                        <button className="text-amber-600 text-xs hover:underline">Reset PW</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">My Assignments ({assignments.length})</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Assignment</button>
          </div>
          <table className="tch-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Class</th>
                <th>Questions</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.title}</td>
                  <td>{a.class?.name || '—'}</td>
                  <td>{a._count?.questions || 0}</td>
                  <td className="text-sm">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}</td>
                  <td>
                    <span className="text-green-600 text-sm">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-xl font-semibold mb-2">Performance Reports</h2>
          <p className="text-gray-500">Select a class and date range to generate performance reports.</p>
          <div className="flex gap-3 justify-center mt-6">
            <select className="px-4 py-2 border rounded-lg text-sm">
              <option>Select Class...</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Generate Report</button>
          </div>
        </div>
      )}
    </div>
  );
}