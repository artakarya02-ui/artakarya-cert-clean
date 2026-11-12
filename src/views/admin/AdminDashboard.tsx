import React from 'react';
import {
  Calendar,
  UserCheck,
  FileCheck2,
  Clock,
  PlusCircle,
  CheckCircle,
  FileSpreadsheet,
  Award,
  ArrowRight,
  Database,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Cpu,
  Activity,
  Zap,
  Download,
  FileArchive,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { authService } from '../../services/authService';

interface AdminDashboardProps {
  onAdminNavigate: (subView: string) => void;
  onPublicNavigate: (view: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onAdminNavigate,
  onPublicNavigate,
}) => {
  const stats = storage.getStats();
  const events = storage.getEvents();
  const certs = storage.getCertificates();
  const featuredEvent = events.find((e) => e.id === 'evt-ai-ceo-2026') || events[0];

  return (
    <div className="space-y-8 font-body">
      
      {/* Top Banner: Digital Command Center Header & MySQL Readiness */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#101B55]/90 via-[#050B2E]/95 to-[#101B55]/90 border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(8,123,255,0.2)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              COMMAND CENTER DASHBOARD
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-stat font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              TERMINAL ONLINE
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Pusat Kendali Sertifikasi Digital ARTAKARYA
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
            Kelola kegiatan, validasi kehadiran peserta secara real-time, terbitkan sertifikat berstandar kriptografis, dan pantau metrik institusi.
          </p>

          {/* Prominent Download Source Code (.ZIP) Action - Strictly for SUPER_ADMIN */}
          {authService.getSession()?.role === 'SUPER_ADMIN' && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                download="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#00E5FF] to-[#087BFF] text-[#050B2E] font-heading font-black text-xs sm:text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center gap-2.5 group cursor-pointer"
                title="Download Source Code (.ZIP)"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#050B2E] group-hover:translate-y-0.5 transition-transform" />
                <span>Download Source Code (.ZIP)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-stat font-extrabold bg-[#050B2E]/20 text-[#050B2E]">
                  675 KB • PROD READY
                </span>
              </a>

              <button
                onClick={() => onAdminNavigate('developer')}
                className="px-4 py-3 rounded-2xl bg-[#101B55]/80 hover:bg-[#101B55] border border-cyan-500/40 text-cyan-300 hover:text-white font-heading font-bold text-xs tracking-wide transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileArchive className="w-4 h-4 text-cyan-400" />
                <span>Developer Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Backend MySQL Phase 2 Info Box */}
        <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/80 shrink-0 text-xs space-y-2 md:w-80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-slate-200 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00E5FF]" />
              Arsitektur Backend
            </span>
            <span className="text-[10px] font-stat font-bold text-fuchsia-300 bg-fuchsia-400/10 px-2 py-0.5 rounded border border-fuchsia-500/30">
              FASE 1 SELESAI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-body">
            Frontend UI/UX aktif. Skema SQL MySQL & kontrak REST API Node.js/Express telah siap dihubungkan pada fase integrasi berikutnya.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-950">
            <button
              onClick={() => onAdminNavigate('settings')}
              className="text-[11px] font-heading font-semibold text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              <span>Skema MySQL & API</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {authService.getSession()?.role === 'SUPER_ADMIN' && (
              <>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => onAdminNavigate('developer')}
                  className="text-[11px] font-heading font-bold text-fuchsia-300 hover:text-white flex items-center gap-1"
                >
                  <span>Developer Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD STATISTIK (4 REQUIRED KPI METRICS WITH SPACE GROTESK) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Kegiatan */}
        <div
          onClick={() => onAdminNavigate('events')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#101B55]/40 hover:bg-[#101B55]/70 border border-[#00E5FF]/20 hover:border-[#00E5FF]/60 shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-[#00E5FF] flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs text-[#00E5FF] font-heading font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Kelola <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs uppercase font-heading font-bold tracking-wider text-slate-400">Total Kegiatan</p>
          <h2 className="font-stat text-3xl sm:text-4xl font-bold text-white mt-1">
            {stats.totalEvents}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-body">
            {stats.activeEvents} Program aktif / selesai
          </p>
        </div>

        {/* Metric 2: Total Peserta */}
        <div
          onClick={() => onAdminNavigate('participants')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#101B55]/40 hover:bg-[#101B55]/70 border border-[#E83EFF]/20 hover:border-[#E83EFF]/60 shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-[#E83EFF] flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs text-fuchsia-300 font-heading font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Daftar <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs uppercase font-heading font-bold tracking-wider text-slate-400">Total Peserta</p>
          <h2 className="font-stat text-3xl sm:text-4xl font-bold text-fuchsia-300 mt-1">
            {stats.totalParticipants}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-body">
            Terdaftar di basis data
          </p>
        </div>

        {/* Metric 3: Sertifikat Terbit */}
        <div
          onClick={() => onAdminNavigate('history')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#101B55]/40 hover:bg-[#101B55]/70 border border-emerald-500/20 hover:border-emerald-500/60 shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shadow-md">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <span className="text-xs text-emerald-300 font-heading font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Riwayat <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs uppercase font-heading font-bold tracking-wider text-slate-400">Sertifikat Terbit</p>
          <h2 className="font-stat text-3xl sm:text-4xl font-bold text-emerald-400 mt-1">
            {stats.totalCertificatesIssued}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-body">
            {stats.totalDownloaded} Kali diunduh peserta
          </p>
        </div>

        {/* Metric 4: Menunggu Validasi */}
        <div
          onClick={() => onAdminNavigate('attendance')}
          className="group cursor-pointer p-6 rounded-3xl bg-[#101B55]/40 hover:bg-[#101B55]/70 border border-cyan-500/20 hover:border-cyan-500/60 shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs text-cyan-300 font-heading font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Validasi <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs uppercase font-heading font-bold tracking-wider text-slate-400">Menunggu Validasi</p>
          <h2 className="font-stat text-3xl sm:text-4xl font-bold text-cyan-300 mt-1">
            {stats.pendingValidation}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-body">
            Perlu konfirmasi presensi
          </p>
        </div>

      </div>

      {/* Quick Action Command Toolbar */}
      <div className="p-4 rounded-3xl bg-[#101B55]/50 border border-[#00E5FF]/20 flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl">
        <span className="text-xs font-heading font-bold text-slate-200 uppercase tracking-wider pl-2 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#00E5FF]" />
          Aksi Cepat Command Center:
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onAdminNavigate('events')}
            className="px-4 py-2 rounded-xl bg-[#050B2E] hover:bg-[#101B55] border border-blue-900 text-white font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Tambah Kegiatan Baru</span>
          </button>
          
          <button
            onClick={() => onAdminNavigate('participants')}
            className="px-4 py-2 rounded-xl bg-[#050B2E] hover:bg-[#101B55] border border-blue-900 text-white font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Tambah Peserta</span>
          </button>
          
          <button
            onClick={() => onAdminNavigate('attendance')}
            className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-blue-900 border border-[#00E5FF]/30 text-cyan-300 font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Validasi Kehadiran</span>
          </button>
          
          <button
            onClick={() => onAdminNavigate('issue')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            <Award className="w-3.5 h-3.5 text-white" />
            <span>Penerbitan Sertifikat</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Event Status Progress & Recent Issued Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Featured Event Progress (AI CEO Masterclass) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00E5FF]" />
              <span>Program Terkini: {featuredEvent.title}</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-stat font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {featuredEvent.status}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#101B55]/50 border border-blue-900/60 space-y-4 backdrop-blur-xl">
            <div>
              <p className="text-sm font-heading font-semibold text-[#00E5FF]">
                "{featuredEvent.subtitle}"
              </p>
              <p className="text-xs text-slate-400 mt-1 font-body">
                Penyelenggara: <strong className="text-slate-200">{featuredEvent.organizer}</strong> • Tanggal: <strong className="text-white font-stat">02 November 2026</strong>
              </p>
            </div>

            {/* Glowing Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-stat">
                <span className="text-slate-400 font-body">Progres Sertifikasi Peserta</span>
                <span className="text-cyan-300 font-bold">
                  {featuredEvent.issuedCount} / {featuredEvent.participantCount} Terbit ({Math.round((featuredEvent.issuedCount / (featuredEvent.participantCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#050B2E] rounded-full overflow-hidden border border-blue-950">
                <div
                  className="h-full bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                  style={{
                    width: `${Math.min(100, Math.round((featuredEvent.issuedCount / (featuredEvent.participantCount || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-stat">
              <div className="p-3 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px] font-body">Kategori</span>
                <span className="font-heading font-bold text-white mt-0.5 block">{featuredEvent.category}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px] font-body">Prefix Serial</span>
                <span className="font-bold text-[#00E5FF] mt-0.5 block">{featuredEvent.certificatePrefix}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px] font-body">Format Desain</span>
                <span className="font-bold text-slate-200 mt-0.5 block">Ivory Clean A4</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-blue-900/60">
              <button
                onClick={() => onAdminNavigate('attendance')}
                className="text-xs text-cyan-300 hover:text-white font-heading font-semibold"
              >
                Validasi Presensi Peserta →
              </button>
              <button
                onClick={() => onPublicNavigate('detail', { certNumber: 'AK-20261102-AICEO-001' })}
                className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 font-heading font-semibold"
              >
                <span>Pratinjau Sertifikat</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline of Issued Certificates */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#E83EFF]" />
              <span>Aktivitas Kredensial Terbaru</span>
            </h3>
            <button
              onClick={() => onAdminNavigate('history')}
              className="text-xs text-slate-400 hover:text-[#00E5FF] font-stat"
            >
              Semua ({certs.length})
            </button>
          </div>

          <div className="space-y-3">
            {certs.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onPublicNavigate('detail', { certNumber: c.certificateNumber })}
                className="group cursor-pointer p-4 rounded-2xl bg-[#101B55]/40 hover:bg-[#101B55]/80 border border-blue-900/50 hover:border-[#00E5FF]/50 transition-colors flex items-center justify-between gap-3 backdrop-blur-xl"
              >
                <div className="space-y-1">
                  <span className="font-stat text-[11px] font-bold text-[#00E5FF]">
                    {c.certificateNumber}
                  </span>
                  <p className="font-heading font-bold text-sm text-white group-hover:text-[#00E5FF] transition-colors">
                    {c.participantName}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-[220px] font-body">
                    {c.eventTitle}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-stat font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 block mb-1">
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-stat">
                    {c.issueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
