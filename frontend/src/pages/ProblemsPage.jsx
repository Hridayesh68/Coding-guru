import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, ChevronRight, Code2, Sparkles, Filter, Shield, Award, Terminal } from 'lucide-react';
import { api } from '../utils/api';
import { isAuthenticated, isAdmin } from '../utils/auth';

export default function ProblemsPage({ onSelectQuestion, onOpenAuth }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [error, setError] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.getQuestions();
      setQuestions(res.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const handleAuthChange = () => fetchQuestions();
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const solvedCount = questions.filter((q) => q.isSolved).length;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{ padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#a5b4fc',
          fontSize: '0.825rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={15} color="#818cf8" />
          Rigorous 10 Test Cases Per Problem
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #ffffff, #c7d2fe, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Sharpen Your Algorithmic Superpowers
        </h1>

        <p style={{
          maxWidth: '680px',
          margin: '0 auto 2rem',
          color: 'var(--text-secondary)',
          fontSize: '1.05rem',
          lineHeight: 1.6
        }}>
          Solve high-impact coding challenges in JavaScript or Python. Every submission is rigorously evaluated against <strong>10 comprehensive test cases</strong> to guarantee full edge-case coverage.
        </p>

        {/* Highlight Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          maxWidth: '850px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Questions</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f3f4f6' }}>{questions.length}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Evaluation Engine</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>10 Cases</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Languages</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>JS & Python</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Your Solved</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{solvedCount} / {questions.length}</div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search problems by title or topic tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Difficulty Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.8rem',
                background: difficultyFilter === diff ? 'var(--primary)' : '#1a233a',
                color: difficultyFilter === diff ? '#ffffff' : 'var(--text-secondary)',
                borderColor: difficultyFilter === diff ? 'var(--border-focus)' : 'var(--border-subtle)'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(17, 23, 38, 0.9)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.25rem', width: '50px' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Title & Topics</th>
              <th style={{ padding: '1rem 1.25rem', width: '130px' }}>Difficulty</th>
              <th style={{ padding: '1rem 1.25rem', width: '130px' }}>Test Cases</th>
              <th style={{ padding: '1rem 1.25rem', width: '140px' }}>Acceptance</th>
              <th style={{ padding: '1rem 1.25rem', width: '120px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading challenge library...
                </td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No questions match your criteria.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => {
                const accRate = q.submissionCount > 0 ? Math.round((q.acceptedCount / q.submissionCount) * 100) : 100;
                return (
                  <tr
                    key={q.id}
                    onClick={() => onSelectQuestion(q)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Status icon */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {q.isSolved ? (
                        <CheckCircle2 size={18} color="#10b981" title="Solved" />
                      ) : (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#334155' }} />
                      )}
                    </td>

                    {/* Title & Tags */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f3f4f6', marginBottom: '0.25rem' }}>
                        {q.title}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {q.tags?.map((t, idx) => (
                          <span key={idx} className="badge-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                        {q.difficulty}
                      </span>
                    </td>

                    {/* Test cases count */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                        {q.testCasesCount || 10} Cases
                      </span>
                    </td>

                    {/* Acceptance */}
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {accRate}%
                    </td>

                    {/* Action */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuestion(q);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Solve
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
