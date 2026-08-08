'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';

type SubmissionStatus = 'pending' | 'approved' | 'returned' | 'revision';

interface SubmissionItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  type: 'speaking' | 'writing' | 'practice' | 'mock-exam';
  title: string;
  submittedAt: string;
  aiScore: number;
  maxScore: number;
  status: SubmissionStatus;
  teacherScore?: number;
  teacherNotes?: string;
}

export default function TeacherWorkflowPanel({ onBack }: { onBack?: () => void }) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [teacherScore, setTeacherScore] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'return' | 'release' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('all');
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  function loadSubmissions() {
    // Mock data matching actual API patterns
    const mockSubmissions: SubmissionItem[] = [
      { id: '1', studentName: 'Ahmed Hassan', studentAvatar: 'AH', type: 'speaking', title: 'Speaking Practice - Technology', submittedAt: '2026-07-30T14:30:00', aiScore: 78, maxScore: 100, status: 'pending' },
      { id: '2', studentName: 'Mariam Ibrahim', studentAvatar: 'MI', type: 'writing', title: 'Essay: Climate Change Solutions', submittedAt: '2026-07-30T12:15:00', aiScore: 85, maxScore: 100, status: 'pending' },
      { id: '3', studentName: 'Omar Khaled', studentAvatar: 'OK', type: 'practice', title: 'SAT Math - Algebra Quiz', submittedAt: '2026-07-29T16:45:00', aiScore: 72, maxScore: 100, status: 'pending' },
      { id: '4', studentName: 'Noor Ali', studentAvatar: 'NA', type: 'mock-exam', title: 'ACT Practice Test 1', submittedAt: '2026-07-29T10:00:00', aiScore: 28, maxScore: 36, status: 'returned', teacherScore: 26, teacherNotes: 'Review science section strategies' },
      { id: '5', studentName: 'Youssef Mahmoud', studentAvatar: 'YM', type: 'speaking', title: 'IELTS Speaking Part 2', submittedAt: '2026-07-28T09:20:00', aiScore: 6.5, maxScore: 9, status: 'approved', teacherScore: 7, teacherNotes: 'Excellent fluency, work on vocabulary range' },
      { id: '6', studentName: 'Lina Sherif', studentAvatar: 'LS', type: 'writing', title: 'TOEFL Integrated Writing', submittedAt: '2026-07-28T08:00:00', aiScore: 82, maxScore: 100, status: 'approved', teacherScore: 85, teacherNotes: 'Well structured with clear examples' },
    ];
    setSubmissions(mockSubmissions);
    setLoading(false);
  }

  function openReview(submission: SubmissionItem) {
    setSelectedSubmission(submission);
    setTeacherScore(submission.teacherScore ?? submission.aiScore);
    setTeacherNotes(submission.teacherNotes || '');
    setReviewAction(null);
    setShowConfirm(false);
  }

  function handleAction(action: 'approve' | 'return' | 'release') {
    setReviewAction(action);
    setShowConfirm(true);
  }

  function confirmAction() {
    if (!selectedSubmission) return;
    const updated = submissions.map(s => {
      if (s.id === selectedSubmission.id) {
        const newStatus = reviewAction === 'approve' ? 'approved' as SubmissionStatus
          : reviewAction === 'return' ? 'returned' as SubmissionStatus
          : 'approved' as SubmissionStatus;
        const note = `Teacher ${reviewAction === 'approve' ? 'approved with score' : reviewAction === 'return' ? 'returned for revision with notes' : 'released score'}: ${teacherScore}/${selectedSubmission.maxScore}`;
        setNotifications(prev => [`${selectedSubmission.studentName} — ${note}`, ...prev.slice(0, 4)]);
        return { ...s, status: newStatus, teacherScore, teacherNotes, teacherNotes: teacherNotes || s.teacherNotes };
      }
      return s;
    });
    setSubmissions(updated);
    setSelectedSubmission(null);
    setShowConfirm(false);
    setReviewAction(null);
  }

  const filteredSubmissions = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);

  const TYPE_ICONS: Record<string, string> = { speaking: '🎤', writing: '✍️', practice: '📝', 'mock-exam': '📋' };
  const STATUS_BADGES: Record<SubmissionStatus, { class: string; label: string }> = {
    pending: { class: 'bg-amber-100 text-amber-700', label: '⏳ Pending' },
    approved: { class: 'bg-green-100 text-green-700', label: '✅ Approved' },
    returned: { class: 'bg-red-100 text-red-700', label: '🔄 Returned' },
    revision: { class: 'bg-blue-100 text-blue-700', label: '📋 Revision' },
  };

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
                <h1 className="text-2xl font-bold">Teacher Workflow</h1>
                <p className="text-[#C9A84C] text-sm mt-0.5">Review and manage student submissions</p>
              </div>
            </div>
            <div className="relative">
              <button className="relative px-3 py-2 bg-white/10 rounded-lg text-sm">
                🔔 Notifications
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border z-20">
                  <div className="p-3 text-xs text-gray-500 font-medium border-b">Recent Notifications</div>
                  {notifications.map((n, i) => (
                    <div key={i} className="px-3 py-2 text-xs text-gray-700 border-b last:border-0">{n}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Submissions List */}
          <div className="flex-1">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'pending', 'approved', 'returned'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f ? 'bg-[#1B2A4A] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A84C]'
                  }`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="ml-1.5 text-xs opacity-70">({f === 'all' ? submissions.length : submissions.filter(s => s.status === f).length})</span>
                </button>
              ))}
            </div>

            {/* Submissions */}
            <div className="space-y-3">
              {filteredSubmissions.map(sub => (
                <button key={sub.id} onClick={() => openReview(sub)}
                  className={`w-full bg-white rounded-xl border shadow-sm p-4 text-left hover:shadow-md transition-all ${
                    selectedSubmission?.id === sub.id ? 'border-[#C9A84C]' : 'border-gray-100'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      sub.status === 'pending' ? 'bg-amber-500' : sub.status === 'approved' ? 'bg-green-500' : 'bg-red-400'
                    }`}>
                      {sub.studentAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{sub.studentName}</span>
                        <span className={STATUS_BADGES[sub.status].class + ' px-2 py-0.5 rounded text-[10px] font-medium'}>
                          {STATUS_BADGES[sub.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>{TYPE_ICONS[sub.type]} {sub.title}</span>
                        <span>•</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#1B2A4A]">{sub.teacherScore || sub.aiScore}/{sub.maxScore}</div>
                      <div className="text-[10px] text-gray-400">AI: {sub.aiScore}</div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredSubmissions.length === 0 && (
                <div className="text-center py-12 text-gray-400">No submissions found.</div>
              )}
            </div>
          </div>

          {/* Review Panel */}
          {selectedSubmission && (
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Review Submission</h2>
                    <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-sm font-bold">
                      {selectedSubmission.studentAvatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{selectedSubmission.studentName}</div>
                      <div className="text-xs text-gray-500">{selectedSubmission.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>{TYPE_ICONS[selectedSubmission.type]} {selectedSubmission.type}</span>
                    <span>•</span>
                    <span>Submitted {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {/* AI Score Display */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">AI Score</div>
                    <div className="text-2xl font-bold text-blue-800">{selectedSubmission.aiScore}<span className="text-sm text-blue-500">/{selectedSubmission.maxScore}</span></div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Teacher Score */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Teacher Score</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={teacherScore} max={selectedSubmission.maxScore} min={0}
                        onChange={(e) => setTeacherScore(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-lg font-bold text-center" />
                      <span className="text-gray-400">/ {selectedSubmission.maxScore}</span>
                    </div>
                  </div>

                  {/* Teacher Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Teacher Notes</label>
                    <textarea value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-24"
                      placeholder="Add your feedback, suggestions, or comments..." />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button onClick={() => handleAction('approve')}
                      disabled={reviewAction !== null}
                      className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg text-sm hover:bg-green-700 disabled:opacity-30">
                      ✅ Approve & Publish Score
                    </button>
                    <button onClick={() => handleAction('return')}
                      disabled={reviewAction !== null}
                      className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg text-sm hover:bg-amber-600 disabled:opacity-30">
                      🔄 Return for Revision
                    </button>
                    <button onClick={() => handleAction('release')}
                      disabled={reviewAction !== null}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 disabled:opacity-30">
                      📤 Release to Student
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-gray-500 mb-4">
              {reviewAction === 'approve' && `Approve "${selectedSubmission.title}" with score ${teacherScore}/${selectedSubmission.maxScore}?`}
              {reviewAction === 'return' && `Return "${selectedSubmission.title}" for revision with your notes?`}
              {reviewAction === 'release' && `Release score ${teacherScore}/${selectedSubmission.maxScore} to ${selectedSubmission.studentName}?`}
            </p>
            <div className="text-xs text-gray-400 mb-4 p-3 bg-gray-50 rounded-lg">
              {teacherNotes ? `Notes: ${teacherNotes}` : 'No notes added'}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmAction}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${
                  reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  reviewAction === 'return' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}