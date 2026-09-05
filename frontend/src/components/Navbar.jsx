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
            background: 'linear-gradient(135deg, #5E3122, #a8543b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(94, 49, 34, 0.6)',
            border: '1px solid rgba(199, 111, 81, 0.4)'
          }}>
            <Terminal size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fbf7f4, #e59866)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Coding Guru
            </div>
            <div style={{ fontSize: '0.68rem', color: '#c76f51', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              10-Test Engine
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setView('problems')}
            className={`btn ${currentView === 'problems' ? 'btn-secondary' : ''}`}
            style={{ color: currentView === 'problems' ? '#fbf7f4' : 'var(--text-secondary)' }}
          >
            <Code2 size={16} />
            Problem Library
          </button>

          {admin && (
            <button
              onClick={() => setView('admin')}
              className={`btn ${currentView === 'admin' ? 'btn-secondary' : ''}`}
              style={{
                color: currentView === 'admin' ? '#e59866' : 'var(--text-secondary)',
                border: currentView === 'admin' ? '1px solid rgba(199, 111, 81, 0.4)' : 'none'
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

        {/* Right Section / Palette Switcher & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Palette Selector: #5E3122 (Earth) vs #165823 (Emerald) */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '0.2rem' }}>
            <button
              type="button"
              onClick={() => {
                document.documentElement.setAttribute('data-palette', 'earth');
                localStorage.setItem('app_palette', 'earth');
                window.dispatchEvent(new Event('palette-changed'));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '16px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: (typeof document !== 'undefined' && document.documentElement.getAttribute('data-palette') !== 'emerald') ? '#5E3122' : 'transparent',
                color: (typeof document !== 'undefined' && document.documentElement.getAttribute('data-palette') !== 'emerald') ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Warm Chestnut Palette (#5E3122)"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5E3122', border: '1px solid #c76f51' }} />
              #5E3122
            </button>
            <button
              type="button"
              onClick={() => {
                document.documentElement.setAttribute('data-palette', 'emerald');
                localStorage.setItem('app_palette', 'emerald');
                window.dispatchEvent(new Event('palette-changed'));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '16px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: (typeof document !== 'undefined' && document.documentElement.getAttribute('data-palette') === 'emerald') ? '#165823' : 'transparent',
                color: (typeof document !== 'undefined' && document.documentElement.getAttribute('data-palette') === 'emerald') ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Vibrant Emerald Palette (#165823)"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#165823', border: '1px solid #34d399' }} />
              #165823
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '2.1rem',
                  height: '2.1rem',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'linear-gradient(135deg, var(--primary-hover), var(--accent-copper))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(199, 111, 81, 0.3)'
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
                  padding: '0.5rem 1rem'
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
