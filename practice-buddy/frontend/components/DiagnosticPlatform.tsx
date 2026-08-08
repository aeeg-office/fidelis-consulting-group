'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/api';

type ExamType = 'SAT' | 'ACT' | 'IELTS' | 'TOEFL' | 'Academic English' | 'Common Core Math';
type Step = 'select' | 'instructions' | 'exam' | 'results';

interface DiagnosticQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  section: string;
  difficulty: string;
  skill: string;
  passage?: string;
}

interface DiagnosticResult {
  readiness: number;
  recommendedCurriculum: string;
  masteryBaseline: number;
  estimatedPerformance: number;
  learningGaps: { skill: string; score: number; priority: 'high' | 'medium' | 'low' }[];
  sectionScores: { section: string; correct: number; total: number; percent: number }[];
  totalCorrect: number;
  totalQuestions: number;
}

const EXAM_TYPES: { type: ExamType; icon: string; description: string; duration: string; sections: string[] }[] = [
  { type: 'SAT', icon: '📐', description: 'Scholastic Assessment Test', duration: '3h 15m', sections: ['Reading & Writing', 'Math'] },
  { type: 'ACT', icon: '📏', description: 'American College Testing', duration: '2h 55m', sections: ['English', 'Math', 'Reading', 'Science'] },
  { type: 'IELTS', icon: '🌍', description: 'International English Language Testing System', duration: '2h 45m', sections: ['Listening', 'Reading', 'Writing', 'Speaking'] },
  { type: 'TOEFL', icon: '🌐', description: 'Test of English as a Foreign Language', duration: '3h', sections: ['Reading', 'Listening', 'Speaking', 'Writing'] },
  { type: 'Academic English', icon: '📖', description: 'Academic English Proficiency', duration: '2h', sections: ['Grammar', 'Reading Comprehension', 'Vocabulary', 'Academic Writing'] },
  { type: 'Common Core Math', icon: '➕', description: 'Common Core Mathematics', duration: '2h', sections: ['Algebra', 'Geometry', 'Statistics', 'Number Sense'] },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const MOCK_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  SAT: [
    { id: 'sat1', text: 'The author\'s use of the word "tenacious" in line 23 primarily serves to:', options: [{ id: 'A', text: 'Criticize the subject\'s stubbornness' }, { id: 'B', text: 'Highlight the subject\'s determination' }, { id: 'C', text: 'Question the subject\'s motives' }, { id: 'D', text: 'Dismiss the subject\'s efforts' }], correctAnswer: 'B', section: 'Reading & Writing', difficulty: 'medium', skill: 'Reading Comprehension: Tone & Purpose' },
    { id: 'sat2', text: 'If 3x + 7 = 22, what is the value of x?', options: [{ id: 'A', text: '3' }, { id: 'B', text: '5' }, { id: 'C', text: '7' }, { id: 'D', text: '15' }], correctAnswer: 'B', section: 'Math', difficulty: 'easy', skill: 'Algebra: Linear Equations' },
    { id: 'sat3', text: 'The function f is defined by f(x) = 2x² - 3x + 1. What is f(-1)?', options: [{ id: 'A', text: '0' }, { id: 'B', text: '4' }, { id: 'C', text: '6' }, { id: 'D', text: '-4' }], correctAnswer: 'C', section: 'Math', difficulty: 'medium', skill: 'Algebra: Functions' },
    { id: 'sat4', text: 'Which choice completes the text with the most logical and precise word or phrase?', options: [{ id: 'A', text: 'Notwithstanding' }, { id: 'B', text: 'Therefore' }, { id: 'C', text: 'Furthermore' }, { id: 'D', text: 'Nevertheless' }], correctAnswer: 'C', section: 'Reading & Writing', difficulty: 'hard', skill: 'Writing: Transitions' },
    { id: 'sat5', text: 'In a right triangle, if one acute angle measures 35°, what is the measure of the other acute angle?', options: [{ id: 'A', text: '35°' }, { id: 'B', text: '45°' }, { id: 'C', text: '55°' }, { id: 'D', text: '65°' }], correctAnswer: 'C', section: 'Math', difficulty: 'easy', skill: 'Geometry: Triangles' },
    { id: 'sat6', text: 'The author mentions "the Industrial Revolution" primarily to:', options: [{ id: 'A', text: 'Provide a historical backdrop' }, { id: 'B', text: 'Introduce a contrasting viewpoint' }, { id: 'C', text: 'Support a causal argument' }, { id: 'D', text: 'Critique modern industrialization' }], correctAnswer: 'A', section: 'Reading & Writing', difficulty: 'medium', skill: 'Reading: Purpose & Structure' },
    { id: 'sat7', text: 'A circle has a radius of 6. What is its area?', options: [{ id: 'A', text: '12π' }, { id: 'B', text: '24π' }, { id: 'C', text: '36π' }, { id: 'D', text: '72π' }], correctAnswer: 'C', section: 'Math', difficulty: 'easy', skill: 'Geometry: Circles' },
    { id: 'sat8', text: 'The passage suggests that the protagonist\'s primary motivation is:', options: [{ id: 'A', text: 'Financial gain' }, { id: 'B', text: 'Personal redemption' }, { id: 'C', text: 'Social recognition' }, { id: 'D', text: 'Intellectual curiosity' }], correctAnswer: 'B', section: 'Reading & Writing', difficulty: 'medium', skill: 'Reading: Inference' },
    { id: 'sat9', text: 'If the system of equations has no solution, what is the value of k? 2x + 3y = 7 and 4x + ky = 14', options: [{ id: 'A', text: '3' }, { id: 'B', text: '6' }, { id: 'C', text: '7' }, { id: 'D', text: '14' }], correctAnswer: 'B', section: 'Math', difficulty: 'hard', skill: 'Algebra: Systems of Equations' },
    { id: 'sat10', text: 'The graph of y = (x-2)(x+3) intersects the x-axis at how many points?', options: [{ id: 'A', text: '0' }, { id: 'B', text: '1' }, { id: 'C', text: '2' }, { id: 'D', text: '3' }], correctAnswer: 'C', section: 'Math', difficulty: 'medium', skill: 'Algebra: Quadratics' },
  ],
  ACT: [
    { id: 'act1', text: 'Which of the following sentences best combines the two sentences below?\nSentence 1: The experiment was successful.\nSentence 2: The results were unexpected.', options: [{ id: 'A', text: 'The experiment was successful, but the results were unexpected.' }, { id: 'B', text: 'The experiment was successful because the results were unexpected.' }, { id: 'C', text: 'The experiment was successful, so the results were unexpected.' }, { id: 'D', text: 'The experiment was successful; therefore, the results were unexpected.' }], correctAnswer: 'A', section: 'English', difficulty: 'medium', skill: 'English: Sentence Structure' },
    { id: 'act2', text: 'What is the value of sin(30°)?', options: [{ id: 'A', text: '0' }, { id: 'B', text: '1/2' }, { id: 'C', text: '√3/2' }, { id: 'D', text: '1' }], correctAnswer: 'B', section: 'Math', difficulty: 'easy', skill: 'Math: Trigonometry' },
  ],
  IELTS: [
    { id: 'ielts1', text: 'According to the passage, what is the main cause of urban heat islands?', options: [{ id: 'A', text: 'Industrial emissions' }, { id: 'B', text: 'Reduced vegetation and dark surfaces' }, { id: 'C', text: 'Vehicle traffic' }, { id: 'D', text: 'Population density' }], correctAnswer: 'B', section: 'Reading', difficulty: 'medium', skill: 'Reading: Main Idea' },
    { id: 'ielts2', text: 'The speaker\'s attitude toward the proposal can best be described as:', options: [{ id: 'A', text: 'Enthusiastic support' }, { id: 'B', text: 'Cautious optimism' }, { id: 'C', text: 'Strong opposition' }, { id: 'D', text: 'Neutral indifference' }], correctAnswer: 'B', section: 'Listening', difficulty: 'hard', skill: 'Listening: Attitude' },
  ],
  TOEFL: [
    { id: 'toefl1', text: 'What is the lecture mainly about?', options: [{ id: 'A', text: 'The history of plate tectonics' }, { id: 'B', text: 'The formation of igneous rocks' }, { id: 'C', text: 'Methods of geological dating' }, { id: 'D', text: 'The rock cycle' }], correctAnswer: 'B', section: 'Reading', difficulty: 'medium', skill: 'Reading: Gist-Content' },
    { id: 'toefl2', text: 'Why does the professor mention the Hubble Telescope?', options: [{ id: 'A', text: 'To illustrate a technological limitation' }, { id: 'B', text: 'To provide an example of international cooperation' }, { id: 'C', text: 'To contrast it with ground-based observatories' }, { id: 'D', text: 'To explain the origin of a theory' }], correctAnswer: 'A', section: 'Listening', difficulty: 'hard', skill: 'Listening: Function' },
  ],
  'Academic English': [
    { id: 'ae1', text: 'Choose the correct form: "Neither the teacher nor the students ___ satisfied with the results."', options: [{ id: 'A', text: 'is' }, { id: 'B', text: 'are' }, { id: 'C', text: 'was being' }, { id: 'D', text: 'have been being' }], correctAnswer: 'B', section: 'Grammar', difficulty: 'medium', skill: 'Grammar: Subject-Verb Agreement' },
    { id: 'ae2', text: 'The word "ubiquitous" most nearly means:', options: [{ id: 'A', text: 'Rare' }, { id: 'B', text: 'Everywhere' }, { id: 'C', text: 'Dangerous' }, { id: 'D', text: 'Hidden' }], correctAnswer: 'B', section: 'Vocabulary', difficulty: 'easy', skill: 'Vocabulary: High-Frequency Words' },
  ],
  'Common Core Math': [
    { id: 'ccm1', text: 'Simplify: (x²y³)(x⁴y)', options: [{ id: 'A', text: 'x⁶y⁴' }, { id: 'B', text: 'x⁸y³' }, { id: 'C', text: 'x⁶y³' }, { id: 'D', text: 'x²y⁴' }], correctAnswer: 'A', section: 'Algebra', difficulty: 'easy', skill: 'Algebra: Exponent Rules' },
    { id: 'ccm2', text: 'What is the median of the following data set? 4, 7, 3, 9, 5, 8, 6', options: [{ id: 'A', text: '5' }, { id: 'B', text: '6' }, { id: 'C', text: '7' }, { id: 'D', text: '4' }], correctAnswer: 'B', section: 'Statistics', difficulty: 'easy', skill: 'Statistics: Measures of Center' },
  ],
};

function calculateResults(questions: DiagnosticQuestion[], answers: Record<string, string>, examType: ExamType): DiagnosticResult {
  const total = questions.length;
  const answered = questions.filter(q => answers[q.id]);
  const correct = answered.filter(q => answers[q.id] === q.correctAnswer).length;
  const totalCorrect = correct;
  const totalQuestions = total;

  const sectionMap = new Map<string, { correct: number; total: number }>();
  questions.forEach(q => {
    const sec = q.section;
    if (!sectionMap.has(sec)) sectionMap.set(sec, { correct: 0, total: 0 });
    const entry = sectionMap.get(sec)!;
    entry.total++;
    if (answers[q.id] === q.correctAnswer) entry.correct++;
  });

  const sectionScores = Array.from(sectionMap.entries()).map(([section, data]) => ({
    section,
    correct: data.correct,
    total: data.total,
    percent: Math.round((data.correct / data.total) * 100),
  }));

  const overallPercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const skillMap = new Map<string, { correct: number; total: number }>();
  questions.forEach(q => {
    if (!skillMap.has(q.skill)) skillMap.set(q.skill, { correct: 0, total: 0 });
    const entry = skillMap.get(q.skill)!;
    entry.total++;
    if (answers[q.id] === q.correctAnswer) entry.correct++;
  });

  const learningGaps = Array.from(skillMap.entries())
    .map(([skill, data]) => ({
      skill,
      score: Math.round((data.correct / data.total) * 100),
      priority: (data.correct / data.total) < 0.5 ? 'high' : (data.correct / data.total) < 0.75 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
    }))
    .sort((a, b) => a.score - b.score);

  const readiness = Math.min(100, overallPercent + 10);
  const masteryBaseline = Math.max(0, overallPercent - 5);

  const examScale: Record<string, [number, number, string]> = {
    SAT: [200, 800, 'SAT 1200-1600 range'],
    ACT: [1, 36, 'ACT 20-36 range'],
    IELTS: [0, 9, 'IELTS 5.0-9.0 band'],
    TOEFL: [0, 120, 'TOEFL 60-120 range'],
  };
  const [min, max, desc] = examScale[examType] || [0, 100, 'Percentage score'];
  const estimatedScore = Math.round(min + (overallPercent / 100) * (max - min));
  const estimatedPerformance = estimatedScore;

  const curriculumMap: Record<string, string> = {
    SAT: 'SAT Comprehensive Prep — Focus on Evidence-Based Reading and Advanced Math',
    ACT: 'ACT Accelerated Program — Emphasis on Science Reasoning and English Conventions',
    IELTS: 'IELTS Academic Track — Build Listening and Academic Writing Skills',
    TOEFL: 'TOEFL iBT Preparation — Strengthen Integrated Speaking and Academic Vocabulary',
    'Academic English': 'Academic English Foundations — Grammar and Academic Writing Intensive',
    'Common Core Math': 'Common Core Math Mastery — Algebra and Geometry Foundations',
  };

  return {
    readiness,
    recommendedCurriculum: curriculumMap[examType] || 'General Academic Preparation',
    masteryBaseline,
    estimatedPerformance,
    learningGaps,
    sectionScores,
    totalCorrect,
    totalQuestions,
  };
}

export default function DiagnosticPlatform({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState<Step>('select');
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examActive, setExamActive] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (!selectedExam) return [];
    return MOCK_QUESTIONS[selectedExam] || [];
  }, [selectedExam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setExamActive(false);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, timeRemaining]);

  function startExam() {
    if (!selectedExam) return;
    setQuestions(filteredQuestions);
    setCurrentIndex(0);
    setAnswers({});
    const durationMap: Record<string, number> = {
      SAT: 195, ACT: 175, IELTS: 165, TOEFL: 180, 'Academic English': 120, 'Common Core Math': 120,
    };
    setTimeRemaining((durationMap[selectedExam] || 120) * 60);
    setExamActive(true);
    setStep('exam');
  }

  function handleSelectAnswer(answerId: string) {
    if (!questions[currentIndex]) return;
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: answerId }));
  }

  function handleSubmit() {
    setExamActive(false);
    if (!selectedExam) return;
    const result = calculateResults(questions, answers, selectedExam);
    setResults(result);
    setStep('results');
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

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
              <h1 className="text-2xl font-bold">Diagnostic Platform</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">Identify your strengths and learning gaps</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['select', 'instructions', 'exam', 'results'] as Step[]).map((s, i) => {
            const stepIndex = ['select', 'instructions', 'exam', 'results'].indexOf(step);
            const isComplete = i < stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isComplete ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-[#C9A84C] text-[#1B2A4A]' :
                  'bg-gray-200 text-gray-400'
                }`}>{isComplete ? '✓' : i + 1}</div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-[#1B2A4A]' : 'text-gray-400'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                {i < 3 && <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        {/* Step: Select */}
        {step === 'select' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Select an Exam</h2>
            <p className="text-gray-500 text-sm mb-6">Choose the exam you want to practice for</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAM_TYPES.map((exam) => (
                <button
                  key={exam.type}
                  onClick={() => { setSelectedExam(exam.type); setStep('instructions'); }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md hover:border-[#C9A84C] transition-all duration-200 group"
                >
                  <span className="text-3xl">{exam.icon}</span>
                  <h3 className="font-bold text-gray-900 mt-3">{exam.type}</h3>
                  <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <span>⏱ {exam.duration}</span>
                    <span>•</span>
                    <span>{exam.sections.length} sections</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exam.sections.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{s}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Instructions */}
        {step === 'instructions' && selectedExam && (
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{EXAM_TYPES.find(e => e.type === selectedExam)?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedExam} Diagnostic</h2>
                  <p className="text-gray-500">{EXAM_TYPES.find(e => e.type === selectedExam)?.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#1B2A4A]">{filteredQuestions.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Questions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#1B2A4A]">{EXAM_TYPES.find(e => e.type === selectedExam)?.duration}</div>
                  <div className="text-xs text-gray-500 mt-1">Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#1B2A4A]">{EXAM_TYPES.find(e => e.type === selectedExam)?.sections.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Sections</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#1B2A4A]">Multiple Choice</div>
                  <div className="text-xs text-gray-500 mt-1">Format</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-amber-800 text-sm mb-2">📋 Rules</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Answer all questions to the best of your ability</li>
                  <li>• You cannot skip questions and return later (in this diagnostic)</li>
                  <li>• The timer will automatically submit when time expires</li>
                  <li>• Your results will show strengths, weaknesses, and study recommendations</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={startExam} className="px-8 py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a] transition-colors">
                  Start Diagnostic
                </button>
                <button onClick={() => setStep('select')} className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium">
                  Change Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Exam */}
        {step === 'exam' && (
          <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-t-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Q{currentIndex + 1} of {questions.length}</span>
                {currentQ && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[currentQ.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                    {currentQ.difficulty}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                  ⏱ {formatTime(timeRemaining)}
                </div>
                <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  Submit All
                </button>
              </div>
            </div>
            <div className="h-1 bg-gray-200">
              <div className="h-full bg-[#C9A84C] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {currentQ && (
              <div className="bg-white border-x border-b border-gray-100 shadow-sm rounded-b-xl p-6">
                {/* Passage */}
                {currentQ.passage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border text-sm leading-relaxed italic text-gray-600">
                    {currentQ.passage}
                  </div>
                )}

                {/* Question */}
                <div className="text-base font-medium text-gray-900 mb-6 leading-relaxed">
                  {currentQ.text}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(opt.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                            : 'border-gray-200 hover:border-[#C9A84C]/50 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-bold mr-3 ${isSelected ? 'text-[#C9A84C]' : 'text-gray-400'}`}>{opt.id}</span>
                        <span className={isSelected ? 'text-[#1B2A4A]' : 'text-gray-700'}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    {Object.keys(answers).length} of {questions.length} answered
                  </span>
                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(i => i + 1)}
                      className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243555]"
                    >
                      Next →
                    </button>
                  ) : (
                    <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium">
                      Submit & See Results
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && results && (
          <div>
            {/* Score Overview */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Diagnostic Complete!</h2>
              <p className="text-gray-500">Here&apos;s your {selectedExam} readiness assessment</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-bold text-[#1B2A4A]">{results.readiness}%</div>
                <div className="text-xs text-gray-500 mt-1">Readiness</div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${results.readiness}%` }} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-bold text-[#1B2A4A]">{results.masteryBaseline}%</div>
                <div className="text-xs text-gray-500 mt-1">Mastery Baseline</div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${results.masteryBaseline}%` }} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-bold text-[#C9A84C]">{results.estimatedPerformance}</div>
                <div className="text-xs text-gray-500 mt-1">Estimated Score</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl font-bold text-gray-900">{results.totalCorrect}/{results.totalQuestions}</div>
                <div className="text-xs text-gray-500 mt-1">Correct</div>
              </div>
            </div>

            {/* Section Scores */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Section Breakdown</h3>
              <div className="space-y-3">
                {results.sectionScores.map((sec, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{sec.section}</span>
                      <span className="text-gray-500">{sec.correct}/{sec.total} ({sec.percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${
                        sec.percent >= 80 ? 'bg-green-500' : sec.percent >= 60 ? 'bg-[#C9A84C]' : 'bg-red-500'
                      }`} style={{ width: `${sec.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Gaps */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Learning Gaps & Recommendations</h3>
              <div className="space-y-3">
                {results.learningGaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        gap.priority === 'high' ? 'bg-red-500' : gap.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <span className="text-sm font-medium text-gray-700">{gap.skill}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          gap.priority === 'high' ? 'bg-red-100 text-red-600' : gap.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        }`}>{gap.priority}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{gap.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Curriculum */}
            <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d6a] rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📖</span>
                <div>
                  <h3 className="font-bold text-white mb-1">Recommended Curriculum</h3>
                  <p className="text-[#C9A84C] text-sm">{results.recommendedCurriculum}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep('select'); setResults(null); }} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                Take Another Diagnostic
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6 py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a]">
                Start Recommended Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}