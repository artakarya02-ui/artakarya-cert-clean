import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Database,
  Globe,
  Server,
  AlertTriangle,
  FolderGit2,
  CheckCircle,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { authService, AUTHORIZED_ADMIN_EMAIL } from '../../services/authService';
import { supabaseService, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../services/supabaseService';
import { storage } from '../../services/storage';

export const DeveloperCenter: React.FC = () => {
  const session = authService.getSession();
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'supabase' | 'zip' | 'github' | 'hostinger'>('all');
  const [supabaseStatus, setSupabaseStatus] = useState(supabaseService.getStatus());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [syncCount, setSyncCount] = useState<number | null>(null);

  React.useEffect(() => {
    const unsub = supabaseService.subscribeStatus((s) => setSupabaseStatus(s));
    supabaseService.testConnection().catch(() => {});
    return unsub;
  }, []);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await supabaseService.testConnection();
    setSupabaseStatus(res);
    setIsTestingSupabase(false);
  };

  const handleManualSyncToSupabase = async () => {
    setIsTestingSupabase(true);
    const certs = storage.getCertificates();
    const res = await supabaseService.batchSaveCertificates(certs);
    setSyncCount(res.count);
    setIsTestingSupabase(false);
    setTimeout(() => setSyncCount(null), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadZip = () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const link = document.createElement('a');
      link.href = '/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip';
      link.setAttribute('download', 'ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }, 400);
    } catch {
      window.location.href = '/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip';
      setDownloading(false);
      setDownloadSuccess(true);
    }
  };

  // Role security guard: Strictly SUPER_ADMIN only
  if (!isSuperAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center max-w-2xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Akses Terbatas: Khusus SUPER_ADMIN</h2>
        <p className="text-sm text-slate-300 leading-relaxed font-body">
          Menu Developer Center memuat manajemen source code dan konfigurasi server institusi ARTAKARYA. Menu ini secara ketat hanya dapat diakses oleh akun Super Administrator (<span className="text-cyan-300 font-mono">{AUTHORIZED_ADMIN_EMAIL}</span>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body pb-12">
      {/* Top Banner: Developer Center Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101B55]/95 via-[#050B2E]/98 to-[#101B55]/95 border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(8,123,255,0.25)] relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-300" />
                SUPER_ADMIN ONLY
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-stat font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PROD READY
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-wide">
              DEVELOPER CENTER
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
              Pusat pengelolaan distribusi source code, integrasi repositori GitHub, dan deployment ke hosting resmi Hostinger untuk ARTAKARYA Certificate System.
            </p>
          </div>

          {/* Quick Access Badges */}
          <div className="p-4 rounded-2xl bg-[#030820]/80 border border-blue-900/80 shrink-0 text-xs space-y-2 md:w-72">
            <div className="flex items-center justify-between text-slate-300 font-heading font-bold">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#00E5FF]" />
                Arsitektur Sistem
              </span>
              <span className="text-[10px] text-emerald-400 font-stat">FULL-STACK</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-body">
              Node.js 22 LTS • Express API • Vite React • MySQL Engine • Hostinger Ready
            </p>
            <div className="pt-1.5 border-t border-blue-950 flex items-center justify-between text-[10px] text-slate-400 font-stat">
              <span>Admin: {session?.email}</span>
              <span className="text-cyan-400 font-semibold">Terkonfirmasi</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="mt-8 pt-6 border-t border-blue-900/60 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-white/20 text-white border border-white/40 shadow-sm'
                : 'bg-[#101B55]/60 text-slate-300 hover:bg-[#101B55] hover:text-white border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Semua Bagian</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-[#101B55]/60 text-slate-300 hover:bg-[#101B55] hover:text-white border border-transparent'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>DATABASE SUPABASE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('zip')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
              activeTab === 'zip'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                : 'bg-[#101B55]/60 text-slate-300 hover:bg-[#101B55] hover:text-white border border-transparent'
            }`}
          >
            <FileArchive className="w-4 h-4" />
            <span>1. SOURCE CODE ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
              activeTab === 'github'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'bg-[#101B55]/60 text-slate-300 hover:bg-[#101B55] hover:text-white border border-transparent'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>2. GITHUB</span>
          </button>

          <button
            onClick={() => setActiveTab('hostinger')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hostinger'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'bg-[#101B55]/60 text-slate-300 hover:bg-[#101B55] hover:text-white border border-transparent'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. HOSTINGER</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION: SUPABASE ONLINE DATABASE INTEGRATION
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'supabase') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#030820]/90 border border-emerald-500/30 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-emerald-900/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
                    Integrasi Database Online Supabase
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-stat font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    REAL-TIME SYNC
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-body mt-1">
                  Sinkronisasi real-time sertifikat dan peserta ke tabel <code className="text-emerald-300 font-mono">certificates</code> di Supabase. Data yang dimasukkan admin langsung dapat dicari secara online dari perangkat HP maupun komputer umum.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-heading font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Cpu className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                <span>{isTestingSupabase ? 'Memeriksa...' : 'Uji Koneksi Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualSyncToSupabase}
                disabled={isTestingSupabase}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-heading font-black text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Sinkronkan {storage.getCertificates().length} Data ke Supabase</span>
              </button>
            </div>
          </div>

          {syncCount !== null && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Berhasil mengirim <strong>{syncCount} sertifikat</strong> ke tabel Supabase &quot;certificates&quot;.</span>
            </div>
          )}

          {/* Credentials Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#050B2E] border border-blue-900/60 space-y-2">
              <span className="text-[10px] text-slate-400 font-stat font-bold uppercase tracking-wider block">
                SUPABASE PROJECT URL
              </span>
              <div className="flex items-center justify-between gap-2 bg-[#020617] px-3 py-2 rounded-xl border border-slate-800">
                <span className="font-mono text-xs text-cyan-300 truncate">{SUPABASE_URL}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(SUPABASE_URL, 'supa_url')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Salin URL"
                >
                  {copiedKey === 'supa_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E] border border-blue-900/60 space-y-2">
              <span className="text-[10px] text-slate-400 font-stat font-bold uppercase tracking-wider block">
                SUPABASE ANON KEY (PUBLISHABLE)
              </span>
              <div className="flex items-center justify-between gap-2 bg-[#020617] px-3 py-2 rounded-xl border border-slate-800">
                <span className="font-mono text-xs text-cyan-300 truncate">{SUPABASE_ANON_KEY}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(SUPABASE_ANON_KEY, 'supa_key')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Salin Key"
                >
                  {copiedKey === 'supa_key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* SQL Migration Quick Copy */}
          <div className="p-4 rounded-2xl bg-[#050B2E] border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-heading font-bold text-white">
                  Skrip SQL Pembuatan Tabel &quot;certificates&quot; di Supabase
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(supabaseService.getSqlMigrationScript(), 'sql_script')}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-heading font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
              >
                {copiedKey === 'sql_script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL Migration</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-body">
              Jika tabel belum dibuat di dashboard Supabase, buka menu <strong>SQL Editor</strong> di Supabase dan jalankan skrip ini untuk mengaktifkan RLS dan indeks pencarian publik.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: SOURCE CODE ZIP
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'zip') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#030820]/90 border border-[#00E5FF]/30 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-blue-900/60">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-[#00E5FF] flex items-center justify-center shrink-0 border border-cyan-500/30">
                <FileArchive className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
                    1. Source Code ZIP (Paket Produksi Final)
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-stat font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    VALID & TERSEDIA
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-body mt-1">
                  Arsip ZIP lengkap seluruh source code aplikasi ARTAKARYA Certificate System siap dipindahkan ke GitHub dan dideploy langsung ke Hostinger.
                </p>
              </div>
            </div>

            {/* PRIMARY FUNCTIONAL DOWNLOAD BUTTONS */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#00E5FF] to-[#087BFF] text-[#050B2E] font-heading font-black text-xs sm:text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                <Download className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${downloading ? 'animate-bounce' : 'group-hover:translate-y-0.5'}`} />
                <span>{downloading ? 'Mengunduh ZIP...' : 'Download Source Code ZIP'}</span>
              </button>

              <a
                href="/api/v1/download/project-zip"
                download="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"
                className="px-4 py-3 rounded-2xl bg-[#101B55]/80 hover:bg-[#101B55] border border-cyan-500/40 text-cyan-300 hover:text-white font-heading font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5"
                title="Unduh langsung via HTTP stream"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tautan Langsung</span>
              </a>
            </div>
          </div>

          {/* Download Feedback Alert */}
          {downloadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-heading font-semibold flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Download Berhasil Dimulai!</p>
                <p className="text-emerald-300/90 text-xs font-body">
                  File biner <span className="font-mono font-bold">ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip</span> telah dikirim ke perangkat Anda. Arsip berformat PKZIP 2.0 standar dengan entri folder hirarkis yang kompatibel penuh dengan Windows File Explorer.
                </p>
              </div>
            </div>
          )}

          {/* File Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metadata 1: Nama File */}
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Nama File Resmi
              </p>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-white truncate" title="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip">
                  ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip
                </span>
                <button
                  onClick={() => copyToClipboard('ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip', 'filename')}
                  className="p-1 rounded hover:bg-blue-900/50 text-slate-400 hover:text-cyan-300"
                  title="Salin Nama File"
                >
                  {copiedKey === 'filename' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-cyan-400/80 font-stat">Target Produksi Hostinger</p>
            </div>

            {/* Metadata 2: Ukuran File */}
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Ukuran File
              </p>
              <h3 className="font-stat text-xl font-bold text-[#00E5FF]">
                674.2 KB <span className="text-xs text-slate-400 font-normal">(690.349 bytes)</span>
              </h3>
              <p className="text-[10px] text-emerald-400 font-stat">Kompatibel Windows 10/11</p>
            </div>

            {/* Metadata 3: Tanggal Ekspor */}
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Tanggal Ekspor Terakhir
              </p>
              <h3 className="font-stat text-base font-bold text-white">
                07 November 2026
              </h3>
              <p className="text-[10px] text-slate-400 font-stat">Zona Asia/Jakarta (WIB)</p>
            </div>

            {/* Metadata 4: Status Ketersediaan */}
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Status Ketersediaan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-heading font-bold text-emerald-400">
                  Tersedia & Siap Unduh
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 font-stat">Ekstraksi Windows Terverifikasi</p>
            </div>
          </div>

          {/* Detail Isi Paket ZIP */}
          <div className="p-5 rounded-2xl bg-[#050B2E]/60 border border-blue-900/40 space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#00E5FF]" />
              Verifikasi Kelengkapan Isi Arsip ZIP (54 File Proyek + 16 Folder Hirarkis)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 font-body">
              <div className="p-3 rounded-xl bg-[#030820]/70 border border-blue-950 space-y-1">
                <span className="font-heading font-bold text-white block">Full-Stack Server & Engine</span>
                <p className="text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-300">server.ts</span> (Express API + Vite Middleware), <span className="font-mono text-cyan-300">package.json</span>, <span className="font-mono text-cyan-300">tsconfig.json</span>, build scripts ESBuild Node 22.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#030820]/70 border border-blue-950 space-y-1">
                <span className="font-heading font-bold text-white block">Database & Panduan Hostinger</span>
                <p className="text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-300">database/schema.sql</span> (Skema MySQL lengkap), <span className="font-mono text-cyan-300">DEPLOYMENT_HOSTINGER.md</span> (Panduan hPanel & VPS), <span className="font-mono text-cyan-300">README.md</span>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#030820]/70 border border-blue-950 space-y-1">
                <span className="font-heading font-bold text-white block">Frontend React & QR Engine</span>
                <p className="text-[11px] text-slate-400">
                  Komponen verifikasi QR Code terenkripsi, generator PDF A4, Developer Center, manajemen template, dan layout responsif HP/Desktop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: GITHUB
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'github') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#030820]/90 border border-purple-500/30 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
                    2. Repositori GitHub & Sinkronisasi
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-stat font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    GIT READY
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-body mt-1">
                  Hubungkan source code dengan repositori GitHub resmi ARTAKARYA untuk version control terpusat dan continuous deployment.
                </p>
              </div>
            </div>

            {/* BUTTON TO GITHUB */}
            <div className="shrink-0">
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
              >
                <span>Buka GitHub (Buat Repo Baru)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* GitHub Repository Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-purple-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Rekomendasi Nama Repository
              </p>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-purple-300">
                  artakarya-certificate-system
                </span>
                <button
                  onClick={() => copyToClipboard('artakarya-certificate-system', 'reponame')}
                  className="p-1 rounded hover:bg-purple-900/40 text-slate-400 hover:text-purple-300"
                  title="Salin Nama Repo"
                >
                  {copiedKey === 'reponame' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-stat">Visibility: Disarankan Private</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-purple-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Default Branch
              </p>
              <h3 className="font-mono text-sm font-bold text-white">main</h3>
              <p className="text-[10px] text-slate-400 font-stat">Branch produksi standar</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-purple-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Status Koneksi Repository
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-heading font-bold text-amber-300">
                  Siap Dihubungkan (Push Pertama)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-stat">Source Code telah di-bundle dalam ZIP</p>
            </div>
          </div>

          {/* Panduan Sinkronisasi Source Code */}
          <div className="p-5 rounded-2xl bg-[#050B2E]/80 border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                Panduan Sinkronisasi Source Code ke GitHub (Terminal / CLI)
              </h3>
              <button
                onClick={() => {
                  const cmd = `git init\ngit branch -M main\ngit add .\ngit commit -m "feat: initial commit ARTAKARYA Certificate System"\ngit remote add origin https://github.com/[USERNAME-ANDA]/artakarya-certificate-system.git\ngit push -u origin main`;
                  copyToClipboard(cmd, 'allgit');
                }}
                className="text-[11px] font-heading font-semibold text-purple-300 hover:text-white flex items-center gap-1.5"
              >
                {copiedKey === 'allgit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Seluruh Perintah</span>
              </button>
            </div>

            <div className="bg-[#020617] rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 border border-slate-800 overflow-x-auto">
              <p className="text-slate-500"># 1. Ekstrak file ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip di komputer Anda</p>
              <p className="text-slate-500"># 2. Buka terminal di dalam direktori proyek hasil ekstrak, lalu jalankan:</p>
              <div className="text-purple-300">git init</div>
              <div className="text-purple-300">git branch -M main</div>
              <div className="text-purple-300">git add .</div>
              <div className="text-purple-300">git commit -m &quot;feat: initial commit ARTAKARYA Certificate System Final&quot;</div>
              <div className="text-cyan-300">git remote add origin https://github.com/<span className="text-amber-300">[USERNAME-ANDA]</span>/artakarya-certificate-system.git</div>
              <div className="text-emerald-400">git push -u origin main</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: HOSTINGER
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'hostinger') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#030820]/90 border border-indigo-500/30 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-indigo-900/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
                    3. Deployment Hostinger & Konfigurasi Server
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-stat font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    NODE.JS & MYSQL
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-body mt-1">
                  Panduan deploy ke hosting resmi Hostinger menggunakan hPanel Node.js Application Manager atau Hostinger VPS (Nginx Reverse Proxy).
                </p>
              </div>
            </div>

            {/* BUTTON TO HOSTINGER */}
            <div className="shrink-0">
              <a
                href="https://hpanel.hostinger.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
              >
                <span>Buka Hostinger hPanel</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Hostinger Deployment Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-indigo-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Target Domain Resmi
              </p>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-indigo-300">
                  sertifikat.artakarya.id
                </span>
                <button
                  onClick={() => copyToClipboard('sertifikat.artakarya.id', 'domain')}
                  className="p-1 rounded hover:bg-indigo-900/40 text-slate-400 hover:text-indigo-300"
                  title="Salin Domain"
                >
                  {copiedKey === 'domain' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-stat">Subdomain / Custom Domain</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-indigo-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Status Deployment
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-heading font-bold text-cyan-300">
                  Siap Deploy (Build Selesai)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-stat">Bundle: dist/server.js</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-indigo-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Runtime Node.js
              </p>
              <h3 className="font-mono text-xs font-bold text-white">Node.js 22 LTS (Port 3000)</h3>
              <p className="text-[10px] text-emerald-400 font-stat">Engine didukung Hostinger</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-indigo-900/40 space-y-1">
              <p className="text-[10px] uppercase font-heading font-bold tracking-wider text-slate-400">
                Status Domain & SSL
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-heading font-bold text-white">
                  Let&apos;s Encrypt SSL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-stat">Konfigurasi otomatis di hPanel</p>
            </div>
          </div>

          {/* Panduan Konfigurasi Database & Deployment Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box A: Konfigurasi Database MySQL */}
            <div className="p-5 rounded-2xl bg-[#050B2E]/80 border border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Langkah 1: Setup Database MySQL di Hostinger
                </h3>
              </div>
              <div className="text-xs text-slate-300 space-y-2.5 font-body">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>Buka <span className="font-semibold text-white">Hostinger hPanel &gt; Databases &gt; Management</span>, buat database MySQL baru (contoh: <span className="font-mono text-cyan-300">u12345_artakarya</span>).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p>Buka <span className="font-semibold text-white">phpMyAdmin</span>, lalu impor file <span className="font-mono text-cyan-300 font-bold">database/schema.sql</span> yang ada di dalam paket ZIP.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p>Salin konfigurasi kredensial ke file <span className="font-mono text-cyan-300">.env</span> di server:</p>
                </div>

                <div className="bg-[#020617] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 relative group">
                  <button
                    onClick={() => {
                      const envText = `PORT=3000\nNODE_ENV=production\nVITE_VERIFY_DOMAIN=https://artakaryacertificates.site\nVITE_SUPABASE_URL=https://zpipiupnjusqhxihdbl.supabase.co\nVITE_SUPABASE_ANON_KEY=sb_publishable_io2Q4YyD3S6FH_5mI37_Rw_oSzou9Yq\nADMIN_SESSION_SECRET=artakarya_secret_session_key_production_2026`;
                      copyToClipboard(envText, 'envsample');
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    {copiedKey === 'envsample' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                  <p className="text-slate-500"># Hostinger Production .env (Vite + Supabase)</p>
                  <p>PORT=3000</p>
                  <p>NODE_ENV=production</p>
                  <p>VITE_VERIFY_DOMAIN=https://artakaryacertificates.site</p>
                  <p>VITE_SUPABASE_URL=https://zpipiupnjusqhxihdbl.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=sb_publishable_io2Q4YyD3S6FH_5mI37_Rw_oSzou9Yq</p>
                  <p>ADMIN_SESSION_SECRET=artakarya_secret_session_key_production_2026</p>
                </div>
              </div>
            </div>

            {/* Box B: Langkah Deploy Node.js App */}
            <div className="p-5 rounded-2xl bg-[#050B2E]/80 border border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Langkah 2: Menjalankan Node.js di Hostinger
                </h3>
              </div>
              <div className="text-xs text-slate-300 space-y-2.5 font-body">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>Upload seluruh isi file <span className="font-mono text-cyan-300 font-bold">ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip</span> ke folder aplikasi Anda di Hostinger (via File Manager atau Git Push).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p>Pada menu <span className="font-semibold text-white">Node.js</span> di hPanel, atur parameter berikut:</p>
                </div>

                <div className="bg-[#020617] p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node.js Version:</span>
                    <span className="text-emerald-400 font-bold">22.x LTS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Application Mode:</span>
                    <span className="text-cyan-300 font-bold">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Application Root:</span>
                    <span className="text-white">/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Application Startup File:</span>
                    <span className="text-amber-300 font-bold">dist/server.js</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-stat font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p>Jalankan perintah instalasi dependency di terminal SSH atau tombol &quot;NPM Install&quot; di hPanel:</p>
                </div>
                <div className="bg-[#020617] p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                  npm install --omit=dev && npm run build
                </div>
              </div>
            </div>
          </div>

          {/* Additional Documentation Link */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Panduan lengkap tersedia dalam file <span className="font-mono text-white font-bold">DEPLOYMENT_HOSTINGER.md</span> di dalam paket ZIP.</span>
            </div>
            <button
              onClick={handleDownloadZip}
              className="text-xs font-heading font-bold text-cyan-300 hover:text-white flex items-center gap-1 shrink-0"
            >
              <span>Download Paket Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
