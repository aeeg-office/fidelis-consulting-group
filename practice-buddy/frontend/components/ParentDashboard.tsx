'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

interface ChildData {
  id: string;
  name: string;
  grade: string;
  track: string;
  avatar: string;
  attendanceRate: number;
  sessionsAttended: number;
  totalSessions: number;
  scores: { subject: string; score: number; maxScore: number; color: string }[];
  upcomingSessions: { date: string; time: string; subject: string; teacher: string; type: string }[];
}

interface TeacherMessage {
  id: string;
  teacherName: string;
  childName: string;
  message: string;
  date: string;
  unread: boolean;
}

export default function ParentDashboard({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const children: ChildData[] = [
    {
      id: '1', name: 'Mariam', grade: 'Grade 11', track: 'SAT Track', avatar: 'MR',
      attendanceRate: 94, sessionsAttended: 47, totalSessions: 50,
      scores: [
        { subject: 'SAT Math', score: 680, maxScore: 800, color: 'from-blue-500 to-blue-600' },
        { subject: 'SAT Reading', score: 650, maxScore: 800, color: 'from-purple-500 to-purple-600' },
        { subject: 'SAT Writing', score: 700, maxScore: 800, color: 'from-green-500 to-green-600' },
      ],
      upcomingSessions: [
        { date: 'Mon', time: '4:00 PM', subject: 'SAT Math', teacher: 'Ms. Sarah', type: 'Online' },
        { date: 'Wed', time: '5:30 PM', subject: 'SAT Reading', teacher: 'Mr. James', type: 'In-Center' },
        { date: 'Fri', time: '4:00 PM', subject: 'SAT Writing', teacher: 'Ms. Sarah', type: 'Online' },
      ],
    },
    {
      id: '2', name: 'Youssef', grade: 'Grade 10', track: 'IELTS Track', avatar: 'YS',
      attendanceRate: 88, sessionsAttended: 44, totalSessions: 50,
      scores: [
        { subject: 'IELTS Listening', score: 7.5, maxScore: 9, color: 'from-orange-500 to-orange-600' },
        { subject: 'IELTS Reading', score: 7.0, maxScore: 9, color: 'from-teal-500 to-teal-600' },
        { subject: 'IELTS Writing', score: 6.5, maxScore: 9, color: 'from-amber-500 to-amber-600' },
      ],
      upcomingSessions: [
        { date: 'Tue', time: '5:00 PM', subject: 'IELTS Speaking', teacher: 'Mr. David', type: 'Online' },
        { date: 'Thu', time: '4:30 PM', subject: 'IELTS Writing', teacher: 'Ms. Emily', type: 'In-Center' },
      ],
    },
  ];

  const messages: TeacherMessage[] = [
    { id: 'm1', teacherName: 'Ms. Sarah', childName: 'Mariam', message: 'Mariam has made excellent progress in SAT Math this month. Her algebra scores have improved by 15%.', date: '2026-07-30', unread: true },
    { id: 'm2', teacherName: 'Mr. David', childName: 'Youssef', message: 'Youssef needs additional practice with IELTS Writing Task 2 essays. I\'ve assigned extra homework.', date: '2026-07-28', unread: false },
    { id: 'm3', teacherName: 'Mr. James', childName: 'Mariam', message: 'Please ensure Mariam completes the assigned reading passages before Wednesday\'s class.', date: '2026-07-25', unread: false },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'children', label: 'My Children', icon: '👨‍👩‍👧' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'reports', label: 'Progress Reports', icon: '📈' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'messages', label: 'Messages', icon: '💬' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold">Parent Dashboard</h1>
                <p className="text-[#C9A84C] text-sm mt-0.5">Monitor your child&apos;s academic progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg bg-white/10 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {messages.filter(m => m.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {messages.filter(m => m.unread).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[#1B2A4A] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">👨‍👩‍👧</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{children.length}</div>
                    <div className="text-xs text-gray-500">Children</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">📅</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{children.reduce((sum, c) => sum + c.upcomingSessions.length, 0)}</div>
                    <div className="text-xs text-gray-500">Sessions This Week</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">🏆</div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">91%</div>
                    <div className="text-xs text-gray-500">Avg. Score</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">💳</div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">$579</div>
                    <div className="text-xs text-gray-500">Monthly Spend</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Overview Cards */}
            {children.map(child => (
              <div key={child.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="md:flex">
                  {/* Left Panel */}
                  <div className="md:w-56 bg-gradient-to-b from-[#1B2A4A] to-[#2a3d6a] p-6 text-white text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl font-bold ring-4 ring-white/20">
                      {child.avatar}
                    </div>
                    <h3 className="font-bold text-lg mt-3">{child.name}</h3>
                    <p className="text-sm text-white/70">{child.grade}</p>
                    <span className="inline-block mt-2 px-3 py-0.5 bg-[#C9A84C] text-[#1B2A4A] text-xs font-bold rounded-full">{child.track}</span>
                    <div className="flex items-center justify-center gap-1 mt-3 text-[#C9A84C] text-xs">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{child.attendanceRate}% ({child.sessionsAttended}/{child.totalSessions})</span>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {child.scores.map((score, i) => (
                        <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500">{score.subject}</div>
                          <div className="text-xl font-bold text-gray-900">{score.score}</div>
                          <div className={`h-1.5 w-full bg-gray-200 rounded-full mt-1 overflow-hidden`}>
                            <div className={`h-full rounded-full bg-gradient-to-r ${score.color}`}
                              style={{ width: `${(score.score / score.maxScore) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Sessions</h4>
                    <div className="space-y-2">
                      {child.upcomingSessions.map((session, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-12 text-center">
                            <div className="font-bold text-gray-900 text-xs uppercase">{session.date}</div>
                            <div className="text-[10px] text-gray-400">{session.time}</div>
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-700">{session.subject}</span>
                            <span className="text-gray-400 text-xs ml-1">with {session.teacher}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            session.type === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>{session.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MY CHILDREN */}
        {activeTab === 'children' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Children</h2>
            <div className="space-y-4">
              {children.map(child => (
                <div key={child.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-xl font-bold">
                      {child.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{child.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{child.grade}</span>
                        <span>•</span>
                        <span className="text-[#C9A84C] font-medium">{child.track}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {child.scores.map((score, i) => (
                      <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">{score.subject}</div>
                        <div className="text-xl font-bold text-gray-900">{score.score}</div>
                        <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${score.color}`}
                            style={{ width: `${(score.score / score.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-[#1B2A4A] text-white text-xs font-medium rounded-lg hover:bg-[#243555]">View Full Report</button>
                    <button className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Schedule Session</button>
                    <button className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Message Teacher</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Schedule</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Day</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Child</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Teacher</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {children.flatMap(child => child.upcomingSessions.map((session, i) => (
                    <tr key={`${child.id}-${i}`} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3"><span className="font-medium">{session.date}</span></td>
                      <td className="px-4 py-3 text-gray-600">{session.time}</td>
                      <td className="px-4 py-3 font-medium text-gray-700">{child.name}</td>
                      <td className="px-4 py-3">{session.subject}</td>
                      <td className="px-4 py-3 text-gray-500">{session.teacher}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          session.type === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>{session.type}</span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROGRESS REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Progress Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map(child => (
                <div key={child.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-sm font-bold">{child.avatar}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{child.name}</h3>
                      <p className="text-xs text-gray-500">{child.track}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {child.scores.map((score, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{score.subject}</span>
                          <span className="font-semibold">{score.score}/{score.maxScore}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${score.color}`} style={{ width: `${(score.score / score.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                    Download Full Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === 'payments' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {[
                    { description: 'SAT Prep - Mariam', date: 'July 15, 2026', amount: 299, status: 'Completed' },
                    { description: 'IELTS Prep - Youssef', date: 'July 15, 2026', amount: 249, status: 'Completed' },
                    { description: 'SAT Practice Tests', date: 'July 1, 2026', amount: 79, status: 'Completed' },
                    { description: 'IELTS Mock Exam', date: 'June 28, 2026', amount: 49, status: 'Completed' },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">$</div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{payment.description}</p>
                          <p className="text-xs text-gray-400">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">${payment.amount}</div>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px]">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly Total</span><span className="font-bold">$579</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Active Plans</span><span className="font-bold">2</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Next Billing</span><span className="font-bold">Aug 15, 2026</span></div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Next Payment Due</p>
                      <p className="text-xs text-amber-700 mt-0.5">$579 due on August 15, 2026</p>
                      <button className="mt-2 px-3 py-1 bg-[#C9A84C] text-[#1B2A4A] text-xs font-bold rounded-lg hover:bg-[#d4b85a]">Pay Now</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Teacher Communications</h2>
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white rounded-xl border shadow-sm p-5 ${msg.unread ? 'border-[#C9A84C] ring-1 ring-[#C9A84C]/20' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-sm font-bold">
                        {msg.teacherName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{msg.teacherName}</h3>
                        <p className="text-xs text-gray-400">Regarding: {msg.childName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{new Date(msg.date).toLocaleDateString()}</span>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1 bg-[#1B2A4A] text-white text-xs rounded-lg hover:bg-[#243555]">Reply</button>
                    <button className="px-3 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Schedule Meeting</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}