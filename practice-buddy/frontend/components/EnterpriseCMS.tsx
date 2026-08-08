'use client';

import React, { useState } from 'react';

type CMSTab = 'questions' | 'learning-objects' | 'mock-exams' | 'audio' | 'rubrics' | 'ai-config' | 'curriculum' | 'languages';

interface CMSState {
  activeTab: CMSTab;
  questions: any[];
  learningObjects: any[];
  mockExams: any[];
  audioFiles: any[];
  rubrics: any[];
}

export default function EnterpriseCMS({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<CMSTab>('questions');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs: { id: CMSTab; label: string; icon: string }[] = [
    { id: 'questions', label: 'Question Authoring', icon: '📝' },
    { id: 'learning-objects', label: 'Learning Objects', icon: '📖' },
    { id: 'mock-exams', label: 'Mock Exam Builder', icon: '📋' },
    { id: 'audio', label: 'Audio Management', icon: '🔊' },
    { id: 'rubrics', label: 'Rubric Management', icon: '📏' },
    { id: 'ai-config', label: 'AI Configuration', icon: '🤖' },
    { id: 'curriculum', label: 'Curriculum', icon: '📚' },
    { id: 'languages', label: 'Languages', icon: '🌐' },
  ];

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function QuestionEditor({ question, onSave, onCancel }: { question: any; onSave: (q: any) => void; onCancel: () => void }) {
    const [form, setForm] = useState(question || { type: 'multipleChoice', difficulty: 'medium', skill: '', stem: '', passage: '', options: [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }], correctAnswer: '', explanation: '' });

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">{question ? 'Edit Question' : 'Create New Question'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Question Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option value="multipleChoice">Multiple Choice</option>
              <option value="multipleSelect">Multiple Select</option>
              <option value="gridIn">Grid-In (Math)</option>
              <option value="essay">Essay/Free Response</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Skill/Topic</label>
            <input type="text" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., Algebra: Linear Equations" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Exam Type</label>
            <select value={form.examType || ''} onChange={e => setForm({ ...form, examType: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option value="">All Exams</option>
              <option value="SAT">SAT</option>
              <option value="ACT">ACT</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
              <option value="Academic English">Academic English</option>
              <option value="Common Core Math">Common Core Math</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Passage (Optional)</label>
          <textarea value={form.passage} onChange={e => setForm({ ...form, passage: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24" placeholder="Paste passage text here..." />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Question Stem</label>
          <textarea value={form.stem} onChange={e => setForm({ ...form, stem: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20" placeholder="Enter the question text..." />
        </div>

        <div className="mb-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Answer Options</label>
          {form.options.map((opt: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{opt.id}</span>
              <input type="text" value={opt.text} onChange={e => {
                const newOpts = [...form.options];
                newOpts[i] = { ...newOpts[i], text: e.target.value };
                setForm({ ...form, options: newOpts });
              }} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" />
              <input type="radio" name="correctAnswer" checked={form.correctAnswer === opt.id}
                onChange={() => setForm({ ...form, correctAnswer: opt.id })} className="w-4 h-4 text-[#C9A84C]" />
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Select the radio button next to the correct answer.</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Explanation</label>
          <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20" placeholder="Explain why the correct answer is right..." />
        </div>

        <div className="flex gap-3">
          <button onClick={() => onSave(form)} className="px-6 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
            Save Question
          </button>
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Content Management System</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">Administer questions, exams, and curriculum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
          ✅ {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowEditor(false); }}
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
        {/* Question Authoring */}
        {activeTab === 'questions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Question Bank</h2>
              <button onClick={() => { setEditingQuestion(null); setShowEditor(true); }}
                className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + New Question
              </button>
            </div>
            {showEditor && (
              <div className="mb-6">
                <QuestionEditor question={editingQuestion} onSave={(q) => { showSuccess('Question saved successfully!'); setShowEditor(false); }} onCancel={() => setShowEditor(false)} />
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Stem (truncated)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Difficulty</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Skill</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'Q001', stem: 'If 3x + 7 = 22...', type: 'MC', difficulty: 'Easy', skill: 'Algebra' },
                    { id: 'Q002', stem: 'The author\'s use of...', type: 'MC', difficulty: 'Medium', skill: 'Reading' },
                    { id: 'Q003', stem: 'Solve the system...', type: 'MC', difficulty: 'Hard', skill: 'Algebra' },
                  ].map((q, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{q.id}</td>
                      <td className="px-4 py-3 text-gray-700">{q.stem}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{q.type}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{q.difficulty}</span></td>
                      <td className="px-4 py-3 text-gray-600">{q.skill}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditingQuestion(q); setShowEditor(true); }} className="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                        <button className="text-red-600 hover:underline text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Learning Objects */}
        {activeTab === 'learning-objects' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Learning Objects</h2>
              <button className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + New Learning Object
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Solving Systems of Equations', subject: 'Math', grade: '9-10', duration: '45 min', status: 'published' },
                { title: 'Reading Comprehension: Tone', subject: 'Reading', grade: '9-12', duration: '30 min', status: 'draft' },
                { title: 'Essay Writing: Structure', subject: 'Writing', grade: '10-12', duration: '45 min', status: 'published' },
              ].map((lo, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-sm">{lo.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${lo.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {lo.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📚 {lo.subject}</p>
                    <p>🎯 Grade {lo.grade}</p>
                    <p>⏱ {lo.duration}</p>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button className="text-xs text-gray-500 hover:underline">Preview</button>
                    <button className="text-xs text-red-500 hover:underline">Archive</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Exam Builder */}
        {activeTab === 'mock-exams' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Mock Exams</h2>
              <button className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + Build Exam
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Questions</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Duration</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { title: 'SAT Practice Test 1', type: 'SAT', questions: 98, duration: '3h 15m', status: 'published' },
                    { title: 'ACT Practice Test A', type: 'ACT', questions: 215, duration: '2h 55m', status: 'draft' },
                  ].map((exam, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{exam.title}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">{exam.type}</span></td>
                      <td className="px-4 py-3">{exam.questions}</td>
                      <td className="px-4 py-3 text-gray-500">{exam.duration}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${exam.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{exam.status}</span></td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                        <button className="text-green-600 hover:underline text-xs">Publish</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audio Management */}
        {activeTab === 'audio' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Audio Files</h2>
              <button className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + Upload Audio
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <span className="text-4xl">🔊</span>
              <h3 className="font-semibold text-gray-700 mt-3">Audio Management</h3>
              <p className="text-sm text-gray-400 mt-1">Upload, manage, and organize audio files for listening sections and speaking assessments.</p>
              <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-sm text-gray-500">Drag & drop audio files here</p>
                <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A — Max 50MB</p>
                <button className="mt-3 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243555]">Browse Files</button>
              </div>
            </div>
          </div>
        )}

        {/* Rubric Management */}
        {activeTab === 'rubrics' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Rubrics</h2>
              <button className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + Create Rubric
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Speaking Assessment', categories: ['Fluency', 'Grammar', 'Vocabulary', 'Pronunciation', 'Coherence'], maxScore: 50 },
                { name: 'Writing Rubric', categories: ['Content', 'Organization', 'Language', 'Mechanics'], maxScore: 40 },
                { name: 'Essay Scoring', categories: ['Thesis', 'Evidence', 'Analysis', 'Style'], maxScore: 24 },
              ].map((rubric, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{rubric.name}</h3>
                    <span className="text-sm text-gray-400">Max: {rubric.maxScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rubric.categories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{cat}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button className="text-xs text-green-600 hover:underline">Apply to Exam</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Configuration */}
        {activeTab === 'ai-config' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Model Configuration</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Default Scoring Model</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option>GPT-4o (Recommended)</option>
                  <option>GPT-4</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Gemini Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Speaking Assessment Model</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option>Whisper + GPT-4o (Recommended)</option>
                  <option>Whisper + Claude</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Writing Assessment Model</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                  <option>GPT-4o (Recommended)</option>
                  <option>Claude 3.5 Sonnet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Adaptive Learning Engine</label>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-sm text-gray-600">Enable AI-driven adaptive recommendations</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">API Configuration</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="API Endpoint" defaultValue="https://api.openai.com/v1" className="p-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="password" placeholder="API Key" defaultValue="sk-..." className="p-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <button className="px-6 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* Curriculum Management */}
        {activeTab === 'curriculum' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Curriculum Management</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {[
                  { exam: 'SAT', subjects: ['Evidence-Based Reading', 'Writing & Language', 'Math'] },
                  { exam: 'ACT', subjects: ['English', 'Math', 'Reading', 'Science Reasoning'] },
                  { exam: 'IELTS', subjects: ['Listening', 'Reading', 'Writing', 'Speaking'] },
                  { exam: 'TOEFL', subjects: ['Reading', 'Listening', 'Speaking', 'Writing'] },
                ].map((curr, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{curr.exam}</h3>
                      <button className="text-xs text-blue-600 hover:underline">Manage</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {curr.subjects.map(sub => (
                        <span key={sub} className="px-2 py-0.5 bg-white border rounded text-xs text-gray-600">{sub}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + Add Curriculum
              </button>
            </div>
          </div>
        )}

        {/* Languages */}
        {activeTab === 'languages' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Language Management</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-3">
                {[
                  { code: 'en', name: 'English', default: true, enabled: true },
                  { code: 'ar', name: 'العربية (Arabic)', default: false, enabled: true },
                  { code: 'fr', name: 'Français (French)', default: false, enabled: false },
                  { code: 'es', name: 'Español (Spanish)', default: false, enabled: false },
                ].map((lang, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.code === 'en' ? '🇬🇧' : lang.code === 'ar' ? '🇸🇦' : lang.code === 'fr' ? '🇫🇷' : '🇪🇸'}</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                        {lang.default && <span className="ml-2 px-1.5 py-0.5 bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] rounded">Default</span>}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={lang.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]" />
                    </label>
                  </div>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                + Add Language
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}