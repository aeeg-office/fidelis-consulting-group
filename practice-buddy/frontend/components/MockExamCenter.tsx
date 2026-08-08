'use client';

import React, { useState, useEffect, useMemo } from 'react';

type ExamType = 'SAT' | 'ACT' | 'IELTS' | 'TOEFL';

interface MockExam {
  id: string;
  title: string;
  type: ExamType;
  duration: string;
  totalQuestions: number;
  sections: { name: string; questions: number; time: string }[];
  difficulty: string;
  rules: string[];
  calculator: 'allowed' | 'not-allowed' | 'some-sections';
  scoreRange: string;
}

interface ExamResult {
  totalScore: number;
  maxScore: number;
  sectionScores: { name: string; score: number; maxScore: number; percent: number }[];
  percentile: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeTaken: string;
}

const MOCK_EXAMS: MockExam[] = [
  { id: 'sat-1', title: 'SAT Practice Test 1', type: 'SAT', duration: '3h 15m', totalQuestions: 98, difficulty: 'Medium',
    sections: [{ name: 'Reading & Writing', questions: 54, time: '64 min' }, { name: 'Math', questions: 44, time: '70 min' }],
    rules: ['No food or drink during the exam', 'Calculator allowed for Math section only', 'Use #2 pencils only', 'Fill bubbles completely'],
    calculator: 'some-sections', scoreRange: '400-1600' },
  { id: 'sat-2', title: 'SAT Practice Test 2', type: 'SAT', duration: '3h 15m', totalQuestions: 98, difficulty: 'Hard',
    sections: [{ name: 'Reading & Writing', questions: 54, time: '64 min' }, { name: 'Math', questions: 44, time: '70 min' }],
    rules: ['No food or drink during the exam', 'Calculator allowed for Math section only', 'Use #2 pencils only', 'Fill bubbles completely'],
    calculator: 'some-sections', scoreRange: '400-1600' },
  { id: 'sat-3', title: 'SAT Practice Test 3', type: 'SAT', duration: '3h 15m', totalQuestions: 98, difficulty: 'Easy',
    sections: [{ name: 'Reading & Writing', questions: 54, time: '64 min' }, { name: 'Math', questions: 44, time: '70 min' }],
    rules: ['No food or drink during the exam', 'Calculator allowed for Math section only'], calculator: 'some-sections', scoreRange: '400-1600' },
  { id: 'act-1', title: 'ACT Practice Test A', type: 'ACT', duration: '2h 55m', totalQuestions: 215, difficulty: 'Medium',
    sections: [{ name: 'English', questions: 75, time: '45 min' }, { name: 'Math', questions: 60, time: '60 min' }, { name: 'Reading', questions: 40, time: '35 min' }, { name: 'Science', questions: 40, time: '35 min' }],
    rules: ['Calculator allowed for Math section only', 'No penalty for guessing'], calculator: 'some-sections', scoreRange: '1-36' },
  { id: 'ielts-1', title: 'IELTS Academic Test 1', type: 'IELTS', duration: '2h 45m', totalQuestions: 40, difficulty: 'Medium',
    sections: [{ name: 'Listening', questions: 40, time: '30 min' }, { name: 'Reading', questions: 40, time: '60 min' }, { name: 'Writing', questions: 2, time: '60 min' }],
    rules: ['No calculators allowed', 'Write clearly in pen', 'Speaking test scheduled separately'],
    calculator: 'not-allowed', scoreRange: '0-9' },
  { id: 'toefl-1', title: 'TOEFL iBT Practice Test 1', type: 'TOEFL', duration: '3h', totalQuestions: 56, difficulty: 'Medium',
    sections: [{ name: 'Reading', questions: 20, time: '35 min' }, { name: 'Listening', questions: 28, time: '36 min' }, { name: 'Speaking', questions: 4, time: '16 min' }, { name: 'Writing', questions: 2, time: '29 min' }],
    rules: ['No calculators allowed', 'Speaking requires a microphone', 'Note-taking is permitted'],
    calculator: 'not-allowed', scoreRange: '0-120' },
];

const EXAM_ICONS: Record<ExamType, string> = { SAT: '📐', ACT: '📏', IELTS: '🌍', TOEFL: '🌐' };
const EXAM_COLORS: Record<ExamType, string> = { SAT: 'blue', ACT: 'green', IELTS: 'orange', TOEFL: 'teal' };
const DIFFICULTY_BADGES: Record<string, string> = { Easy: 'bg-green-100 text-green-700', Medium: 'bg-amber-100 text-amber-700', Hard: 'bg-red-100 text-red-700' };

export default function MockExamCenter({ onBack }: { onBack?: () => void }) {
  const [activeType, setActiveType] = useState<ExamType>('SAT');
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
  const [examMode, setExamMode] = useState<'browse' | 'detail' | 'exam' | 'results'>('browse');
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examActive, setExamActive] = useState(false);
  const [results, setResults] = useState<ExamResult | null>(null);

  const filteredExams = useMemo(() => MOCK_EXAMS.filter(e => e.type === activeType).slice(0, 15), [activeType]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { handleEndExam(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, timeRemaining]);

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  }

  function parseTimeToSeconds(duration: string): number {
    const h = duration.match(/(\d+)h/);
    const m = duration.match(/(\d+)m/);
    return ((h ? parseInt(h[1]) * 3600 : 0) + (m ? parseInt(m[1]) * 60 : 0));
  }

  function startExam() {
    if (!selectedExam) return;
    setCurrentSection(0);
    setCurrentQuestion(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeRemaining(parseTimeToSeconds(selectedExam.duration));
    setExamActive(true);
    setExamMode('exam');
  }

  function handleEndExam() {
    setExamActive(false);
    if (!selectedExam) return;
    const totalQuestions = selectedExam.totalQuestions;
    const answered = Object.keys(answers).length;
    const simulatedCorrect = Math.floor(answered * 0.65);
    const incorrect = answered - simulatedCorrect;
    const unanswered = totalQuestions - answered;
    const scale: Record<string, { max: number; sectionMax: number }> = {
      SAT: { max: 1600, sectionMax: 800 },
      ACT: { max: 36, sectionMax: 36 },
      IELTS: { max: 9, sectionMax: 9 },
      TOEFL: { max: 120, sectionMax: 30 },
    };
    const scaleInfo = scale[selectedExam.type] || { max: 100, sectionMax: 100 };
    const totalScore = Math.round((simulatedCorrect / totalQuestions) * scaleInfo.max);
    const sectionScores = selectedExam.sections.map((sec, i) => {
      const secScore = Math.round((simulatedCorrect / totalQuestions) * scaleInfo.sectionMax * (sec.questions / totalQuestions) * 5);
      return { name: sec.name, score: Math.min(secScore, scaleInfo.sectionMax), maxScore: scaleInfo.sectionMax, percent: Math.min(100, Math.round((secScore / scaleInfo.sectionMax) * 100)) };
    });

    setResults({
      totalScore, maxScore: scaleInfo.max,
      sectionScores, percentile: Math.min(99, 20 + Math.round((totalScore / scaleInfo.max) * 60)),
      correct: simulatedCorrect, incorrect, unanswered,
      timeTaken: formatTime(parseTimeToSeconds(selectedExam.duration) - timeRemaining),
    });
    setExamMode('results');
  }

  function toggleFlag(qId: string) {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  }

  const colorClass = (type: ExamType) => {
    const c = EXAM_COLORS[type];
    return { border: `border-${c}-500`, bg: `bg-${c}-50`, text: `text-${c}-600`, badge: `bg-${c}-100 text-${c}-600` };
  };

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
              <h1 className="text-2xl font-bold">Mock Exam Center</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">Full-length practice exams with real-time scoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {examMode === 'browse' && (
          <>
            {/* Type Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(Object.keys(EXAM_ICONS) as ExamType[]).map(type => (
                <button key={type} onClick={() => setActiveType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeType === type ? 'bg-[#1B2A4A] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A84C]'
                  }`}>
                  <span>{EXAM_ICONS[type]}</span>
                  <span>{type}</span>
                </button>
              ))}
            </div>

            {/* Exam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => (
                <button key={exam.id} onClick={() => { setSelectedExam(exam); setExamMode('detail'); }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-[#C9A84C] transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{EXAM_ICONS[exam.type]}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_BADGES[exam.difficulty] || 'bg-gray-100'}`}>{exam.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{exam.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>⏱ {exam.duration}</span>
                    <span>📝 {exam.totalQuestions} questions</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exam.sections.map(s => (
                      <span key={s.name} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">{s.name}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-400">Score range: {exam.scoreRange}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {examMode === 'detail' && selectedExam && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setExamMode('browse')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to exams
            </button>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{EXAM_ICONS[selectedExam.type]}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h2>
                  <p className="text-gray-500">{selectedExam.type} — {selectedExam.difficulty} difficulty</p>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Section Breakdown</h3>
                <div className="space-y-2">
                  {selectedExam.sections.map((sec, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-medium text-gray-700">{sec.name}</span>
                      <span className="text-gray-500">{sec.questions} questions · {sec.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 p-3 bg-[#1B2A4A]/5 rounded-lg text-sm">
                  <span className="font-medium text-[#1B2A4A]">Total: {selectedExam.duration}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">{selectedExam.totalQuestions} questions</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">Score: {selectedExam.scoreRange}</span>
                </div>
              </div>

              {/* Calculator Policy */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Calculator Policy</h3>
                <div className={`p-3 rounded-lg text-sm ${
                  selectedExam.calculator === 'allowed' ? 'bg-green-50 text-green-700' :
                  selectedExam.calculator === 'not-allowed' ? 'bg-red-50 text-red-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {selectedExam.calculator === 'allowed' && '✅ Calculator allowed for all sections'}
                  {selectedExam.calculator === 'not-allowed' && '❌ No calculators permitted'}
                  {selectedExam.calculator === 'some-sections' && '⚠️ Calculator allowed for some sections only'}
                </div>
              </div>

              {/* Rules */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-2">Rules</h3>
                <ul className="space-y-1">
                  {selectedExam.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={startExam} className="w-full py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a] transition-colors text-lg">
                Start Exam
              </button>
            </div>
          </div>
        )}

        {examMode === 'exam' && selectedExam && (
          <div>
            {/* Exam Header */}
            <div className="bg-white rounded-t-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="font-semibold text-gray-900 text-sm">{selectedExam.title}</span>
                <span className="text-gray-400 text-xs ml-2">{selectedExam.sections[currentSection]?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                  ⏱ {formatTime(timeRemaining)}
                </span>
                <button onClick={handleEndExam} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">End Exam</button>
              </div>
            </div>
            <div className="h-1 bg-gray-200">
              <div className="h-full bg-[#C9A84C]" style={{ width: `${(Object.keys(answers).length / selectedExam.totalQuestions) * 100}%` }} />
            </div>

            {/* Question Area */}
            <div className="bg-white border-x border-b border-gray-100 shadow-sm rounded-b-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1}</span>
                <button onClick={() => toggleFlag(`q${currentQuestion}`)} className={`text-xs px-2 py-1 rounded ${flagged.has(`q${currentQuestion}`) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {flagged.has(`q${currentQuestion}`) ? '🏴 Flagged' : 'Flag'}
                </button>
              </div>

              {/* Mock Question Display */}
              <div className="mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border text-sm leading-relaxed mb-4 italic text-gray-600">
                  The following passage is adapted from a scientific article discussing climate change impacts on coastal ecosystems.
                </div>
                <p className="text-base font-medium text-gray-900 leading-relaxed">
                  According to the passage, which of the following best describes the primary effect of rising sea temperatures on coral reef ecosystems?
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const qId = `q${currentQuestion}`;
                  const isSelected = answers[qId] === opt;
                  const texts: Record<string, string> = { A: 'Coral bleaching becomes more frequent and severe', B: 'Coral growth rates increase significantly', C: 'Fish populations migrate to deeper waters', D: 'Algae completely replaces coral populations' };
                  return (
                    <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [qId]: opt }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-200 hover:border-[#C9A84C]/50 hover:bg-gray-50'
                      }`}>
                      <span className={`font-bold mr-3 ${isSelected ? 'text-[#C9A84C]' : 'text-gray-400'}`}>{opt}.</span>
                      <span className={isSelected ? 'text-[#1B2A4A]' : 'text-gray-700'}>{texts[opt]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button onClick={() => setCurrentQuestion(i => Math.max(0, i - 1))} disabled={currentQuestion === 0}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">
                  ← Previous
                </button>
                <span className="text-sm text-gray-400">{Object.keys(answers).length} answered · {flagged.size} flagged</span>
                {currentQuestion < 9 ? (
                  <button onClick={() => setCurrentQuestion(i => i + 1)} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243555]">
                    Next →
                  </button>
                ) : (
                  <button onClick={handleEndExam} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium">
                    Submit Exam
                  </button>
                )}
              </div>

              {/* Question Palette */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-2">Question Navigator</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: Math.min(15, selectedExam.totalQuestions) }, (_, i) => {
                    const qId = `q${i}`;
                    const isAnswered = answers[qId] !== undefined;
                    const isFlagged = flagged.has(qId);
                    const isCurrent = i === currentQuestion;
                    return (
                      <button key={i} onClick={() => setCurrentQuestion(i)}
                        className={`w-7 h-7 text-xs font-medium rounded transition-all ${
                          isCurrent ? 'ring-2 ring-[#C9A84C]' : ''
                        } ${
                          isAnswered ? 'bg-green-500 text-white' : isFlagged ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {examMode === 'results' && results && selectedExam && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center mb-6">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Complete!</h2>
              <p className="text-gray-500">{selectedExam.title}</p>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="text-5xl font-bold text-[#1B2A4A]">{results.totalScore}</div>
                <div className="text-gray-400 text-sm">out of {results.maxScore}</div>
                <div className="text-sm text-gray-500 mt-2">Estimated Percentile: <span className="font-bold text-[#C9A84C]">{results.percentile}th</span></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Correct</span><span className="font-semibold text-green-600">{results.correct}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Incorrect</span><span className="font-semibold text-red-600">{results.incorrect}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Unanswered</span><span className="font-semibold text-gray-600">{results.unanswered}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Time Taken</span><span className="font-semibold text-gray-600">{results.timeTaken}</span></div>
                </div>
              </div>
            </div>

            {/* Section Scores */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Section Scores</h3>
              <div className="space-y-4">
                {results.sectionScores.map((sec, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{sec.name}</span>
                      <span>{sec.score}/{sec.maxScore} ({sec.percent}%)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: `${sec.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button onClick={() => setExamMode('browse')} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                Back to Exams
              </button>
              <button onClick={startExam} className="px-6 py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a]">
                Retake Exam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}