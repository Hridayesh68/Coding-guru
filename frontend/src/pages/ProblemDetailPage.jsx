import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, FileText, History, Code2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import TestCaseRunner from '../components/TestCaseRunner';
import { api } from '../utils/api';
import { isAuthenticated, getUser } from '../utils/auth';
import { getBoilerplate } from '../utils/boilerplates';

export default function ProblemDetailPage({ questionId, onBack, onOpenAuth }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'submissions'
  
  // Supported languages: cpp, python, java
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('preferred_coding_language');
    return saved && ['cpp', 'python', 'java'].includes(saved) ? saved : 'cpp';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  const [code, setCode] = useState('');
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [submissionVerdict, setSubmissionVerdict] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Fetch question details
  const loadQuestion = async () => {
    try {
      setLoading(true);
      const res = await api.getQuestionById(questionId);
      if (res.question) {
        setQuestion(res.question);
        const preferred = getInitialLanguage();
        setLanguage(preferred);
        const initialCode = res.question.starterCode?.[preferred] || getBoilerplate(preferred);
        setCode(initialCode);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load submissions
  const loadSubmissions = async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.getSubmissions(questionId);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  useEffect(() => {
    loadQuestion();
    loadSubmissions();
  }, [questionId]);

  // Handle language switch and save preference across problems
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferred_coding_language', newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    } else {
      setCode(getBoilerplate(newLang));
    }
  };

  // Reset to starter code or boilerplate
  const handleReset = () => {
    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
    } else {
      setCode(getBoilerplate(language));
    }
  };

  // Run preview on sample cases
  const handleRun = async () => {
    setIsRunning(true);
    setSubmissionVerdict(null);
    try {
      const res = await api.runCode({
        code,
        language,
        questionId: question.id
      });
      if (res.evaluation) {
        setLastResult(res.evaluation);
      }
    } catch (err) {
      alert('Execution Error: ' + (err.message || 'Failed to run code'));
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code evaluated against all 10 test cases
  const handleSubmit = async () => {
    if (!isAuthenticated()) {
      onOpenAuth('user');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitCode({
        code,
        language,
        questionId: question.id
      });

      if (res.submission) {
        setSubmissionVerdict(res.submission);
        setLastResult({
          status: res.submission.status,
          passedCount: res.submission.passedCount,
          totalCount: res.submission.totalCount,
          testResults: res.submission.testResults
        });
        loadSubmissions();
      }
    } catch (err) {
      alert('Submission Error: ' + (err.message || 'Failed to evaluate code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading problem environment...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h3>Problem not found.</h3>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Return to Problem Library
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3rem' }}>
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={15} />
          Back to Problems
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`badge badge-${question.difficulty?.toLowerCase()}`}>
            {question.difficulty}
          </span>
          <span className="badge badge-tag" style={{ background: '#1e293b', color: '#38bdf8' }}>
            10 Test Cases
          </span>
        </div>
      </div>

      {/* Main Split Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Problem Details & Submissions */}
        <div className="glass-panel" style={{ height: 'calc(100vh - 170px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(17, 23, 38, 0.8)'
          }}>
            <button
              onClick={() => setLeftTab('description')}
              className={`btn ${leftTab === 'description' ? 'btn-secondary' : ''}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.825rem',
                color: leftTab === 'description' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <FileText size={15} />
              Description
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`btn ${leftTab === 'submissions' ? 'btn-secondary' : ''}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.825rem',
                color: leftTab === 'submissions' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <History size={15} />
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {leftTab === 'description' ? (
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {question.title}
                </h1>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {question.tags?.map((t, idx) => (
                    <span key={idx} className="badge-tag">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Problem Markdown content */}
                <div style={{
                  color: '#d1d5db',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit'
                }}>
                  {question.description}
                </div>

                {/* Test case notice */}
                <div style={{
                  marginTop: '2rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <Sparkles size={18} color="#818cf8" style={{ marginTop: '0.15rem' }} />
                  <div style={{ fontSize: '0.825rem', color: '#c7d2fe' }}>
                    <strong>10-Test Case Evaluation:</strong> When you submit, your code is tested against 10 comprehensive cases (including boundary inputs, negative values, and large scales). All 10 must pass for an <em>Accepted</em> verdict.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Submission History
                </h3>

                {!isAuthenticated() ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '1rem' }}>Sign in to track your submission history and solved questions.</p>
                    <button onClick={() => onOpenAuth('user')} className="btn btn-primary">
                      Sign In
                    </button>
                  </div>
                ) : submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No submissions recorded yet for this question. Submit your code to see results here!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="glass-panel"
                        style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span className={`badge ${sub.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>
                              {sub.status}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              Passed {sub.passedCount} / {sub.totalCount} Cases
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                            <span>Language: {sub.language}</span>
                            <span>Runtime: {sub.runtimeMs}ms</span>
                            <span>{new Date(sub.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setCode(sub.code);
                            setLanguage(sub.language);
                            setLeftTab('description');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Load Code
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & 10 Test Cases Runner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Code Editor */}
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onReset={handleReset}
          />

          {/* 10 Test Cases Runner */}
          <TestCaseRunner
            question={question}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            lastResult={lastResult}
            submissionVerdict={submissionVerdict}
          />
        </div>
      </div>
    </div>
  );
}
