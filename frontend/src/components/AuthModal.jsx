import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, KeyRound, ArrowRight, Sparkles, Check } from 'lucide-react';
import { api } from '../utils/api';
import { saveAuth } from '../utils/auth';

export default function AuthModal({ isOpen, onClose, initialRole = 'user', onSuccess }) {
  const [activeTab, setActiveTab] = useState(initialRole === 'admin' ? 'admin-login' : 'user-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [registerRole, setRegisterRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (activeTab === 'user-login') {
        res = await api.loginUser(email, password);
      } else if (activeTab === 'admin-login') {
        res = await api.loginAdmin(email, password);
      } else {
        // Register
        if (registerRole === 'admin') {
          res = await api.registerAdmin(name, email, password, adminKey || 'admin123');
        } else {
          res = await api.registerUser(name, email, password);
        }
      }

      if (res.token && res.user) {
        saveAuth(res.token, res.user);
        window.dispatchEvent(new CustomEvent('auth-changed'));
        if (onSuccess) onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Sign In
  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      let res;
      if (role === 'admin') {
        res = await api.loginAdmin('admin@codingguru.com', 'Admin@123');
      } else {
        res = await api.loginUser('coder@codingguru.com', 'Coder@123');
      }

      if (res.token && res.user) {
        saveAuth(res.token, res.user);
        window.dispatchEvent(new CustomEvent('auth-changed'));
        if (onSuccess) onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(17, 23, 38, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '8px',
              background: activeTab === 'admin-login' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeTab === 'admin-login' ? <Shield size={16} color="#fff" /> : <Lock size={16} color="#fff" />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {activeTab === 'user-login' && 'Coder Sign In'}
                {activeTab === 'admin-login' && 'Admin Portal Access'}
                {activeTab === 'register' && 'Create Guru Account'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'admin-login' ? 'Authorized administrator portal' : 'JWT Authenticated Platform'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '0.75rem 1.5rem 0',
          gap: '0.4rem'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('user-login'); setError(''); }}
            style={{
              padding: '0.6rem 0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              textAlign: 'center',
              color: activeTab === 'user-login' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'user-login' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.2s'
            }}
          >
            Coder Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin-login'); setError(''); }}
            style={{
              padding: '0.6rem 0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              textAlign: 'center',
              color: activeTab === 'admin-login' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'admin-login' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.2s'
            }}
          >
            Admin Portal
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={{
              padding: '0.6rem 0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              textAlign: 'center',
              color: activeTab === 'register' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'register' ? '#2563eb' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Login Presets */}
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
              <Sparkles size={14} />
              Quick 1-Click Demo Logins:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <User size={13} color="#60a5fa" />
                Demo Coder
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', justifyContent: 'flex-start', borderColor: 'rgba(168, 85, 247, 0.3)' }}
              >
                <Shield size={13} color="#c084fc" />
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#f87171',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('user')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      border: '1px solid',
                      borderColor: registerRole === 'user' ? 'var(--primary)' : 'var(--border-subtle)',
                      background: registerRole === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: registerRole === 'user' ? '#818cf8' : 'var(--text-secondary)'
                    }}
                  >
                    Coder Role
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('admin')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      border: '1px solid',
                      borderColor: registerRole === 'admin' ? '#a855f7' : 'var(--border-subtle)',
                      background: registerRole === 'admin' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                      color: registerRole === 'admin' ? '#c084fc' : 'var(--text-secondary)'
                    }}
                  >
                    Admin Role
                  </button>
                </div>
              </div>

              {registerRole === 'admin' && (
                <div className="form-group">
                  <label className="form-label">Admin Secret Key (Default: admin123)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="admin123"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2.2rem' }}
                    />
                    <KeyRound size={15} color="#c084fc" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder={activeTab === 'admin-login' ? 'admin@codingguru.com' : 'coder@codingguru.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
              />
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
              />
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: activeTab === 'admin-login' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                {activeTab === 'user-login' && 'Sign In as Coder'}
                {activeTab === 'admin-login' && 'Enter Admin Portal'}
                {activeTab === 'register' && 'Complete Registration'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
