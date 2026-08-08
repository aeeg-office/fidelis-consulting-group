'use client';

import React, { useState, useEffect } from 'react';

interface SkillMastery {
  skill: string;
  score: number;
  category: string;
}

interface GrowthPoint {
  date: string;
  score: number;
  accuracy: number;
}

interface WeaknessArea {
  area: string;
  score: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface TimeOnTask {
  subject: string;
  hours: number;
  sessions: number;
  color: string;
}

interface PredictedScore {
  exam: string;
  current: number;
  predicted: number;
  max: number;
  confidence: number;
}

interface CurriculumCoverage {
  topic: string;
  covered: number;
  total: number;
  percent: number;
}

interface AIInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'alert';
  message: string;
  detail: string;
}

const WEEKLY_GROWTH: GrowthPoint[] = [
  { date: 'Week 1', score: 540, accuracy: 62 },
  { date: 'Week 2', score: 570, accuracy: 65 },
  { date: 'Week 3', score: 590, accuracy: 68 },
  { date: 'Week 4', score: 610, accuracy: 71 },
  { date: 'Week 5', score: 630, accuracy: 74 },
  { date: 'Week 6', score: 650, accuracy: 78 },
  { date: 'Week 7', score: 640, accuracy: 76 },
  { date: 'Week 8', score: 680, accuracy: 82 },
];

const SKILL_MASTERY: SkillMastery[] = [
  { skill: 'Algebra Fundamentals', score: 85, category: 'Math' },
  { skill: 'Geometry & Measurement', score: 72, category: 'Math' },
  { skill: 'Data Analysis', score: 68, category: 'Math' },
  { skill: 'Advanced Algebra', score: 55, category: 'Math' },
  { skill: 'Reading Comprehension', score: 78, category: 'Reading' },
  { skill: 'Vocabulary in Context', score: 82, category: 'Reading' },
  { skill: 'Text Structure', score: 65, category: 'Reading' },
  { skill: 'Grammar & Usage', score: 70, category: 'Writing' },
  { skill: 'Essay Structure', score: 75, category: 'Writing' },
  { skill: 'Transition Logic', score: 60, category: 'Writing' },
  { skill: 'Listening Detail', score: 80, category: 'Listening' },
  { skill: 'Speaking Fluency', score: 74, category: 'Speaking' },
];

const WEAKNESSES: WeaknessArea[] = [
  { area: 'Advanced Algebra (Quadratics)', score: 45, gap: 40, priority: 'high' },
  { area: 'Text Structure & Purpose', score: 55, gap: 30, priority: 'high' },
  { area: 'Transition Logic', score: 60, gap: 25, priority: 'high' },
  { area: 'Data Interpretation', score: 65, gap: 20, priority: 'medium' },
  { area: 'Passion & Tone Analysis', score: 68, gap: 17, priority: 'medium' },
  { area: 'Essay Organization', score: 70, gap: 15, priority: 'low' },
];

const TIME_DATA: TimeOnTask[] = [
  { subject: 'SAT Math', hours: 18.5, sessions: 24, color: 'from-blue-500 to-blue-600' },
  { subject: 'SAT Reading', hours: 14.2, sessions: 18, color: 'from-purple-500 to-purple-600' },
  { subject: 'SAT Writing', hours: 9.8, sessions: 12, color: 'from-green-500 to-green-600' },
  { subject: 'Vocabulary', hours: 5.5, sessions: 8, color: 'from-amber-500 to-amber-600' },
  { subject: 'Speaking Practice', hours: 3.2, sessions: 6, color: 'from-red-500 to-red-600' },
];

const PREDICTED_SCORES: PredictedScore[] = [
  { exam: 'SAT', current: 1280, predicted: 1420, max: 1600, confidence: 82 },
  { exam: 'SAT Math', current: 620, predicted: 710, max: 800, confidence: 85 },
  { exam: 'SAT R&W', current: 660, predicted: 710, max: 800, confidence: 80 },
];

const COVERAGE_DATA: CurriculumCoverage[] = [
  { topic: 'Algebra', covered: 12, total: 15, percent: 80 },
  { topic: 'Geometry', covered: 8, total: 12, percent: 67 },
  { topic: 'Statistics', covered: 6, total: 8, percent: 75 },
  { topic: 'Reading', covered: 15, total: 20, percent: 75 },
  { topic: 'Writing/Grammar', covered: 10, total: 14, percent: 71 },
  { topic: 'Vocabulary', covered: 7, total: 10, percent: 70 },
];

const INSIGHTS: AIInsight[] = [
  { type: 'strength', message: 'Strong Algebra Foundation', detail: 'You\'ve mastered 85% of Algebra concepts. Continue building on this with advanced topics.' },
  { type: 'weakness', message: 'Quadratic Functions Need Work', detail: 'Your performance on quadratics is 20% below average. Focus on factoring and the quadratic formula.' },
  { type: 'recommendation', message: 'Increase Reading Practice', detail: 'Aim for 3-4 reading passages per day to improve speed and comprehension by test day.' },
  { type: 'alert', message: 'Target Score Within Reach', detail: 'You\'re 140 points from your target. With consistent study (10h/week), you can reach it in 8 weeks.' },
];

export default function AnalyticsDashboard({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('8w');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'mastery', label: 'Mastery Heatmap', icon: '🗺️' },
    { id: 'growth', label: 'Growth Trends', icon: '📈' },
    { id: 'weakness', label: 'Weakness Analysis', icon: '🔍' },
    { id: 'time', label: 'Time on Task', icon: '⏱️' },
    { id: 'predictions', label: 'Predicted Scores', icon: '🎯' },
    { id: 'coverage', label: 'Curriculum Coverage', icon: '📚' },
    { id: 'insights', label: 'AI Insights', icon: '💡' },
  ];

  const maxHours = Math.max(...TIME_DATA.map(t => t.hours));

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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">Deep insights into performance and growth</p>
            </div>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm">
              <option value="4w" className="text-gray-800">Last 4 weeks</option>
              <option value="8w" className="text-gray-800">Last 8 weeks</option>
              <option value="12w" className="text-gray-800">Last 12 weeks</option>
              <option value="all" className="text-gray-800">All time</option>
            </select>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Current Score</div>
                <div className="text-3xl font-bold text-[#1B2A4A] mt-1">1,280</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">📈 +40 pts this period</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Overall Accuracy</div>
                <div className="text-3xl font-bold text-green-600 mt-1">76%</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">📈 +4% improvement</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Study Hours</div>
                <div className="text-3xl font-bold text-[#C9A84C] mt-1">51.2</div>
                <div className="text-xs text-gray-500 mt-1">Total hours this period</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Skills Mastered</div>
                <div className="text-3xl font-bold text-purple-600 mt-1">18/25</div>
                <div className="text-xs text-gray-500 mt-1">72% curriculum coverage</div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">📈 Score Trend</h3>
                <div className="flex items-end gap-2 h-32">
                  {WEEKLY_GROWTH.slice(-6).map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-8 bg-[#1B2A4A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        Score: {w.score}
                      </div>
                      <div className="w-full rounded-t bg-gradient-to-t from-[#1B2A4A] to-[#C9A84C] transition-all"
                        style={{ height: `${(w.score / 800) * 100}%` }} />
                      <span className="text-[10px] text-gray-400 -rotate-45 origin-left">{w.date.replace('Week ', 'W')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Target Progress</h3>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-[#C9A84C]">1,280</div>
                  <div className="text-sm text-gray-500">Current SAT Score</div>
                  <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>800</span>
                    <span className="font-bold text-[#C9A84C]">Target: 1,500</span>
                    <span>1,600</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MASTERY HEATMAP */}
        {activeTab === 'mastery' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mastery Heatmap by Skill</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="space-y-1">
                {SKILL_MASTERY.map((skill, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                    <span className="w-24 text-xs font-medium text-gray-500 uppercase">{skill.category}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{skill.skill}</span>
                        <span className="text-sm font-bold">{skill.score}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${
                          skill.score >= 80 ? 'bg-green-500' : skill.score >= 65 ? 'bg-[#C9A84C]' : skill.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`} style={{ width: `${skill.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GROWTH TRENDS */}
        {activeTab === 'growth' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Growth Trends Over Time</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1B2A4A]" /> Score</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#C9A84C]" /> Accuracy</div>
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end">
                  {WEEKLY_GROWTH.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 justify-end h-full">
                      <div className="flex gap-1 w-full items-end justify-center" style={{ height: '85%' }}>
                        <div className="w-3/5 rounded-t bg-[#1B2A4A] group relative transition-all hover:opacity-80"
                          style={{ height: `${(w.score / 800) * 100}%` }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1B2A4A] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {w.score}
                          </div>
                        </div>
                        <div className="w-2/5 rounded-t bg-[#C9A84C] group relative transition-all hover:opacity-80"
                          style={{ height: `${w.accuracy}%` }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-[#1B2A4A] text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {w.accuracy}%
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">{w.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEAKNESS ANALYSIS */}
        {activeTab === 'weakness' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weakness Analysis</h2>
            <div className="space-y-3">
              {WEAKNESSES.map((w, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        w.priority === 'high' ? 'bg-red-500' : w.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <span className="font-medium text-gray-900">{w.area}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        w.priority === 'high' ? 'bg-red-100 text-red-600' : w.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>{w.priority}</span>
                    </div>
                    <span className="font-bold text-lg">{w.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500" style={{ width: `${w.score}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Gap: {w.gap}% below mastery threshold</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIME ON TASK */}
        {activeTab === 'time' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Time on Task</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {TIME_DATA.map((t, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{t.subject}</span>
                    <span className="text-sm text-gray-500">{t.hours}h · {t.sessions} sessions</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${t.color} flex items-center justify-end pr-2`}
                      style={{ width: `${(t.hours / maxHours) * 100}%` }}>
                      <span className="text-[10px] text-white font-medium">{t.hours}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREDICTED SCORES */}
        {activeTab === 'predictions' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Predicted Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREDICTED_SCORES.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
                  <div className="text-sm text-gray-500 mb-2">{p.exam}</div>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-400">Current</div>
                      <div className="text-lg font-bold text-gray-600">{p.current}</div>
                    </div>
                    <div className="text-2xl text-gray-300">→</div>
                    <div>
                      <div className="text-xs text-[#C9A84C]">Predicted</div>
                      <div className="text-3xl font-bold text-[#1B2A4A]">{p.predicted}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-gray-400 to-[#C9A84C]"
                      style={{ width: `${(p.predicted / p.max) * 100}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Max: {p.max} · Confidence: {p.confidence}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CURRICULUM COVERAGE */}
        {activeTab === 'coverage' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Curriculum Coverage</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {COVERAGE_DATA.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{c.topic}</span>
                      <span className="text-gray-500">{c.covered}/{c.total} topics ({c.percent}%)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: `${c.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>📊 Overall Coverage:</strong> 73% of curriculum topics have been covered.
                  Focus on Geometry and Vocabulary to improve your coverage score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI INSIGHTS */}
        {activeTab === 'insights' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Insights & Recommendations</h2>
            <div className="space-y-3">
              {INSIGHTS.map((insight, i) => (
                <div key={i} className={`rounded-xl border shadow-sm p-5 ${
                  insight.type === 'strength' ? 'bg-green-50 border-green-200' :
                  insight.type === 'weakness' ? 'bg-red-50 border-red-200' :
                  insight.type === 'recommendation' ? 'bg-blue-50 border-blue-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">
                      {insight.type === 'strength' ? '💪' : insight.type === 'weakness' ? '⚠️' : insight.type === 'recommendation' ? '💡' : '🔔'}
                    </span>
                    <div>
                      <h3 className={`font-semibold text-sm ${
                        insight.type === 'strength' ? 'text-green-800' :
                        insight.type === 'weakness' ? 'text-red-800' :
                        insight.type === 'recommendation' ? 'text-blue-800' : 'text-amber-800'
                      }`}>{insight.message}</h3>
                      <p className={`text-xs mt-1 ${
                        insight.type === 'strength' ? 'text-green-700' :
                        insight.type === 'weakness' ? 'text-red-700' :
                        insight.type === 'recommendation' ? 'text-blue-700' : 'text-amber-700'
                      }`}>{insight.detail}</p>
                    </div>
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