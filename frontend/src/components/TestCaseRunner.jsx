import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, Clock, AlertTriangle, Check, Terminal, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function TestCaseRunner({
  question,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  lastResult,
  submissionVerdict
}) {
  const [activeTab, setActiveTab] = useState(1);
  const testCases = question?.testCases || [];

  // If new results arrive, auto-select first failing test case if any, or test case 1
  useEffect(() => {
    if (lastResult?.testResults) {
      const firstFailed = lastResult.testResults.find((t) => !t.passed);
      if (firstFailed) {
        setActiveTab(firstFailed.id);
      } else {
        setActiveTab(1);
      }
    }
  }, [lastResult]);

  const currentTestCase = testCases.find((tc) => tc.id === activeTab) || testCases[0] || {};
  const currentResult = lastResult?.testResults?.find((r) => r.id === activeTab);

  const passedCount = lastResult?.passedCount ?? null;
  const totalCount = lastResult?.totalCount ?? testCases.length;

  return (
    <div className="test-runner">
      {/* Header with Run & Submit Actions */}
      <div className="test-runner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Terminal size={17} color="#818cf8" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Test Cases Engine</span>
          <span className="badge badge-tag" style={{ background: '#1e293b', color: '#93c5fd' }}>
            10 Evaluation Cases
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          >
            <Play size={14} color="#38bdf8" />
            {isRunning ? 'Executing...' : 'Run Samples'}
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="btn btn-success"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}
          >
            {isSubmitting ? 'Evaluating (10 Cases)...' : 'Submit Code (10 Cases)'}
          </button>
        </div>
      </div>

      {/* Submission Verdict Banner */}
      {submissionVerdict && (
        <div
          className={`verdict-banner ${submissionVerdict.status === 'Accepted' ? 'accepted' : 'failed'}`}
          style={{ margin: '0.75rem 1rem 0' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {submissionVerdict.status === 'Accepted' ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <XCircle size={24} color="#ef4444" />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                {submissionVerdict.status}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Passed {submissionVerdict.passedCount} of {submissionVerdict.totalCount} Test Cases
                {submissionVerdict.runtimeMs !== undefined && ` • ${submissionVerdict.runtimeMs}ms Total Execution`}
              </div>
            </div>
          </div>

          {submissionVerdict.status === 'Accepted' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
              <Sparkles size={16} color="#34d399" />
              100% Score
            </div>
          )}
        </div>
      )}

      {/* 10 Test Cases Tab Bar */}
      <div className="test-tabs-grid">
        {testCases.map((tc) => {
          const result = lastResult?.testResults?.find((r) => r.id === tc.id);
          let statusClass = '';
          if (result) {
            statusClass = result.passed ? 'passed' : 'failed';
          }

          return (
            <button
              key={tc.id}
              onClick={() => setActiveTab(tc.id)}
              className={`test-tab-btn ${activeTab === tc.id ? 'active' : ''} ${statusClass}`}
            >
              {result ? (
                result.passed ? (
                  <CheckCircle2 size={13} color="#10b981" />
                ) : (
                  <XCircle size={13} color="#ef4444" />
                )
              ) : (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }}></span>
              )}
              <span>Case {tc.id}</span>
              {tc.isHidden && (
                <span title="Hidden Evaluation Case">
                  <EyeOff size={10} color="#94a3b8" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Test Case Inspection Panel */}
      <div className="test-case-card">
        {currentTestCase ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Test Case #{activeTab}</span>
                {currentTestCase.isHidden ? (
                  <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
                    Hidden Evaluation Test
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    Sample Public Case
                  </span>
                )}
                {currentResult && (
                  <span
                    className={`badge ${currentResult.passed ? 'badge-easy' : 'badge-hard'}`}
                  >
                    {currentResult.passed ? 'Passed' : 'Failed'}
                  </span>
                )}
              </div>

              {currentResult?.executionTimeMs !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={13} />
                  <span>{currentResult.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {currentTestCase.explanation && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Note: {currentTestCase.explanation}
              </div>
            )}

            {/* Input display */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Input:</div>
              <div className="code-snippet-box">
                {currentTestCase.input || '(empty input)'}
              </div>
            </div>

            {/* Expected Output display */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expected Output:</div>
              <div className="code-snippet-box" style={{ color: '#34d399' }}>
                {currentTestCase.expectedOutput}
              </div>
            </div>

            {/* Actual Output display if available */}
            {currentResult && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Your Output:
                </div>
                <div
                  className="code-snippet-box"
                  style={{
                    borderColor: currentResult.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    color: currentResult.passed ? '#34d399' : '#f87171'
                  }}
                >
                  {currentResult.actualOutput !== '' ? currentResult.actualOutput : '(no output returned)'}
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {currentResult?.error && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.8rem',
                color: '#f87171',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Execution Diagnostic / Error:</div>
                {currentResult.error}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No test case selected.
          </div>
        )}
      </div>
    </div>
  );
}
