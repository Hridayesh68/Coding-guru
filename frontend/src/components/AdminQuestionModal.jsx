import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Shield, Sparkles, HelpCircle, Code } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminQuestionModal({ isOpen, onClose, questionToEdit, onSaved }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tags, setTags] = useState('Array, Math');
  const [description, setDescription] = useState('');
  const [jsCode, setJsCode] = useState('function solve(input) {\n  // Write solution here\n  return input;\n}');
  const [pyCode, setPyCode] = useState('def solve(input):\n    # Write solution here\n    return input');
  const [cppCode, setCppCode] = useState('#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    \n}');
  const [javaCode, setJavaCode] = useState('import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write solution here\n    }\n}');
  const [activeCodeLang, setActiveCodeLang] = useState('javascript');
  
  // AI Generation Mode State
  const [aiIdea, setAiIdea] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);
  
  // Exactly 10 test cases
  const [testCases, setTestCases] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      input: `{"val": ${i + 1}}`,
      expectedOutput: `${i + 1}`,
      isHidden: i >= 4,
      explanation: `Test case ${i + 1}`
    }))
  );

  const [activeTabCase, setActiveTabCase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle AI Question Generation
  const handleGenerateWithAi = async () => {
    if (!aiIdea.trim()) {
      setError('Please provide a question idea or prompt for the AI to generate.');
      return;
    }

    setAiGenerating(true);
    setError('');
    setAiNotice(null);

    try {
      const res = await api.generateQuestionWithAi(aiIdea, difficulty);
      if (res.success && res.question) {
        const q = res.question;
        if (q.title) setTitle(q.title);
        if (q.difficulty) setDifficulty(q.difficulty);
        if (q.tags) setTags(q.tags);
        if (q.description) setDescription(q.description);
        
        if (q.starterCode) {
          if (q.starterCode.javascript) setJsCode(q.starterCode.javascript);
          if (q.starterCode.python) setPyCode(q.starterCode.python);
          if (q.starterCode.cpp) setCppCode(q.starterCode.cpp);
          if (q.starterCode.java) setJavaCode(q.starterCode.java);
        }

        if (Array.isArray(q.testCases) && q.testCases.length === 10) {
          setTestCases(q.testCases);
        }

        setAiNotice({
          type: 'success',
          text: `✨ Question generated with 10 test cases and CP boilerplate via ${res.provider}!`
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate question with AI. Please check your AI API keys.');
    } finally {
      setAiGenerating(false);
    }
  };

  useEffect(() => {
    if (questionToEdit) {
      setTitle(questionToEdit.title || '');
      setDifficulty(questionToEdit.difficulty || 'Easy');
      setTags(Array.isArray(questionToEdit.tags) ? questionToEdit.tags.join(', ') : (questionToEdit.tags || ''));
      setDescription(questionToEdit.description || '');
      setJsCode(questionToEdit.starterCode?.javascript || '');
      setPyCode(questionToEdit.starterCode?.python || '');
      setCppCode(questionToEdit.starterCode?.cpp || '#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    \n}');
      setJavaCode(questionToEdit.starterCode?.java || 'import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write solution\n    }\n}');
      if (Array.isArray(questionToEdit.testCases) && questionToEdit.testCases.length === 10) {
        setTestCases(questionToEdit.testCases);
      }
    }
  }, [questionToEdit]);

  if (!isOpen) return null;

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleAutoPopulate = () => {
    setTestCases(
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        input: `{"input": ${i + 1}}`,
        expectedOutput: `${(i + 1) * 2}`,
        isHidden: i >= 3,
        explanation: `Evaluation case #${i + 1}`
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate 10 test cases
    if (testCases.length < 10) {
      setError('A coding question must contain 10 test cases.');
      return;
    }

    for (let i = 0; i < 10; i++) {
      if (!testCases[i].input.trim() || !testCases[i].expectedOutput.trim()) {
        setError(`Test case #${i + 1} has missing Input or Expected Output.`);
        setActiveTabCase(i + 1);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title,
        difficulty,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        description,
        starterCode: {
          javascript: jsCode,
          python: pyCode,
          cpp: cppCode,
          java: javaCode
        },
        testCases
      };

      if (questionToEdit) {
        await api.updateQuestion(questionToEdit.id, payload);
      } else {
        await api.createQuestion(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  const currentTC = testCases[activeTabCase - 1] || testCases[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(17, 23, 38, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '2.2rem',
              height: '2.2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #5E3122, #a8543b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(199, 111, 81, 0.4)'
            }}>
              <Shield size={17} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {questionToEdit ? 'Edit Coding Question' : 'Add New Coding Question'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Admin Portal • Configured with 10 evaluation test cases
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#f87171',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {aiNotice && (
            <div style={{
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              color: '#34d399',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{aiNotice.text}</span>
            </div>
          )}

          {/* AI Mode: Prompt-to-Question Generator Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(94, 49, 34, 0.25), rgba(22, 88, 35, 0.2))',
            border: '1px solid var(--border-focus)',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  background: 'var(--primary)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                  AI Question Generator (Multi-Key Failover Mode)
                </span>
              </div>
              <span className="badge" style={{ background: 'rgba(22, 88, 35, 0.4)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                Gemini 2.5 + Groq Failover
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Give any concept, problem idea, or LeetCode reference. AI will automatically construct the problem description, 10 rigorous test cases (4 public + 6 hidden evaluation), and C++ CP templates.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                value={aiIdea}
                onChange={(e) => setAiIdea(e.target.value)}
                placeholder="e.g. Find minimum in rotated sorted array with duplicates, or 0/1 Knapsack with weight bounds"
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem' }}
                disabled={aiGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateWithAi();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={aiGenerating}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.15rem',
                  fontSize: '0.825rem',
                  whiteSpace: 'nowrap',
                  opacity: aiGenerating ? 0.7 : 1
                }}
              >
                {aiGenerating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Auto-Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Row 1: Title, Difficulty, Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Question Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Valid Parentheses"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Stack, String"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Problem Description & Examples (Markdown format)</label>
            <textarea
              required
              rows={5}
              placeholder="Describe problem statement, input formats, constraints, and examples..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
          </div>

          {/* Starter Code Section with 4 Languages */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Starter Code Templates (4 Languages)</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[
                  { id: 'javascript', label: 'JavaScript' },
                  { id: 'python', label: 'Python' },
                  { id: 'cpp', label: 'C++' },
                  { id: 'java', label: 'Java' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setActiveCodeLang(lang.id)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.75rem',
                      borderRadius: '5px',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: activeCodeLang === lang.id ? 'var(--primary)' : 'var(--border-subtle)',
                      background: activeCodeLang === lang.id ? 'var(--primary)' : '#1a233a',
                      color: activeCodeLang === lang.id ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              value={
                activeCodeLang === 'javascript'
                  ? jsCode
                  : activeCodeLang === 'python'
                  ? pyCode
                  : activeCodeLang === 'cpp'
                  ? cppCode
                  : javaCode
              }
              onChange={(e) => {
                const val = e.target.value;
                if (activeCodeLang === 'javascript') setJsCode(val);
                else if (activeCodeLang === 'python') setPyCode(val);
                else if (activeCodeLang === 'cpp') setCppCode(val);
                else setJavaCode(val);
              }}
              className="form-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
          </div>

          {/* 10 Test Cases Configuration Section */}
          <div style={{
            background: 'rgba(17, 23, 38, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1.2rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Configure 10 Sample / Evaluation Test Cases</span>
                  <span className="badge badge-tag" style={{ background: '#2563eb', color: '#fff' }}>10 Required</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Input must be valid JSON matching function parameters (e.g. {`{"nums": [2, 7], "target": 9}`}).
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoPopulate}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <Sparkles size={13} color="#a855f7" />
                Fill Sample Templates
              </button>
            </div>

            {/* 10 Test Cases Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
              {testCases.map((tc, idx) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setActiveTabCase(tc.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: activeTabCase === tc.id ? 'var(--primary)' : 'var(--border-subtle)',
                    background: activeTabCase === tc.id ? 'var(--primary)' : '#1e293b',
                    color: activeTabCase === tc.id ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  Case {tc.id} {tc.isHidden ? '(Hidden)' : '(Public)'}
                </button>
              ))}
            </div>

            {/* Active Test Case Inputs */}
            {currentTC && (
              <div style={{ background: '#0d1117', padding: '1rem', borderRadius: '8px', border: '1px solid #21262d' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Editing Test Case #{activeTabCase}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentTC.isHidden}
                      onChange={(e) => handleTestCaseChange(activeTabCase - 1, 'isHidden', e.target.checked)}
                    />
                    <span>Hidden Evaluation Test Case (Private)</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Test Input (JSON Object / Primitives)</label>
                    <input
                      type="text"
                      required
                      placeholder='{"x": 121}'
                      value={currentTC.input}
                      onChange={(e) => handleTestCaseChange(activeTabCase - 1, 'input', e.target.value)}
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Expected Output (JSON formatted)</label>
                    <input
                      type="text"
                      required
                      placeholder='true'
                      value={currentTC.expectedOutput}
                      onChange={(e) => handleTestCaseChange(activeTabCase - 1, 'expectedOutput', e.target.value)}
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Explanation / Test Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Edge case with negative numbers"
                    value={currentTC.explanation}
                    onChange={(e) => handleTestCaseChange(activeTabCase - 1, 'explanation', e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #5E3122, #9e4f35)', border: '1px solid rgba(199, 111, 81, 0.4)' }}
            >
              {loading ? 'Saving Question...' : questionToEdit ? 'Save Changes' : 'Publish Question (10 Test Cases)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
