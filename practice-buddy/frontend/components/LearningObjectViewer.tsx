'use client';

import React, { useState } from 'react';

interface LearningObject {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  skills: string[];
  lessonContent: string;
  workedExamples: { title: string; problem: string; solution: string; steps: string[] }[];
  guidedExamples: { prompt: string; hint: string; solution: string }[];
  practiceQuestions: { id: string; text: string; options: { id: string; text: string }[]; correctAnswer: string; explanation: string }[];
  commonMisconceptions: { misconception: string; correction: string }[];
  teacherNotes: string;
  parentNotes: string;
  extensionActivities: { title: string; description: string; difficulty: string }[];
}

const MOCK_LO: LearningObject = {
  id: 'lo-1',
  title: 'Solving Systems of Linear Equations',
  subject: 'Common Core Math',
  grade: 'Grade 9-10',
  duration: '45 min',
  skills: ['Algebra', 'Systems of Equations', 'Linear Functions'],
  lessonContent: `## Solving Systems of Linear Equations

A system of linear equations consists of two or more linear equations that share variables. The solution to a system is the point (or points) where all equations intersect — meaning the values that satisfy every equation simultaneously.

### Key Concepts

1. **Graphical Method**: Plot each equation on the same coordinate plane. The intersection point is the solution.
2. **Substitution Method**: Solve one equation for a variable, then substitute that expression into the other equation.
3. **Elimination Method**: Add or subtract equations to eliminate a variable, then solve for the remaining variable.

### When to Use Each Method

- **Graphing**: Best for visualizing the system or when approximate solutions are acceptable.
- **Substitution**: Ideal when one equation is already solved for a variable (e.g., y = 2x + 3).
- **Elimination**: Efficient when coefficients align well for addition/subtraction (e.g., 2x + 3y = 7 and 2x - y = 3).

### Types of Solutions

- **One Solution**: Lines intersect at exactly one point (different slopes).
- **No Solution**: Lines are parallel (same slope, different intercepts).
- **Infinite Solutions**: Lines are identical (same slope and intercept).`,
  workedExamples: [
    {
      title: 'Solving by Substitution',
      problem: 'Solve the system: y = 2x + 1 and 3x + 2y = 16',
      solution: 'The solution is (2, 5)',
      steps: [
        'Step 1: Equation 1 gives us y = 2x + 1. This expression for y can be substituted into Equation 2.',
        'Step 2: Substitute y = 2x + 1 into 3x + 2y = 16: 3x + 2(2x + 1) = 16',
        'Step 3: Expand: 3x + 4x + 2 = 16',
        'Step 4: Combine like terms: 7x + 2 = 16',
        'Step 5: Subtract 2 from both sides: 7x = 14',
        'Step 6: Divide by 7: x = 2',
        'Step 7: Substitute x = 2 back into y = 2x + 1: y = 2(2) + 1 = 5',
        'Step 8: The solution is x = 2, y = 5, or (2, 5). Check: 3(2) + 2(5) = 6 + 10 = 16 ✓',
      ],
    },
    {
      title: 'Solving by Elimination',
      problem: 'Solve the system: 2x + 3y = 12 and 4x - 3y = 6',
      solution: 'The solution is (3, 2)',
      steps: [
        'Step 1: Notice the y coefficients are opposites (3 and -3). This makes elimination ideal.',
        'Step 2: Add the equations: (2x + 3y) + (4x - 3y) = 12 + 6',
        'Step 3: The y terms cancel: 6x = 18',
        'Step 4: Divide by 6: x = 3',
        'Step 5: Substitute x = 3 into 2x + 3y = 12: 2(3) + 3y = 12',
        'Step 6: Simplify: 6 + 3y = 12',
        'Step 7: Subtract 6: 3y = 6',
        'Step 8: Divide by 3: y = 2',
        'Step 9: The solution is (3, 2). Check: 4(3) - 3(2) = 12 - 6 = 6 ✓',
      ],
    },
  ],
  guidedExamples: [
    {
      prompt: 'Solve the system: y = 3x - 2 and 2x + y = 18',
      hint: 'Start by substituting y = 3x - 2 into the second equation.',
      solution: 'Substitute: 2x + (3x - 2) = 18 → 5x - 2 = 18 → 5x = 20 → x = 4. Then y = 3(4) - 2 = 10. Solution: (4, 10)',
    },
    {
      prompt: 'Solve the system: 3x + 2y = 14 and x - y = 3',
      hint: 'Solve the second equation for x (x = y + 3), then substitute into the first equation.',
      solution: 'x = y + 3. Substitute: 3(y + 3) + 2y = 14 → 3y + 9 + 2y = 14 → 5y = 5 → y = 1. Then x = 1 + 3 = 4. Solution: (4, 1)',
    },
  ],
  practiceQuestions: [
    { id: 'pq1', text: 'Solve the system: y = 4x and x + y = 25', options: [{ id: 'A', text: '(5, 20)' }, { id: 'B', text: '(20, 5)' }, { id: 'C', text: '(4, 16)' }, { id: 'D', text: '(6, 24)' }], correctAnswer: 'A', explanation: 'Substitute y = 4x into x + y = 25: x + 4x = 25 → 5x = 25 → x = 5. Then y = 4(5) = 20. Solution: (5, 20)' },
    { id: 'pq2', text: 'What is the solution to the system: 2x + y = 10 and x - y = 2?', options: [{ id: 'A', text: '(4, 2)' }, { id: 'B', text: '(2, 6)' }, { id: 'C', text: '(6, -2)' }, { id: 'D', text: '(3, 4)' }], correctAnswer: 'A', explanation: 'Add equations: (2x + y) + (x - y) = 10 + 2 → 3x = 12 → x = 4. Substitute: 2(4) + y = 10 → y = 2. Solution: (4, 2)' },
    { id: 'pq3', text: 'How many solutions does the system y = 2x + 1 and y = 2x - 3 have?', options: [{ id: 'A', text: 'None (no solution)' }, { id: 'B', text: 'Exactly one' }, { id: 'C', text: 'Infinite' }, { id: 'D', text: 'Two' }], correctAnswer: 'A', explanation: 'Both lines have slope 2 but different y-intercepts (1 and -3), so they are parallel and never intersect. No solution.' },
  ],
  commonMisconceptions: [
    { misconception: 'When using elimination, students often forget to multiply the ENTIRE equation when scaling coefficients.', correction: 'Always multiply every term on both sides of the equation. For example, to eliminate y in 2x + 3y = 7 and x - 2y = 5, multiply the first equation by 2 and the second by 3: 4x + 6y = 14 and 3x - 6y = 15. Both sides are scaled equally.' },
    { misconception: 'Students think parallel lines always mean no solution, but coincident lines (identical equations) have infinite solutions.', correction: 'Check if the second equation is a multiple of the first. For example, y = 2x + 3 and 2y = 4x + 6 are actually the same line (second is first × 2). This means every point on the line is a solution — infinite solutions.' },
    { misconception: 'After finding one variable, students forget to substitute back to find the other variable.', correction: 'Always substitute the value you found back into one of the ORIGINAL equations to find the other variable. A solution to a system always has BOTH coordinates.' },
  ],
  teacherNotes: 'This lesson builds on prior knowledge of linear equations (slope-intercept form). Students should already be comfortable graphing lines and solving simple equations. Key vocabulary: system of equations, substitution, elimination, intersection, solution. Common pitfalls: arithmetic errors when combining like terms, forgetting to distribute the negative sign, and checking only one equation. Use the worked examples as whole-class instruction, then have students work through guided examples in pairs. The practice questions can be used as an exit ticket or homework assignment.',
  parentNotes: 'Your child is learning how to solve systems of linear equations — finding where two lines cross on a graph. There are three main methods: graphing (drawing the lines), substitution (replacing a variable), and elimination (adding equations together). Encourage your child to choose the method that feels most natural, though some problems are easier with a specific method. Real-world applications include comparing costs of phone plans, finding break-even points for businesses, and calculating mixing ratios. Ask your child to explain each step as they solve — teaching someone else is the best way to learn!',
  extensionActivities: [
    { title: 'Real-World Systems', description: 'Research and write a word problem that can be solved with a system of equations. Include the solution and explain what it means in context.', difficulty: 'Medium' },
    { title: 'Three-Variable Systems', description: 'Extend your knowledge to systems with three variables (x, y, z). Research how to solve 3×3 systems using elimination.', difficulty: 'Hard' },
    { title: 'System of Inequalities', description: 'Learn how to graph a system of linear inequalities and shade the feasible region where all conditions are satisfied.', difficulty: 'Medium' },
    { title: 'Matrix Representation', description: 'Explore how systems of equations can be represented as matrices and solved using row operations (Gaussian elimination).', difficulty: 'Hard' },
  ],
};

type Tab = 'lesson' | 'worked' | 'guided' | 'practice' | 'misconceptions' | 'teacher' | 'parent' | 'extension';

export default function LearningObjectViewer({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('lesson');
  const [lo] = useState<LearningObject>(MOCK_LO);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<string, boolean>>({});
  const [guidedRevealed, setGuidedRevealed] = useState<Record<number, boolean>>({});

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'lesson', label: 'Lesson', icon: '📖' },
    { id: 'worked', label: 'Worked Examples', icon: '✏️' },
    { id: 'guided', label: 'Guided Examples', icon: '🤝' },
    { id: 'practice', label: 'Practice', icon: '📝' },
    { id: 'misconceptions', label: 'Misconceptions', icon: '⚠️' },
    { id: 'teacher', label: 'Teacher Notes', icon: '👩‍🏫' },
    { id: 'parent', label: 'Parent Notes', icon: '👪' },
    { id: 'extension', label: 'Extension', icon: '🚀' },
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{lo.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-[#C9A84C]">
                <span>{lo.subject}</span>
                <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                <span>{lo.grade}</span>
                <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                <span>⏱ {lo.duration}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {lo.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-white/10 text-white text-[10px] rounded">{s}</span>
                ))}
              </div>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Lesson Content */}
        {activeTab === 'lesson' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="prose prose-sm max-w-none">
              {lo.lessonContent.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith('- **')) {
                  const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                  if (match) return <p key={i} className="text-gray-700 ml-4 mb-1"><strong className="text-[#1B2A4A]">{match[1]}:</strong> {match[2]}</p>;
                }
                if (line.startsWith('- ')) return <li key={i} className="text-gray-700 ml-4 mb-1">{line.slice(2)}</li>;
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}

        {/* Worked Examples */}
        {activeTab === 'worked' && (
          <div className="space-y-6">
            {lo.workedExamples.map((we, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{we.title}</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-500">Problem:</span>
                  <p className="text-gray-800 mt-1">{we.problem}</p>
                </div>
                <div className="space-y-2">
                  {we.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{j + 1}</span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guided Examples */}
        {activeTab === 'guided' && (
          <div className="space-y-6">
            {lo.guidedExamples.map((ge, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">Guided Example {i + 1}</h3>
                <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
                  <span className="text-sm font-semibold text-amber-700">Try It:</span>
                  <p className="text-amber-900 mt-1">{ge.prompt}</p>
                </div>
                {!guidedRevealed[i] ? (
                  <button onClick={() => setGuidedRevealed(prev => ({ ...prev, [i]: true }))}
                    className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                    Show Hint
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700">💡 Hint:</span>
                      <p className="text-blue-800 mt-1">{ge.hint}</p>
                    </div>
                    <button onClick={() => setGuidedRevealed(prev => ({ ...prev, [i]: false }))}
                      className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg text-sm hover:bg-[#d4b85a]">
                      Show Solution
                    </button>
                    {!guidedRevealed[i] && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <span className="text-sm font-semibold text-green-700">✅ Solution:</span>
                        <p className="text-green-800 mt-1">{ge.solution}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Practice Questions */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {lo.practiceQuestions.map((pq, i) => {
              const isSubmitted = practiceSubmitted[pq.id];
              const selected = practiceAnswers[pq.id];
              const isCorrect = isSubmitted && selected === pq.correctAnswer;
              return (
                <div key={pq.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-gray-900 font-medium mt-0.5">{pq.text}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {pq.options.map(opt => {
                      const isSelected = selected === opt.id;
                      let optClass = 'border-gray-200 hover:border-[#C9A84C]/50';
                      if (isSubmitted && opt.id === pq.correctAnswer) optClass = 'border-green-500 bg-green-50';
                      else if (isSubmitted && isSelected && !isCorrect) optClass = 'border-red-500 bg-red-50';
                      else if (isSelected) optClass = 'border-[#C9A84C] bg-[#C9A84C]/5';
                      return (
                        <button key={opt.id} onClick={() => { if (!isSubmitted) setPracticeAnswers(prev => ({ ...prev, [pq.id]: opt.id })); }}
                          className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${optClass}`}>
                          <span className="font-bold mr-2">{opt.id}.</span> {opt.text}
                        </button>
                      );
                    })}
                  </div>
                  {!isSubmitted ? (
                    <button onClick={() => setPracticeSubmitted(prev => ({ ...prev, [pq.id]: true }))}
                      disabled={!selected}
                      className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243555] disabled:opacity-30">
                      Check Answer
                    </button>
                  ) : (
                    <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <span className="font-semibold">{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</span>
                      <p className="mt-1">{pq.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Common Misconceptions */}
        {activeTab === 'misconceptions' && (
          <div className="space-y-4">
            {lo.commonMisconceptions.map((cm, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">❌</span>
                    <div>
                      <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Misconception</span>
                      <p className="text-gray-800 mt-1">{cm.misconception}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <div>
                      <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">Correction</span>
                      <p className="text-gray-800 mt-1">{cm.correction}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Teacher Notes */}
        {activeTab === 'teacher' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👩‍🏫</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Teacher Notes</h2>
                <p className="text-sm text-gray-500">Instructional guidance for this learning object</p>
              </div>
            </div>
            <div className="prose-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {lo.teacherNotes}
            </div>
          </div>
        )}

        {/* Parent Notes */}
        {activeTab === 'parent' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👪</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Parent Notes</h2>
                <p className="text-sm text-gray-500">How to support your child&apos;s learning</p>
              </div>
            </div>
            <div className="prose-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {lo.parentNotes}
            </div>
          </div>
        )}

        {/* Extension Activities */}
        {activeTab === 'extension' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Extension Activities</h2>
              <p className="text-sm text-gray-500">Challenge yourself beyond the standard curriculum</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lo.extensionActivities.map((ea, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{ea.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      ea.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>{ea.difficulty}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{ea.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}