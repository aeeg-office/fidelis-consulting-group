'use client';

import React, { useState, useEffect, useRef } from 'react';

type RubricCategory = 'fluency' | 'grammar' | 'vocabulary' | 'pronunciation' | 'coherence';
type RecordingStatus = 'idle' | 'testing' | 'recording' | 'stopped' | 'submitted';
type TeacherReviewStatus = 'pending' | 'reviewed' | 'approved';

interface RubricScore {
  category: RubricCategory;
  label: string;
  score: number;
  maxScore: number;
  description: string;
}

interface SpeakingResult {
  transcription: string;
  rubricScores: RubricScore[];
  estimatedScore: number;
  maxScore: number;
  feedback: string;
  reviewStatus: TeacherReviewStatus;
}

const RUBRIC_CONFIG: { category: RubricCategory; label: string; description: string }[] = [
  { category: 'fluency', label: 'Fluency', description: 'Flow, rhythm, and natural pace of speech' },
  { category: 'grammar', label: 'Grammar', description: 'Accuracy of grammatical structures' },
  { category: 'vocabulary', label: 'Vocabulary', description: 'Range and appropriateness of word choice' },
  { category: 'pronunciation', label: 'Pronunciation', description: 'Clarity of articulation and intonation' },
  { category: 'coherence', label: 'Coherence', description: 'Logical organization of ideas' },
];

const PROMPTS = [
  'Describe a memorable experience from your childhood and explain how it shaped who you are today.',
  'Discuss the advantages and disadvantages of social media in modern society.',
  'Explain a skill you have learned recently and describe the process of learning it.',
  'What is your opinion on the role of technology in education? Support your view with examples.',
];

export default function SpeakingPlatform({ onBack }: { onBack?: () => void }) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micTestResult, setMicTestResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [result, setResult] = useState<SpeakingResult | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState(-1);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'recording' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { stopRecording(); return 0; }
          return prev - 1;
        });
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, timeRemaining]);

  async function testMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicTestResult('success');
      stream.getTracks().forEach(t => t.stop());
    } catch {
      setMicTestResult('fail');
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      mediaRecorder.current = recorder;
      setStatus('recording');
      setTimeRemaining(60);
      setRecordingTime(0);
    } catch {
      alert('Microphone access is required for speaking assessment.');
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStatus('stopped');
  }

  function handleSubmit() {
    setStatus('submitted');

    const scores: RubricScore[] = RUBRIC_CONFIG.map((rc, i) => ({
      category: rc.category,
      label: rc.label,
      score: Math.floor(5 + Math.random() * 4),
      maxScore: 10,
      description: rc.description,
    }));

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    setResult({
      transcription: 'I believe that technology in education has transformed how we learn in profound ways. For example, online platforms allow students to access resources that were previously unavailable. However, it is important to maintain a balance between digital and traditional learning methods to ensure students develop comprehensive skills.',
      rubricScores: scores,
      estimatedScore: Math.round((totalScore / 50) * 100),
      maxScore: 100,
      feedback: 'Your response was well-organized with clear main ideas and supporting examples. Work on varying your vocabulary to include more academic terms. Your grammar was generally accurate, with minor errors in article usage. Consider adding more transitional phrases to improve coherence between your main points.',
      reviewStatus: 'pending',
    });
  }

  function handleRetry() {
    setStatus('idle');
    setResult(null);
    setSelectedPrompt(-1);
    setMicTestResult('idle');
  }

  function formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  const prompt = currentPrompt || PROMPTS[0];

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
              <h1 className="text-2xl font-bold">Speaking Platform</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">AI-powered speaking assessment and practice</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {status === 'idle' && (
          <div>
            {/* Prompt Selection */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Select a Speaking Prompt</h2>
              <div className="space-y-2">
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => { setSelectedPrompt(i); setCurrentPrompt(p); }}
                    className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${
                      selectedPrompt === i ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-200 hover:border-[#C9A84C]/50'
                    }`}>
                    <span className={`font-bold mr-2 ${selectedPrompt === i ? 'text-[#C9A84C]' : 'text-gray-400'}`}>{i + 1}.</span>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic Test */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">🎤 Microphone Test</h2>
              <p className="text-sm text-gray-500 mb-4">Make sure your microphone is working before you start recording.</p>
              <button onClick={testMicrophone} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Test Microphone
              </button>
              {micTestResult === 'success' && <span className="ml-3 text-sm text-green-600 font-medium">✅ Microphone working</span>}
              {micTestResult === 'fail' && <span className="ml-3 text-sm text-red-600 font-medium">❌ Microphone not detected. Check your settings.</span>}
            </div>

            {/* Start Recording */}
            <button onClick={startRecording} disabled={selectedPrompt === -1}
              className="w-full py-4 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-xl hover:bg-[#d4b85a] transition-colors text-lg disabled:opacity-30">
              🎤 Start Recording
            </button>
          </div>
        )}

        {status === 'recording' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="animate-pulse mb-4">
              <span className="text-6xl">🔴</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recording...</h2>
            <p className="text-gray-500 text-sm mb-6">Speak clearly and at a natural pace</p>

            <div className="max-w-lg mx-auto p-4 bg-gray-50 rounded-lg mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{formatTime(timeRemaining)}</div>
                <div className="text-xs text-gray-500 mt-1">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{formatTime(recordingTime)}</div>
                <div className="text-xs text-gray-500 mt-1">Recorded</div>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto mb-6 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${((60 - timeRemaining) / 60) * 100}%` }} />
            </div>

            <button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
              ⏹ Stop Recording
            </button>
          </div>
        )}

        {status === 'stopped' && !result && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <span className="text-5xl mb-4">⏹️</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recording Complete</h2>
            <p className="text-gray-500 text-sm mb-2">You recorded for {formatTime(recordingTime)}</p>
            <p className="text-gray-400 text-xs mb-6">Click submit to analyze your response, or re-record.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={startRecording} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                Re-record
              </button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a]">
                Submit for Analysis
              </button>
            </div>
          </div>
        )}

        {result && (
          <div>
            {/* Transcription */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">📝 AI Transcription</h2>
              <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 leading-relaxed">
                {result.transcription}
              </div>
            </div>

            {/* Rubric Scores */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Rubric Scores</h2>
              <div className="space-y-4">
                {result.rubricScores.map((rs) => (
                  <div key={rs.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{rs.label}</span>
                        <span className="text-xs text-gray-400 ml-2">{rs.description}</span>
                      </div>
                      <span className="text-sm font-bold">{rs.score}/{rs.maxScore}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${
                        rs.score >= 8 ? 'bg-green-500' : rs.score >= 6 ? 'bg-[#C9A84C]' : 'bg-red-500'
                      }`} style={{ width: `${(rs.score / rs.maxScore) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Score */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Estimated Exam Score</h2>
                  <p className="text-xs text-gray-500 mt-1">Based on AI analysis of your response</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C9A84C]">{result.estimatedScore}%</div>
                  <div className="text-xs text-gray-400">out of {result.maxScore}</div>
                </div>
              </div>
              <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: `${result.estimatedScore}%` }} />
              </div>
            </div>

            {/* AI Feedback */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">💡 AI Feedback</h3>
              <p className="text-sm text-blue-700 leading-relaxed">{result.feedback}</p>
            </div>

            {/* Teacher Review Status */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Teacher Review</h2>
                  <p className="text-xs text-gray-500 mt-1">Status of your submission</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  result.reviewStatus === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {result.reviewStatus === 'approved' ? '✅ Approved' :
                   result.reviewStatus === 'reviewed' ? '📋 Reviewed' : '⏳ Pending Review'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button onClick={handleRetry} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                New Recording
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}