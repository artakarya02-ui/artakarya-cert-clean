import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './views/public/LandingPage';
import { SearchPage } from './views/public/SearchPage';
import { DetailPage } from './views/public/DetailPage';
import { VerifyPage } from './views/public/VerifyPage';
import { ContactPage } from './views/public/ContactPage';
import { AdminLayout } from './views/admin/AdminLayout';
import { authService } from './services/authService';
import { AdminLoginModal } from './components/auth/AdminLoginModal';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Check URL query params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const certParam = urlParams.get('cert');
      const viewParam = urlParams.get('view');
      const adminParam = urlParams.get('admin');

      if (adminParam === 'true') {
        if (authService.isAuthenticated()) {
          setIsAdminMode(true);
        } else {
          setShowAdminLoginModal(true);
        }
      } else if (certParam) {
        setCurrentView('verify');
        setViewParams({ initialCertNumber: certParam, certNumber: certParam });
      } else if (viewParam) {
        setCurrentView(viewParam);
      }
    }
  }, []);

  const handleNavigate = (view: string, params: any = {}) => {
    setIsAdminMode(false);
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (authService.isAuthenticated()) {
        setIsAdminMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setShowAdminLoginModal(true);
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B2E] text-slate-100">
      {isAdminMode ? (
        <AdminLayout
          onBackToPublic={() => setIsAdminMode(false)}
          onPublicNavigate={(view, params) => handleNavigate(view, params)}
        />
      ) : (
        <>
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            isAdmin={isAdminMode}
            onToggleAdmin={handleToggleAdmin}
          />

          <main className="flex-1">
            {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}

            {currentView === 'search' && (
              <SearchPage
                initialQuery={viewParams?.q || ''}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'detail' && (
              <DetailPage
                certNumber={viewParams?.certNumber}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'verify' && (
              <VerifyPage
                initialCertNumber={viewParams?.initialCertNumber || viewParams?.certNumber || ''}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'contact' && (
              <ContactPage onNavigate={handleNavigate} />
            )}
          </main>

          <Footer onNavigate={handleNavigate} />

          {/* Admin Login Modal for unauthenticated access attempts */}
          <AdminLoginModal
            isOpen={showAdminLoginModal}
            onClose={() => setShowAdminLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </>
      )}
    </div>
  );
}
