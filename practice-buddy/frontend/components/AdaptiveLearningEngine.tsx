'use client';

import React, { useState } from 'react';

interface SkillRecommendation {
  skill: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: string[];
}

interface ReviewTopic {
  topic: string;
  lastPracticed: string;
  score: number;
  needsReview: boolean;
}

interface StudySession {
  day: string;
  date: string;
  focus: string;
  duration: string;
  tasks: string[];
}

interface TargetPlan {
  currentScore: number;
  targetScore: number;
  examDate: string;
  weeksRemaining: number;
  weeklyHours: number;
  predictedReadiness: number;
}

const NEXT_SKILLS: SkillRecommendation[] = [
  { skill: 'Advanced Algebra: Quadratic Functions', reason: 'Weakest area at 45% mastery — foundational for SAT Math', priority: 'high', estimatedTime: '4-6 hours', resources: ['Algebra Fundamentals LO', 'Quadratic Practice Set', 'Khan Academy Unit 5'] },
  { skill: 'Text Structure & Purpose', reason: 'Reading scores impacted by structure analysis questions', priority: 'high', estimatedTime: '3-4 hours', resources: ['Reading Comprehension LO', 'Passage Analysis Workshop'] },
  { skill: 'Transition Logic (Writing)', reason: 'Writing score can improve 30+ points with transitions mastered', priority: 'medium', estimatedTime: '2-3 hours', resources: ['Writing & Language LO', 'Transition Practice Quiz'] },
  { skill: 'Data Interpretation (Math)', reason: 'Table/chart questions appearing more frequently', priority: 'medium', estimatedTime: '2-3 hours', resources: ['Data Analysis Module', 'Statistics Practice'] },
];

const REVIEW_TOPICS: ReviewTopic[] = [
  { topic: 'Linear Equations', lastPracticed: '2 days ago', score: 88, needsReview: false },
  { topic: 'Systems of Equations', lastPracticed: '1 week ago', score: 72, needsReview: true },
  { topic: 'Reading: Main Idea', lastPracticed: '5 days ago', score: 85, needsReview: false },
  { topic: 'Grammar: Subject-Verb Agreement', lastPracticed: '2 weeks ago', score: 68, needsReview: true },
  { topic: 'Geometry: Triangles', lastPracticed: '3 weeks ago', score: 55, needsReview: true },
  { topic: 'Vocabulary in Context', lastPracticed: '4 days ago', score: 78, needsReview: false },
];

const STUDY_SCHEDULE: StudySession[] = [
  { day: 'Monday', date: 'Aug 3', focus: 'Advanced Algebra', duration: '2 hours', tasks: ['Complete Quadratic Functions lesson', 'Practice 15 quadratic problems', 'Review incorrect answers'] },
  { day: 'Tuesday', date: 'Aug 4', focus: 'Text Structure', duration: '1.5 hours', tasks: ['Read Text Structure LO', 'Analyze 3 passages', 'Complete 10 structure questions'] },
  { day: 'Wednesday', date: 'Aug 5', focus: 'Transition Logic', duration: '1.5 hours', tasks: ['Complete Transitions lesson', 'Practice 10 transition questions', 'Review grammar rules'] },
  { day: 'Thursday', date: 'Aug 6', focus: 'Geometry Review', duration: '2 hours', tasks: ['Review triangle theorems', 'Practice geometry problems', 'Focus on weak areas'] },
  { day: 'Friday', date: 'Aug 7', focus: 'Mixed Practice', duration: '2 hours', tasks: ['30-question mixed quiz', 'Review all errors', 'Flag difficult questions'] },
  { day: 'Saturday', date: 'Aug 8', focus: 'Full Mock Section', duration: '3 hours', tasks: ['Complete one SAT Math section', 'Complete one SAT R&W section', 'Score and analyze results'] },
  { day: 'Sunday', date: 'Aug 9', focus: 'Review & Rest', duration: '1 hour', tasks: ['Review weekly mistakes', 'Plan next week', 'Light vocabulary review'] },
];

export default function AdaptiveLearningEngine({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('next-skills');
  const [targetScore, setTargetScore] = useState(1500);
  const [currentScore, setCurrentScore] = useState(1280);
  const [examDate, setExamDate] = useState('2026-11-01');
  const [weeksUntilExam, setWeeksUntilExam] = useState(14);
  const [generated, setGenerated] = useState(false);

  const scoreGap = targetScore - currentScore;
  const weeklyHoursNeeded = Math.ceil(scoreGap / 15);
  const predictedReadiness = Math.min(100, Math.round((currentScore / targetScore) * 85 + 10));

  const tabs = [
    { id: 'next-skills', label: 'Next Skills', icon: '🎯' },
    { id: 'review', label: 'Review Topics', icon: '🔄' },
    { id: 'schedule', label: 'Study Schedule', icon: '📅' },
    { id: 'target', label: 'Target Planner', icon: '📈' },
    { id: 'readiness', label: 'Predicted Readiness', icon: '🔮' },
  ];

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
              <h1 className="text-2xl font-bold">Adaptive Learning Engine</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">AI-driven personalized study recommendations</p>
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
        {/* NEXT SKILLS */}
        {activeTab === 'next-skills' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Next Skills to Study</h2>
            <p className="text-sm text-gray-500 mb-4">Prioritized recommendations based on your performance data</p>
            <div className="space-y-3">
              {NEXT_SKILLS.map((skill, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        skill.priority === 'high' ? 'bg-red-500' : skill.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <h3 className="font-bold text-gray-900 text-sm">{skill.skill}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        skill.priority === 'high' ? 'bg-red-100 text-red-600' : skill.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>{skill.priority} priority</span>
                    </div>
                    <span className="text-xs text-gray-400">⏱ {skill.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{skill.reason}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.resources.map((r, j) => (
                      <span key={j} className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] rounded cursor-pointer hover:bg-[#C9A84C]/20 transition-colors">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEW TOPICS */}
        {activeTab === 'review' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Review Topics</h2>
            <p className="text-sm text-gray-500 mb-4">Topics needing review based on mastery decay and gaps</p>
            <div className="space-y-2">
              {REVIEW_TOPICS.map((topic, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {topic.needsReview && <span className="text-amber-500 text-sm">🔄</span>}
                    {!topic.needsReview && <span className="text-green-500 text-sm">✅</span>}
                    <div>
                      <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                      <span className="text-xs text-gray-400 ml-2">Last: {topic.lastPracticed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        topic.score >= 80 ? 'bg-green-500' : topic.score >= 65 ? 'bg-[#C9A84C]' : 'bg-red-500'
                      }`} style={{ width: `${topic.score}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-10 text-right">{topic.score}%</span>
                    {topic.needsReview && (
                      <button className="px-3 py-1 bg-[#C9A84C] text-[#1B2A4A] text-xs font-bold rounded-lg hover:bg-[#d4b85a]">
                        Review Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Study Schedule Generator</h2>
                <p className="text-sm text-gray-500">AI-generated weekly study plan</p>
              </div>
              <button className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                Regenerate Schedule
              </button>
            </div>
            <div className="space-y-3">
              {STUDY_SCHEDULE.map((day, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16">
                        <div className="font-bold text-gray-900 text-sm">{day.day}</div>
                        <div className="text-xs text-gray-400">{day.date}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#1B2A4A]">{day.focus}</span>
                        <span className="text-xs text-gray-400 ml-2">⏱ {day.duration}</span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-300 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="px-5 pb-3">
                    <ul className="space-y-1">
                      {day.tasks.map((task, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARGET PLANNER */}
        {activeTab === 'target' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Target Score Planner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Set Your Target</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Current Score</label>
                    <div className="text-3xl font-bold text-[#1B2A4A]">{currentScore}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Target Score</label>
                    <input type="range" min="1000" max="1600" value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]" />
                    <div className="text-3xl font-bold text-[#C9A84C] mt-1">{targetScore}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Exam Date</label>
                    <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <button onClick={() => setGenerated(true)} className="w-full py-2.5 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                    Generate Plan
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Your Study Plan</h3>
                {generated ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{scoreGap}</div>
                        <div className="text-xs text-blue-600">Points to Target</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{weeksUntilExam}</div>
                        <div className="text-xs text-green-600">Weeks Remaining</div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{weeklyHoursNeeded}h</div>
                        <div className="text-xs text-amber-600">Weekly Study Hours</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{Math.round(scoreGap / weeksUntilExam)}</div>
                        <div className="text-xs text-purple-600">Points/Week Needed</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-[#1B2A4A] to-[#2a3d6a] rounded-lg text-white text-sm">
                      <p className="font-semibold">📋 Weekly Plan:</p>
                      <ul className="mt-2 space-y-1 text-white/80 text-xs">
                        <li>• Study {weeklyHoursNeeded} hours per week</li>
                        <li>• Focus on high-priority weak areas first</li>
                        <li>• Take one full mock exam every 2 weeks</li>
                        <li>• Review mistakes daily</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <span className="text-4xl">📊</span>
                    <p className="mt-2 text-sm">Set your target score and exam date to generate a personalized study plan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREDICTED READINESS */}
        {activeTab === 'readiness' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Predicted Readiness</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Readiness Score</h3>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-40 h-40 -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle cx="80" cy="80" r="70" fill="none" stroke="url(#grad)" strokeWidth="12" strokeDasharray={`${(predictedReadiness / 100) * 440} 440`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1B2A4A" />
                          <stop offset="100%" stopColor="#C9A84C" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-4xl font-bold text-[#1B2A4A]">{predictedReadiness}%</div>
                        <div className="text-xs text-gray-500">Readiness</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  {predictedReadiness >= 80 ? 'You are well on track to reach your target score!' :
                   predictedReadiness >= 60 ? 'You are making good progress. Keep studying!' :
                   'You need additional study time to reach your target.'}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Score Projection</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Current</span>
                      <span className="font-bold">{currentScore}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-400" style={{ width: `${(currentScore / 1600) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Predicted (Exam Day)</span>
                      <span className="font-bold text-[#C9A84C]">{Math.min(1600, currentScore + Math.round(scoreGap * 0.65))}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: `${((currentScore + Math.round(scoreGap * 0.65)) / 1600) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Target</span>
                      <span className="font-bold text-green-600">{targetScore}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${(targetScore / 1600) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  💡 <strong>Recommendation:</strong> With consistent study of {weeklyHoursNeeded}h/week, you can reach your target score of {targetScore} by {new Date(examDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}