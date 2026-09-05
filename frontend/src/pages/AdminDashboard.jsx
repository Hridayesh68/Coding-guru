import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, Trash2, Edit3, CheckCircle2, AlertTriangle, Users, Code2, Terminal, Award } from 'lucide-react';
import { api } from '../utils/api';
import { isAdmin } from '../utils/auth';

export default function AdminDashboard({ onOpenCreateQuestion, onEditQuestion }) {
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, questionsRes] = await Promise.all([
        api.getAdminStats(),
        api.getQuestions()
      ]);
      if (statsRes.stats) {
        setStats(statsRes.stats);
        setRecentSubmissions(statsRes.recentSubmissions || []);
      }
      if (questionsRes.questions) {
        setQuestions(questionsRes.questions);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteQuestion(id);
      loadAdminData();
    } catch (err) {
      alert('Failed to delete question: ' + err.message);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <Shield size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f87171' }}>Admin Privileges Required</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Please sign in using an administrator account to manage coding questions and inspect evaluation test cases.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0 4rem' }}>
      {/* Admin Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #5E3122, #a8543b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(199, 111, 81, 0.4)',
            boxShadow: '0 0 15px rgba(94, 49, 34, 0.5)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fbf7f4, #e59866)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Administrator Management Portal
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Manage questions, configure 10 evaluation test cases, and monitor platform performance
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateQuestion}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #5E3122, #9e4f35)', border: '1px solid rgba(199, 111, 81, 0.4)' }}
        >
          <PlusCircle size={16} />
          Add Question (10 Test Cases)
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Questions</span>
              <Code2 size={18} color="#818cf8" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalQuestions}</div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>10 test cases each</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Registered Coders</span>
              <Users size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ {stats.totalAdmins} Admins</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Submissions</span>
              <Terminal size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalSubmissions}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{stats.acceptedSubmissions} Accepted</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acceptance Rate</span>
              <Award size={18} color="#ec4899" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{stats.acceptanceRate}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all tests</div>
          </div>
        </div>
      )}

      {/* Questions Management Table */}
      <div className="glass-panel" style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(17, 23, 38, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Coding Questions Inventory</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {questions.length} Questions
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(13, 17, 23, 0.5)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.85rem 1.5rem' }}>Title</th>
              <th style={{ padding: '0.85rem 1.5rem' }}>Difficulty</th>
              <th style={{ padding: '0.85rem 1.5rem' }}>Test Cases Engine</th>
              <th style={{ padding: '0.85rem 1.5rem' }}>Submissions</th>
              <th style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{q.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Slug: {q.slug}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    10 Test Cases
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {q.submissionCount} runs ({q.acceptedCount} accepted)
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={async () => {
                        const full = await api.getQuestionById(q.id);
                        onEditQuestion(full.question);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      title="Edit Question & Test Cases"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Submissions Feed */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(17, 23, 38, 0.8)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Platform Submissions Audit</h2>
        </div>

        {recentSubmissions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No submissions recorded on the platform yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(13, 17, 23, 0.5)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1.5rem' }}>Coder</th>
                <th style={{ padding: '0.75rem 1.5rem' }}>Question</th>
                <th style={{ padding: '0.75rem 1.5rem' }}>Language</th>
                <th style={{ padding: '0.75rem 1.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem' }}>Test Cases Passed</th>
                <th style={{ padding: '0.75rem 1.5rem' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>{s.userName}</td>
                  <td style={{ padding: '0.75rem 1.5rem' }}>{s.questionTitle}</td>
                  <td style={{ padding: '0.75rem 1.5rem', textTransform: 'capitalize' }}>{s.language}</td>
                  <td style={{ padding: '0.75rem 1.5rem' }}>
                    <span className={`badge ${s.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1.5rem', fontFamily: 'var(--font-mono)' }}>
                    {s.passedCount} / {s.totalCount} (10 Cases)
                  </td>
                  <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}>
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
