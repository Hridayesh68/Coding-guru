import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Code, Sparkles, Sun, Moon } from 'lucide-react';

export default function CodeEditor({ code, onChange, language, onLanguageChange, onReset }) {
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark'); // 'vs-dark' | 'light'

  // Map our language key to Monaco editor language
  const monacoLanguageMap = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'cpp',
    java: 'java'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTheme = () => {
    setEditorTheme((prev) => (prev === 'vs-dark' ? 'light' : 'vs-dark'));
  };

  return (
    <div className="editor-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Editor Top Bar */}
      <div className="editor-header" style={{ padding: '0.65rem 1rem', background: '#17100d', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c76f51', fontSize: '0.825rem', fontWeight: 600 }}>
            <Code size={16} />
            Language:
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="form-select"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.8rem',
              background: '#0e0907',
              borderColor: '#3d2820',
              width: 'auto',
              borderRadius: '6px',
              fontWeight: 600,
              color: '#e59866'
            }}
          >
            <option value="javascript">JavaScript (Node.js v20)</option>
            <option value="python">Python (v3.12)</option>
            <option value="cpp">C++ (GCC 13.1 C++17)</option>
            <option value="java">Java (OpenJDK 21)</option>
          </select>

          <span className="badge" style={{ background: 'rgba(94, 49, 34, 0.35)', color: '#d1beaf', fontSize: '0.7rem', border: '1px solid rgba(199, 111, 81, 0.3)' }}>
            <Sparkles size={11} color="#c76f51" />
            Monaco Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              background: editorTheme === 'light' ? '#ffffff' : '#261a15',
              color: editorTheme === 'light' ? '#17100d' : '#fbf7f4',
              borderColor: editorTheme === 'light' ? '#c76f51' : '#3d2820'
            }}
            title={editorTheme === 'vs-dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {editorTheme === 'vs-dark' ? (
              <>
                <Sun size={14} color="#f59e0b" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={14} color="#5E3122" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
            title="Copy Code"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
            title="Reset to starter template"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ height: '430px', background: editorTheme === 'vs-dark' ? '#140d0a' : '#ffffff' }}>
        <Editor
          height="100%"
          language={monacoLanguageMap[language] || 'javascript'}
          value={code}
          onChange={(val) => onChange(val || '')}
          theme={editorTheme}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            bracketPairColorization: { enabled: true },
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 12, bottom: 12 }
          }}
          loading={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Loading Monaco Editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
