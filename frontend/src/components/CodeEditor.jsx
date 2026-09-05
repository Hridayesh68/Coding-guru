import React, { useRef, useEffect } from 'react';
import { RotateCcw, Copy, Check, Code, Settings } from 'lucide-react';

export default function CodeEditor({ code, onChange, language, onLanguageChange, onReset }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  // Compute line numbers
  const lines = (code || '').split('\n');
  const lineCount = Math.max(lines.length, 18);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const updatedCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(updatedCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editor-container">
      {/* Editor Top Bar */}
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Code size={16} />
            Language:
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="form-select"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.8rem',
              background: '#0d1117',
              borderColor: '#30363d',
              width: 'auto',
              borderRadius: '6px'
            }}
          >
            <option value="javascript">JavaScript (Node.js v20)</option>
            <option value="python">Python (3.12)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            title="Copy Code"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            title="Reset to starter template"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="editor-body">
        <div className="editor-line-numbers">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="editor-textarea"
          placeholder="// Type your solution here..."
        />
      </div>
    </div>
  );
}
