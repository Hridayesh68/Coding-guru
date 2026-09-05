import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Code, Sparkles } from 'lucide-react';

export default function CodeEditor({ code, onChange, language, onLanguageChange, onReset }) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="editor-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Editor Top Bar */}
      <div className="editor-header" style={{ padding: '0.65rem 1rem', background: '#111726', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.825rem', fontWeight: 600 }}>
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
              background: '#0d1117',
              borderColor: '#30363d',
              width: 'auto',
              borderRadius: '6px',
              fontWeight: 600,
              color: '#38bdf8'
            }}
          >
            <option value="javascript">JavaScript (Node.js v20)</option>
            <option value="python">Python (v3.12)</option>
            <option value="cpp">C++ (GCC 13.1 C++17)</option>
            <option value="java">Java (OpenJDK 21)</option>
          </select>

          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', fontSize: '0.7rem' }}>
            <Sparkles size={11} />
            Monaco VS Code Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
      <div style={{ height: '430px', background: '#1e1e1e' }}>
        <Editor
          height="100%"
          language={monacoLanguageMap[language] || 'javascript'}
          value={code}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
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
