// AEEG Practice Buddy - Practice Page Component
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// Types
interface Question {
  id: string;
  aeeqId: string;
  difficulty: string;
  questionFormat: string;
  passageType?: string;
  passageText?: string;
  pairedPassageText?: string;
  passageAttribution?: string;
  questionStem: string;
  answerOptions?: { id: string; text: string }[];
  category?: { name: string; code: string };
  subcategory?: { name: string; code: string };
  domain?: { name: string; code: string };
  figureAsset?: string;
  figureAltText?: string;
  calculatorAllowed?: boolean;
  hasChart?: boolean;
  hasTable?: boolean;
  hasEquation?: boolean;
}

interface AnswerResponse {
  attemptId: string;
  isCorrect: boolean;
  attemptNumber: number;
  message: string;
  strategy?: string;
  hint?: string;
  explanation?: string;
  expandedExplanation?: string;
  wrongAnswerRationales?: any;
  solutionSteps?: any;
  commonMisconceptions?: string;
  showCorrectAnswer?: boolean;
  showStrategy?: boolean;
}

interface PracticeState {
  questions: Question[];
  currentIndex: number;
  sessionId: string | null;
  selectedAnswer: string | null;
  attemptNumber: number;
  lastResult: AnswerResponse | null;
  isComplete: boolean;
  showExplanation: boolean;
  isTimed: boolean;
  timeRemaining: number;
  bookmarked: Set<string>;
  flagged: Set<string>;
  answers: Map<string, boolean>;
}

export default function PracticePage() {
  const [mode, setMode] = useState<'select' | 'practice' | 'results'>('select');
  const [filters, setFilters] = useState({
    subjectId: '',
    domainId: '',
    categoryId: '',
    subcategoryId: '',
    difficulty: '',
    questionCount: '10',
    isTimed: false,
    timeLimit: '15',
  });
  const [state, setState] = useState<PracticeState>({
    questions: [],
    currentIndex: 0,
    sessionId: null,
    selectedAnswer: null,
    attemptNumber: 1,
    lastResult: null,
    isComplete: false,
    showExplanation: false,
    isTimed: false,
    timeRemaining: 0,
    bookmarked: new Set(),
    flagged: new Set(),
    answers: new Map(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStrategy, setShowStrategy] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [hierarchy, setHierarchy] = useState<any[]>([]);

  // Load hierarchy
  useEffect(() => {
    loadHierarchy();
  }, []);

  async function loadHierarchy() {
    try {
      const token = localStorage.getItem('pb_token');
      if (!token) return;
      const res = await fetch('http://localhost:3001/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      }
    } catch {}
  }

  async function startPractice() {
    setLoading(true);
    setError('');
    try {
      const data = await api.startSession({
        ...filters,
        isTimed: filters.isTimed,
        timeLimit: filters.timeLimit,
        questionCount: filters.questionCount,
      });
      setState(prev => ({
        ...prev,
        questions: data.questions,
        sessionId: data.session.id,
        currentIndex: 0,
        attemptNumber: 1,
        lastResult: null,
        selectedAnswer: null,
        isComplete: false,
        showExplanation: false,
        isTimed: filters.isTimed,
        timeRemaining: parseInt(filters.timeLimit) * 60,
        bookmarked: new Set(),
        flagged: new Set(),
        answers: new Map(),
      }));
      setMode('practice');
      if (filters.isTimed) {
        startTimer(parseInt(filters.timeLimit) * 60);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  function startTimer(seconds: number) {
    if (timer) clearInterval(timer);
    const t = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(t);
          endSession();
          return { ...prev, timeRemaining: 0, isComplete: true };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    setTimer(t);
  }

  async function submitAnswer(selectedAnswer: string) {
    if (!state.sessionId) return;
    setLoading(true);
    try {
      const data = await api.submitAnswer(state.sessionId, {
        questionId: state.questions[state.currentIndex].id,
        selectedAnswer,
        attemptNumber: state.attemptNumber,
        timeSpent: 30,
      });
      setState(prev => ({
        ...prev,
        selectedAnswer,
        lastResult: data,
        attemptNumber: data.attemptNumber,
        answers: new Map(prev.answers).set(prev.questions[prev.currentIndex].id, data.isCorrect),
      }));
      if (data.strategy) setShowStrategy(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  function nextQuestion() {
    setState(prev => {
      if (prev.currentIndex >= prev.questions.length - 1) {
        endSession();
        return { ...prev, isComplete: true };
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        attemptNumber: 1,
        lastResult: null,
        showExplanation: false,
      };
    });
    setShowStrategy(false);
    setShowCalculator(false);
  }

  function retryQuestion() {
    setState(prev => ({
      ...prev,
      selectedAnswer: null,
      attemptNumber: 2,
      lastResult: null,
    }));
    setShowStrategy(false);
  }

  async function endSession() {
    if (timer) clearInterval(timer);
    if (state.sessionId) {
      try {
        await api.completeSession(state.sessionId);
      } catch {}
    }
    setMode('results');
  }

  async function toggleBookmark() {
    const q = state.questions[state.currentIndex];
    try {
      const result = await api.toggleBookmark(q.id);
      setState(prev => {
        const newBookmarks = new Set(prev.bookmarked);
        if (result.bookmarked) newBookmarks.add(q.id);
        else newBookmarks.delete(q.id);
        return { ...prev, bookmarked: newBookmarks };
      });
    } catch {}
  }

  async function flagQuestion() {
    const q = state.questions[state.currentIndex];
    try {
      await api.flagQuestion(q.id, 'error', 'Student flagged this question');
      setState(prev => {
        const newFlags = new Set(prev.flagged);
        newFlags.add(q.id);
        return { ...prev, flagged: newFlags };
      });
    } catch {}
  }

  const currentQ = state.questions[state.currentIndex];
  const correctCount = Array.from(state.answers.values()).filter(Boolean).length;
  const totalAnswered = state.answers.size;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .pb-container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .pb-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
        .pb-btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .pb-btn-primary { background: #1a56db; color: white; }
        .pb-btn-primary:hover { background: #1648c0; }
        .pb-btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
        .pb-btn-secondary { background: #f3f4f6; color: #374151; }
        .pb-btn-secondary:hover { background: #e5e7eb; }
        .pb-btn-success { background: #059669; color: white; }
        .pb-btn-danger { background: #dc2626; color: white; }
        .pb-btn-outline { background: transparent; border: 2px solid #1a56db; color: #1a56db; }
        .pb-btn-outline:hover { background: #1a56db; color: white; }
        .pb-option { display: block; width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 0.5rem; }
        .pb-option:hover { border-color: #93c5fd; background: #f0f7ff; }
        .pb-option.selected { border-color: #1a56db; background: #eff6ff; }
        .pb-option.correct { border-color: #059669; background: #f0fdf4; }
        .pb-option.incorrect { border-color: #dc2626; background: #fef2f2; }
        .pb-timer { font-size: 1.25rem; font-weight: 700; color: #dc2626; font-variant-numeric: tabular-nums; }
        .pb-strategy-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .pb-hint-box { background: #f0f9ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .pb-explanation-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .pb-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .pb-badge-easy { background: #dbeafe; color: #1e40af; }
        .pb-badge-medium { background: #fef3c7; color: #92400e; }
        .pb-badge-hard { background: #fce7f3; color: #9d174d; }
        .pb-progress-bar { height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden; }
        .pb-progress-fill { height: 100%; background: #1a56db; transition: width 0.3s; border-radius: 2px; }
        .pb-select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; font-size: 0.875rem; }
        .pb-label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
        .pb-input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; }
        .pb-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 768px) { .pb-grid-2 { grid-template-columns: 1fr; } }
        .pb-mastery-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .pb-mastery-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
      `}</style>

      {/* ======== MODE SELECTION ======== */}
      {mode === 'select' && (
        <div className="pb-container py-8">
          <div className="pb-card mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SAT Practice Buddy</h1>
            <p className="text-gray-600">Select your practice settings below</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

          <div className="pb-card">
            <div className="pb-grid-2">
              <div>
                <label className="pb-label">Subject</label>
                <select className="pb-select" value={filters.subjectId} onChange={e => setFilters(f => ({ ...f, subjectId: e.target.value }))}>
                  <option value="">All Subjects</option>
                  {hierarchy.map(exam => exam.subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  )))}
                </select>
              </div>
              <div>
                <label className="pb-label">Difficulty</label>
                <select className="pb-select" value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}>
                  <option value="">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="pb-label">Number of Questions</label>
                <select className="pb-select" value={filters.questionCount} onChange={e => setFilters(f => ({ ...f, questionCount: e.target.value }))}>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="27">27 (Math Module)</option>
                  <option value="33">33 (RW Module)</option>
                </select>
              </div>
              <div>
                <label className="pb-label">Timer</label>
                <div className="flex gap-2">
                  <select className="pb-select" value={filters.timeLimit} onChange={e => setFilters(f => ({ ...f, timeLimit: e.target.value }))} disabled={!filters.isTimed}>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={filters.isTimed} onChange={e => setFilters(f => ({ ...f, isTimed: e.target.checked }))} />
                    Timed
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="pb-btn pb-btn-primary" onClick={startPractice} disabled={loading}>
                {loading ? 'Starting...' : 'Start Practice'}
              </button>
              <button className="pb-btn pb-btn-secondary" onClick={() => {
                setFilters({ subjectId: '', domainId: '', categoryId: '', subcategoryId: '', difficulty: '', questionCount: '10', isTimed: false, timeLimit: '15' });
              }}>Reset</button>
            </div>
          </div>

          {/* Quick Practice Options */}
          <div className="pb-card mt-4">
            <h2 className="text-lg font-semibold mb-3">Quick Practice</h2>
            <div className="flex flex-wrap gap-2">
              <button className="pb-btn pb-btn-secondary" onClick={() => { setFilters(f => ({ ...f, questionCount: '5', difficulty: 'mixed' })); }}>5-Min Warm-up</button>
              <button className="pb-btn pb-btn-secondary" onClick={() => { setFilters(f => ({ ...f, questionCount: '10', difficulty: 'mixed' })); }}>10-Question Mix</button>
              <button className="pb-btn pb-btn-secondary" onClick={() => { setFilters(f => ({ ...f, questionCount: '10', difficulty: 'medium' })); }}>Medium Difficulty</button>
              <button className="pb-btn pb-btn-secondary" onClick={() => { setFilters(f => ({ ...f, questionCount: '10', isTimed: true, timeLimit: '15' })); }}>Timed Sprint</button>
            </div>
          </div>
        </div>
      )}

      {/* ======== PRACTICE MODE ======== */}
      {mode === 'practice' && currentQ && (
        <div className="min-h-screen bg-gray-50">
          {/* Header bar */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="pb-container flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">
                  Q{state.currentIndex + 1} of {state.questions.length}
                </span>
                <span className={`pb-badge ${currentQ.difficulty === 'easy' ? 'pb-badge-easy' : currentQ.difficulty === 'hard' ? 'pb-badge-hard' : 'pb-badge-medium'}`}>
                  {currentQ.difficulty}
                </span>
                {currentQ.category && (
                  <span className="text-sm text-gray-500 hidden md:inline">{currentQ.category.name}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {state.isTimed && (
                  <span className="pb-timer">
                    {Math.floor(state.timeRemaining / 60)}:{String(state.timeRemaining % 60).padStart(2, '0')}
                  </span>
                )}
                <button className="pb-btn pb-btn-secondary text-sm py-1 px-3" onClick={toggleBookmark}>
                  {state.bookmarked.has(currentQ.id) ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
                <button className="pb-btn pb-btn-secondary text-sm py-1 px-3" onClick={flagQuestion}>Flag</button>
                <button className="pb-btn pb-btn-secondary text-sm py-1 px-3" onClick={() => endSession()}>End</button>
              </div>
            </div>
            <div className="pb-progress-bar">
              <div className="pb-progress-fill" style={{ width: `${((state.currentIndex + 1) / state.questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="pb-container py-6">
            <div className="pb-grid-2">
              {/* Question */}
              <div className="pb-card">
                {/* Passage */}
                {currentQ.passageText && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border text-sm leading-relaxed max-h-64 overflow-y-auto">
                    {currentQ.passageAttribution && (
                      <p className="text-xs text-gray-400 mb-2 italic">{currentQ.passageAttribution}</p>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: currentQ.passageText }} />
                  </div>
                )}

                {/* Question Stem */}
                <div className="text-base font-medium mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.questionStem }} />

                {/* Answer Options */}
                {currentQ.answerOptions && (
                  <div className="space-y-2">
                    {currentQ.answerOptions.map((opt) => {
                      let className = 'pb-option';
                      if (state.selectedAnswer) {
                        if (state.lastResult?.isCorrect && state.selectedAnswer === opt.id) className += ' correct';
                        else if (!state.lastResult?.isCorrect && state.selectedAnswer === opt.id) className += ' incorrect';
                        else if (state.lastResult?.showCorrectAnswer && state.lastResult?.attemptNumber >= 2) {
                          // Show correct answer after 2nd wrong attempt
                        }
                      } else if (state.selectedAnswer === opt.id) {
                        className += ' selected';
                      }
                      return (
                        <button
                          key={opt.id}
                          className={className}
                          onClick={() => { if (!state.selectedAnswer) submitAnswer(opt.id); }}
                          disabled={!!state.selectedAnswer || loading}
                        >
                          <span className="font-semibold mr-2">{opt.id}.</span> {opt.text}
                        </button>
                      );
                    })}
                  </div>
                )}

                {loading && <div className="text-center py-4 text-gray-500">Checking answer...</div>}
              </div>

              {/* Feedback Panel */}
              <div>
                {state.lastResult && (
                  <div className="pb-card">
                    {/* Result Message */}
                    <div className={`text-lg font-bold mb-3 ${state.lastResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {state.lastResult.message}
                    </div>

                    {/* Strategy (always shown after 1st attempt) */}
                    {state.lastResult.strategy && (
                      <div className="pb-strategy-box">
                        <div className="font-semibold text-sm text-amber-800 mb-1">Strategy</div>
                        <div className="text-sm text-amber-700">{state.lastResult.strategy}</div>
                      </div>
                    )}

                    {/* Hint (shown after wrong 1st attempt) */}
                    {state.lastResult.hint && (
                      <div className="pb-hint-box">
                        <div className="font-semibold text-sm text-blue-800 mb-1">Hint</div>
                        <div className="text-sm text-blue-700">{state.lastResult.hint}</div>
                      </div>
                    )}

                    {/* Explanation (shown after correct or after 2nd wrong) */}
                    {state.lastResult.explanation && (
                      <div className="pb-explanation-box">
                        <div className="font-semibold text-sm text-green-800 mb-1">Explanation</div>
                        <div className="text-sm text-green-700">{state.lastResult.explanation}</div>
                      </div>
                    )}

                    {/* Expanded Explanation */}
                    {state.lastResult.expandedExplanation && (
                      <div className="mt-3">
                        <button className="text-sm text-blue-600 hover:underline" onClick={() => setState(s => ({ ...s, showExplanation: !s.showExplanation }))}>
                          {state.showExplanation ? 'Hide detailed explanation' : 'Show detailed explanation'}
                        </button>
                        {state.showExplanation && (
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: state.lastResult.expandedExplanation }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {/* Wrong 1st attempt → try again */}
                      {!state.lastResult.isCorrect && state.lastResult.attemptNumber === 1 && (
                        <button className="pb-btn pb-btn-primary" onClick={retryQuestion}>
                          Try Again
                        </button>
                      )}

                      {/* Show next question button */}
                      <button className="pb-btn pb-btn-primary" onClick={nextQuestion}>
                        {state.currentIndex >= state.questions.length - 1 ? 'See Results' : 'Next Question'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Stats */}
                <div className="pb-card mt-4">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-1">
                      <span>Correct: {correctCount}/{totalAnswered}</span>
                      <span>Accuracy: {accuracy}%</span>
                    </div>
                    <div className="pb-progress-bar">
                      <div className="pb-progress-fill" style={{ width: `${accuracy}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== RESULTS ======== */}
      {mode === 'results' && (
        <div className="pb-container py-8">
          <div className="pb-card text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h1>
            <div className="text-6xl font-bold text-blue-600 my-4">{accuracy}%</div>
            <p className="text-gray-600">
              {correctCount} of {totalAnswered} questions correct
            </p>
          </div>

          <div className="pb-grid-2">
            <div className="pb-card">
              <h2 className="text-lg font-semibold mb-3">Session Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Questions Answered</span><span className="font-semibold">{totalAnswered}</span></div>
                <div className="flex justify-between"><span>First-Attempt Correct</span><span className="font-semibold text-green-600">{correctCount}</span></div>
                <div className="flex justify-between"><span>First-Attempt Accuracy</span><span className="font-semibold">{accuracy}%</span></div>
                <div className="flex justify-between"><span>Difficulty</span><span className="font-semibold capitalize">{filters.difficulty || 'Mixed'}</span></div>
                {filters.isTimed && <div className="flex justify-between"><span>Time Used</span><span className="font-semibold">{Math.floor((parseInt(filters.timeLimit) * 60 - state.timeRemaining) / 60)}:{(parseInt(filters.timeLimit) * 60 - state.timeRemaining) % 60 < 10 ? '0' : ''}{(parseInt(filters.timeLimit) * 60 - state.timeRemaining) % 60}</span></div>}
              </div>
            </div>

            <div className="pb-card">
              <h2 className="text-lg font-semibold mb-3">Need More Practice?</h2>
              <div className="space-y-2">
                <button className="pb-btn pb-btn-primary w-full" onClick={() => setMode('select')}>Start New Practice</button>
                <button className="pb-btn pb-btn-secondary w-full" onClick={() => {
                  setFilters(f => ({ ...f, difficulty: 'hard' }));
                  setMode('select');
                }}>Increase Difficulty</button>
                <button className="pb-btn pb-btn-secondary w-full" onClick={() => {
                  setFilters(f => ({ ...f, questionCount: '33', isTimed: true, timeLimit: '64' }));
                  setMode('select');
                }}>Try Full RW Module (33Q)</button>
                <button className="pb-btn pb-btn-secondary w-full" onClick={() => {
                  setFilters(f => ({ ...f, questionCount: '27', isTimed: true, timeLimit: '45' }));
                  setMode('select');
                }}>Try Full Math Module (27Q)</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}