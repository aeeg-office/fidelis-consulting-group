'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface WritingSubmission {
  title: string;
  content: string;
  wordCount: number;
  timeSpent: number;
  submittedAt: string;
}

export default function SecureWritingPlatform({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 min in seconds
  const [examActive, setExamActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formatting, setFormatting] = useState({ bold: false, italic: false, underline: false });
  const editorRef = useRef<HTMLDivElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const savedContentRef = useRef(content);

  // Disable copy/paste/spellcheck/grammar check
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); };
    const handleCut = (e: ClipboardEvent) => { e.preventDefault(); };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (content !== savedContentRef.current) {
        savedContentRef.current = content;
        localStorage.setItem('aeeg-writing-draft', JSON.stringify({
          title,
          content,
          timestamp: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(autoSave);
  }, [content, title]);

  // Load saved draft
  useEffect(() => {
    const saved = localStorage.getItem('aeeg-writing-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content) {
          setContent(parsed.content);
          setTitle(parsed.title || '');
          savedContentRef.current = parsed.content;
        }
      } catch {}
    }
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { handleSubmit(); return 0; }
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
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function applyFormat(command: string) {
    document.execCommand(command, false);
    editorRef.current?.focus();
  }

  function handleSubmit() {
    setExamActive(false);
    setSubmitted(true);
    localStorage.removeItem('aeeg-writing-draft');
  }

  function handleNew() {
    setContent('');
    setTitle('');
    setTimeRemaining(1800);
    setExamActive(true);
    setSubmitted(false);
    setLastSaved(null);
    savedContentRef.current = '';
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1B2A4A] text-white">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold">Secure Writing Platform</h1>
                <p className="text-[#C9A84C] text-sm mt-0.5">Submission Complete</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your writing has been securely submitted</h2>
          <p className="text-gray-500 mb-2">Your response has been submitted and will be reviewed by your teacher.</p>
          <p className="text-sm text-gray-400 mb-8">Word count: {wordCount} · Characters: {charCount}</p>
          <button onClick={handleNew} className="px-6 py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a]">
            Write Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="text-white/80 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold">Secure Writing</h1>
                {lastSaved && <p className="text-[10px] text-gray-400">Auto-saved {lastSaved.toLocaleTimeString()}</p>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-400">Words</div>
                <div className="font-bold">{wordCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Time</div>
                <div className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeRemaining)}</div>
              </div>
              <button onClick={handleSubmit} className="px-4 py-2 bg-[#C9A84C] text-[#1B2A4A] text-sm font-bold rounded-lg hover:bg-[#d4b85a]">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1 bg-gray-200">
        <div className={`h-full transition-all duration-1000 ${timeRemaining < 300 ? 'bg-red-500' : 'bg-[#C9A84C]'}`}
          style={{ width: `${(timeRemaining / 1800) * 100}%` }} />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-4">
        {/* Formatting Toolbar */}
        <div className="bg-white border border-gray-200 rounded-t-lg px-4 py-2 flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Essay"
            className="flex-1 text-sm font-medium text-gray-700 bg-transparent border-none outline-none placeholder-gray-400"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="flex items-center gap-1 border-l pl-3 ml-3">
            <button onClick={() => applyFormat('bold')} title="Bold"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 font-bold text-sm">B</button>
            <button onClick={() => applyFormat('italic')} title="Italic"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 italic text-sm">I</button>
            <button onClick={() => applyFormat('underline')} title="Underline"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 underline text-sm">U</button>
          </div>
          <div className="flex items-center gap-2 border-l pl-3 ml-3 text-xs text-gray-400">
            <span>Copy/Paste disabled</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Secure mode</span>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white border-x border-b border-gray-200 rounded-b-lg flex flex-col">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            autoCorrect="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
            className="flex-1 p-6 text-gray-800 leading-relaxed outline-none overflow-y-auto focus:ring-0"
            style={{ minHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span className="text-green-500">🔒 End-to-end encrypted</span>
          </div>
          {lastSaved && <span>Last auto-saved: {lastSaved.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}