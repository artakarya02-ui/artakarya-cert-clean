import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Cpu,
  PhoneCall,
  Lock,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { authService, AUTHORIZED_ADMIN_EMAIL } from '../../services/authService';
import { AdminLoginModal } from '../auth/AdminLoginModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onToggleAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
    return unsub;
  }, []);

  useEffect(() => {
    // Sync auth state
    setIsAuthenticated(authService.isAuthenticated());
  }, [isAdmin]);

  const handleNav = (view: string, params?: any) => {
    onNavigate(view, params);
    setMobileMenuOpen(false);
  };

  const handleAdminAction = () => {
    if (isAdmin) {
      // Toggle back to public
      onToggleAdmin();
    } else if (authService.isAuthenticated()) {
      // Already authenticated, directly open dashboard
      onToggleAdmin();
    } else {
      // Open Admin Login modal with empty inputs
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if (!isAdmin) {
      onToggleAdmin();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    if (isAdmin) {
      onToggleAdmin();
    }
  };

  const publicLinks = [
    { id: 'landing', label: 'Beranda', icon: Sparkles },
    { id: 'search', label: 'Cari Sertifikat', icon: Search },
    { id: 'verify', label: 'Verifikasi Keaslian', icon: ShieldCheck },
    { id: 'contact', label: 'Hubungi Kami', icon: PhoneCall },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#050B2E]/95 backdrop-blur-xl border-b border-[#00E5FF]/20 shadow-[0_4px_30px_rgba(5,11,46,0.85)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* TOP-LEFT CLUSTER: Brand Logo + Primary Navigation Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              
              {/* Brand Logo & Identification */}
              <button
                onClick={() => handleNav('landing')}
                className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
              >
                {/* Brand Logo: Official Image or Cyber Gradient CPU Icon */}
                {settings.logoUrl ? (
                  <div className="relative h-11 flex items-center justify-center shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt="Logo Resmi ARTAKARYA"
                      className="h-10 sm:h-11 w-auto max-w-[150px] object-contain drop-shadow-[0_2px_12px_rgba(0,229,255,0.3)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shadow-[0_0_20px_rgba(0,229,255,0.35)] group-hover:scale-105 transition-all duration-300 shrink-0">
                    <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#087BFF]/20 to-[#E83EFF]/20 pointer-events-none" />
                      <Cpu className="w-6 h-6 text-[#00E5FF] group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                  </div>
                )}

                {/* Brand Titles */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-base sm:text-lg font-black tracking-wider text-white">
                      ARTAKARYA
                    </span>
                    <span className="text-[10px] font-stat font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#101B55] text-[#00E5FF] border border-[#00E5FF]/30">
                      EDU
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-body text-slate-300 -mt-0.5">
                    <span className="font-medium text-slate-300 hidden sm:inline">
                      {settings.organizationName || 'ARTAKARYA Creative Intelligence Lab'}
                    </span>
                    <span className="font-medium text-slate-300 sm:hidden">
                      Creative Intelligence Lab
                    </span>
                  </div>
                </div>
              </button>

              {/* Primary Navigation - Positioned at Top-Left next to Brand */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 border-l border-blue-900/60 pl-6">
                {publicLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentView === link.id && !isAdmin;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNav(link.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs xl:text-sm font-heading font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#101B55] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                          : 'text-slate-300 hover:text-white hover:bg-[#101B55]/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* TOP-RIGHT ACTIONS: Clean, Minimalist Admin Button */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/40 transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleAdminAction}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold shadow-lg transition-all duration-200 ${
                  isAdmin
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white shadow-emerald-950/60 border border-emerald-400/40'
                    : isAuthenticated
                    ? 'bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:opacity-95 text-white shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-cyan-400/40'
                    : 'bg-[#101B55] hover:bg-[#101B55]/80 text-[#00E5FF] hover:text-white border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                }`}
              >
                {isAdmin ? (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Mode Publik</span>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Admin</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#00E5FF]" />
                    <span>Login Admin</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile / Tablet Menu Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={handleAdminAction}
                className="px-3.5 py-1.5 text-xs font-heading font-bold rounded-xl bg-gradient-to-r from-[#087BFF] to-[#7928CA] text-white flex items-center gap-1.5 border border-cyan-400/30"
              >
                {isAdmin ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'Publik' : 'Login Admin'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#101B55]/70 border border-blue-900/60 focus:outline-none"
                aria-label="Menu Navigasi"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#00E5FF]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#00E5FF]/20 bg-[#050B2E]/98 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-2">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id && !isAdmin;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-heading font-semibold transition-all ${
                    isActive
                      ? 'bg-[#101B55] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'text-slate-300 hover:bg-[#101B55]/40'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#00E5FF]" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {isAuthenticated && (
              <div className="pt-2 border-t border-blue-950">
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-heading font-semibold text-rose-300 hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Admin ({authService.getSession()?.email || 'artakarya03@gmail.com'})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Dedicated Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};
