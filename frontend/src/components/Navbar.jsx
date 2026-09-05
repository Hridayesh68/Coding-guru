import React from 'react';
import { Terminal, Shield, User, LogOut, Code2, PlusCircle, Sparkles } from 'lucide-react';
import { getUser, isAdmin, clearAuth } from '../utils/auth';

export default function Navbar({ currentView, setView, onOpenAuth, onOpenCreateQuestion }) {
  const user = getUser();
  const admin = isAdmin();

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new CustomEvent('auth-changed'));
    setView('problems');
  };

  return (
    <header className="glass-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.2rem' }}>
        {/* Brand */}
        <div 
          onClick={() => setView('problems')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Terminal size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Coding Guru
            </div>
            <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              10-Test Engine
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setView('problems')}
            className={`btn ${currentView === 'problems' ? 'btn-secondary' : ''}`}
            style={{ color: currentView === 'problems' ? '#ffffff' : 'var(--text-secondary)' }}
          >
            <Code2 size={16} />
            Problem Library
          </button>

          {admin && (
            <button
              onClick={() => setView('admin')}
              className={`btn ${currentView === 'admin' ? 'btn-secondary' : ''}`}
              style={{
                color: currentView === 'admin' ? '#c084fc' : 'var(--text-secondary)',
                border: currentView === 'admin' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none'
              }}
            >
              <Shield size={16} />
              Admin Portal
            </button>
          )}

          {admin && (
            <button
              onClick={onOpenCreateQuestion}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
            >
              <PlusCircle size={15} />
              Add Question (10 Cases)
            </button>
          )}
        </nav>

        {/* Right Section / Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '2.1rem',
                  height: '2.1rem',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                  <span className={user.role === 'admin' ? 'badge badge-admin' : 'badge badge-user'} style={{ padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                    {user.role === 'admin' ? 'Administrator' : 'Coder'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                title="Sign Out"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => onOpenAuth('user')}
                className="btn btn-secondary"
                style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
              >
                <User size={15} />
                Coder Sign In
              </button>
              <button
                onClick={() => onOpenAuth('admin')}
                className="btn btn-primary"
                style={{
                  fontSize: '0.825rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #d946ef)'
                }}
              >
                <Shield size={15} />
                Admin Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
