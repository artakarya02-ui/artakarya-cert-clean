import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckCircle,
  Award,
  History,
  Layers,
  Settings,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Cpu,
  Sparkles,
  KeyRound,
  LogOut,
  Lock,
  Terminal,
  Download,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { EventManagement } from './EventManagement';
import { ParticipantManagement } from './ParticipantManagement';
import { AttendanceValidation } from './AttendanceValidation';
import { CertificateIssuance } from './CertificateIssuance';
import { CertificateHistory } from './CertificateHistory';
import { TemplateManagement } from './TemplateManagement';
import { SettingsPage } from './SettingsPage';
import { DeveloperCenter } from './DeveloperCenter';
import { storage } from '../../services/storage';
import { authService, AUTHORIZED_ADMIN_EMAIL } from '../../services/authService';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';

interface AdminLayoutProps {
  onBackToPublic: () => void;
  onPublicNavigate: (view: string, params?: any) => void;
  initialSubView?: string;
  initialParams?: any;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onBackToPublic,
  onPublicNavigate,
  initialSubView = 'dashboard',
  initialParams = {},
}) => {
  const [activeSubView, setActiveSubView] = useState<string>(initialSubView);
  const [viewParams, setViewParams] = useState<any>(initialParams);
  const [stats, setStats] = useState(storage.getStats());
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setStats(storage.getStats());
    });
    return unsub;
  }, []);

  const handleSubNavigate = (subView: string, params?: any) => {
    setActiveSubView(subView);
    if (params) setViewParams(params);
  };

  const handleLogout = () => {
    authService.logout();
    onBackToPublic();
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'events', label: 'Manajemen Kegiatan', icon: Calendar, badge: stats.totalEvents },
    { id: 'participants', label: 'Data Peserta', icon: Users, badge: stats.totalParticipants },
    {
      id: 'attendance',
      label: 'Validasi Kehadiran',
      icon: CheckCircle,
      badge: stats.pendingValidation > 0 ? stats.pendingValidation : undefined,
      badgeColor: 'bg-cyan-500/20 text-[#00E5FF] border-[#00E5FF]/40',
    },
    { id: 'issue', label: 'Penerbitan Sertifikat', icon: Award },
    { id: 'history', label: 'Riwayat Sertifikat', icon: History, badge: stats.totalCertificatesIssued },
    { id: 'templates', label: 'Template Sertifikat', icon: Layers },
    { id: 'settings', label: 'Company Profile & Contact Settings', icon: Settings },
    ...(authService.getSession()?.role === 'SUPER_ADMIN'
      ? [
          {
            id: 'developer',
            label: 'Developer Center',
            icon: Terminal,
            badge: 'SUPER',
            badgeColor: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/40',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#050B2E] text-slate-100 flex flex-col lg:flex-row font-body">
      
      {/* Sidebar for Desktop: Digital Command Center */}
      <aside className="w-full lg:w-72 bg-[#030820] border-b lg:border-b-0 lg:border-r border-[#00E5FF]/20 p-4 lg:p-6 flex flex-col justify-between shrink-0 shadow-[4px_0_30px_rgba(5,11,46,0.6)]">
        <div className="space-y-6">
          
          {/* Header & Back to Public Button */}
          <div className="pb-4 border-b border-[#101B55]">
            <button
              onClick={onBackToPublic}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#101B55]/60 hover:bg-[#101B55] border border-blue-900/80 text-xs font-heading font-semibold text-slate-300 hover:text-white transition-all group"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-[#00E5FF] group-hover:-translate-x-1 transition-transform" />
                <span>Halaman Publik</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-stat">LIVE</span>
            </button>

            {/* Prominent Direct ZIP Download Button - Strictly for SUPER_ADMIN */}
            {authService.getSession()?.role === 'SUPER_ADMIN' && (
              <a
                href="/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                download="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                className="mt-2.5 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:brightness-110 text-[#050B2E] font-heading font-black text-xs transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] group"
                title="Download Source Code (.ZIP)"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#050B2E] group-hover:translate-y-0.5 transition-transform" />
                  <span>Download Source Code (.ZIP)</span>
                </span>
                <span className="text-[9px] font-stat font-extrabold bg-[#050B2E]/20 text-[#050B2E] px-1.5 py-0.5 rounded">
                  675 KB
                </span>
              </a>
            )}

            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#00E5FF]" />
                </div>
              </div>
              <div>
                <span className="font-heading text-sm sm:text-base font-black text-white block">
                  COMMAND CENTER
                </span>
                <span className="text-[9px] text-[#00E5FF] font-stat font-bold uppercase tracking-wider block">
                  ARTAKARYA EDU CERTIFICATE
                </span>
              </div>
            </div>

            {/* Authenticated Admin Account Pill */}
            <div className="mt-3.5 p-2.5 rounded-xl bg-[#050B2E] border border-blue-900/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-stat font-bold block truncate">
                      {authService.getSession()?.name || 'Administrator ARTAKARYA'}
                    </span>
                    <span className={`text-[8px] font-stat font-extrabold px-1.5 py-0.2 rounded border ${
                      authService.getSession()?.role === 'SUPER_ADMIN'
                        ? 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/40'
                        : 'bg-blue-950/60 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {authService.getSession()?.role || 'SUPER_ADMIN'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-300 truncate block">
                    {authService.getSession()?.email || AUTHORIZED_ADMIN_EMAIL}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="p-1.5 rounded-lg bg-[#101B55] hover:bg-[#087BFF] text-[#00E5FF] hover:text-white transition-colors shrink-0"
                  title="Ubah Kata Sandi Admin"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="pt-1.5 border-t border-blue-950 flex items-center justify-between text-[10px] font-stat text-slate-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Sesi Terverifikasi
                </span>
                <span className="text-cyan-400">Server-Protected</span>
              </div>
            </div>
          </div>

          {/* Navigation Items (All 8 preserved) */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSubNavigate(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all whitespace-nowrap shrink-0 lg:shrink ${
                    isActive
                      ? 'bg-[#101B55] text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'text-slate-300 hover:bg-[#101B55]/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-stat font-bold border ${
                        item.badgeColor || 'bg-[#050B2E] text-cyan-300 border-[#00E5FF]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info & Logout */}
        <div className="pt-6 border-t border-[#101B55] space-y-3 font-stat">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/60 hover:border-rose-500/60 text-rose-300 text-xs font-heading font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout Admin)</span>
          </button>

          <div className="hidden lg:block text-[11px] text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-200">ARTAKARYA Creative Intelligence Lab</p>
            <p className="text-[10px] text-cyan-400/80">EDU Terminal v2.1 • MySQL Ready</p>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col">
        {/* Topbar / Header for Private Admin Panel */}
        <div className="mb-6 pb-4 border-b border-[#101B55] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-stat font-bold text-xs uppercase tracking-wider">
              {activeSubView.toUpperCase()} PANEL
            </div>
            <span className="text-xs text-slate-400 font-stat hidden md:inline">
              ARTAKARYA Authenticated Session ({authService.getSession()?.role || 'ADMIN'})
            </span>
          </div>

          {/* Super Admin Topbar ZIP Download Button */}
          {authService.getSession()?.role === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <a
                href="/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                download="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:brightness-110 text-[#050B2E] font-heading font-black text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)] group"
                title="Download Source Code (.ZIP)"
              >
                <Download className="w-3.5 h-3.5 text-[#050B2E] group-hover:translate-y-0.5 transition-transform" />
                <span>Download Source Code (.ZIP)</span>
                <span className="text-[10px] font-stat font-extrabold bg-[#050B2E]/20 text-[#050B2E] px-1.5 py-0.2 rounded">
                  675 KB
                </span>
              </a>
            </div>
          )}
        </div>

        {activeSubView === 'dashboard' && (
          <AdminDashboard
            onAdminNavigate={handleSubNavigate}
            onPublicNavigate={onPublicNavigate}
          />
        )}
        {activeSubView === 'events' && (
          <EventManagement
            onAdminNavigate={handleSubNavigate}
            onPublicNavigate={onPublicNavigate}
          />
        )}
        {activeSubView === 'participants' && (
          <ParticipantManagement
            initialEventId={viewParams?.eventId}
            onAdminNavigate={handleSubNavigate}
            onPublicNavigate={onPublicNavigate}
          />
        )}
        {activeSubView === 'attendance' && (
          <AttendanceValidation onAdminNavigate={handleSubNavigate} />
        )}
        {activeSubView === 'issue' && (
          <CertificateIssuance
            initialEventId={viewParams?.eventId}
            onAdminNavigate={handleSubNavigate}
            onPublicNavigate={onPublicNavigate}
          />
        )}
        {activeSubView === 'history' && (
          <CertificateHistory
            onAdminNavigate={handleSubNavigate}
            onPublicNavigate={onPublicNavigate}
          />
        )}
        {activeSubView === 'templates' && (
          <TemplateManagement onPublicNavigate={onPublicNavigate} />
        )}
        {activeSubView === 'settings' && <SettingsPage />}
        {activeSubView === 'developer' && <DeveloperCenter />}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

    </div>
  );
};
