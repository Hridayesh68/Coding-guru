import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import AdminQuestionModal from './components/AdminQuestionModal';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import { getUser, isAdmin } from './utils/auth';

export default function App() {
  const [currentView, setView] = useState('problems'); // 'problems' | 'detail' | 'admin'
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  
  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('user');
  const [isAdminQuestionOpen, setIsAdminQuestionOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  // User state
  const [currentUser, setCurrentUser] = useState(getUser());

  // Palette State: Earth (Dark) vs Light
  const [currentPalette, setCurrentPalette] = useState(() => {
    let saved = localStorage.getItem('app_palette') || 'earth';
    if (saved === 'emerald') {
      saved = 'earth';
      localStorage.setItem('app_palette', 'earth');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-palette', saved);
    }
    return saved;
  });

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(getUser());
    };
    const syncPalette = () => {
      let p = localStorage.getItem('app_palette') || 'earth';
      if (p === 'emerald') {
        p = 'earth';
        localStorage.setItem('app_palette', 'earth');
      }
      setCurrentPalette(p);
      document.documentElement.setAttribute('data-palette', p);
    };

    window.addEventListener('auth-changed', syncAuth);
    window.addEventListener('palette-changed', syncPalette);
    return () => {
      window.removeEventListener('auth-changed', syncAuth);
      window.removeEventListener('palette-changed', syncPalette);
    };
  }, []);

  const handleOpenAuth = (role = 'user') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleSelectQuestion = (q) => {
    setSelectedQuestionId(q.id);
    setView('detail');
  };

  const handleOpenCreateQuestion = () => {
    setQuestionToEdit(null);
    setIsAdminQuestionOpen(true);
  };

  const handleEditQuestion = (q) => {
    setQuestionToEdit(q);
    setIsAdminQuestionOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        setView={setView}
        onOpenAuth={handleOpenAuth}
        onOpenCreateQuestion={handleOpenCreateQuestion}
      />

      <main style={{ flex: 1 }}>
        {currentView === 'problems' && (
          <ProblemsPage
            onSelectQuestion={handleSelectQuestion}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'detail' && (
          <ProblemDetailPage
            questionId={selectedQuestionId}
            onBack={() => setView('problems')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onOpenCreateQuestion={handleOpenCreateQuestion}
            onEditQuestion={handleEditQuestion}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'rgba(10, 13, 20, 0.9)'
      }}>
        <div className="container">
          Coding Guru Platform • Dual-Role JWT Authentication • 10-Test Case Evaluation Judge
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setView('admin');
          }
        }}
      />

      {/* Admin Question Editor/Creator Modal */}
      <AdminQuestionModal
        isOpen={isAdminQuestionOpen}
        onClose={() => setIsAdminQuestionOpen(false)}
        questionToEdit={questionToEdit}
        onSaved={() => {
          // If on admin or problems page, refresh by trigger or state
          window.dispatchEvent(new CustomEvent('auth-changed'));
        }}
      />
    </div>
  );
}
