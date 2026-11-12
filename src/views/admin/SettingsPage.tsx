import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Database,
  Building,
  UserCheck,
  ShieldCheck,
  Copy,
  Check,
  Code2,
  Server,
  RefreshCw,
  Trash2,
  FileText,
  AlertCircle,
  Cpu,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Youtube,
  MapPin,
  Lock,
  KeyRound,
  ShieldAlert,
  X,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { authService } from '../../services/authService';
import { SystemSettings } from '../../types';
import {
  MYSQL_SCHEMA_SQL,
  EXPRESS_BACKEND_ENDPOINTS,
  BACKEND_ARCHITECTURE_INFO,
} from '../../services/backendContract';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(storage.getSettings());
  const [activeTab, setActiveTab] = useState<'company' | 'signers' | 'backend'>('company');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Administrator Session & Privilege
  const [session, setSession] = useState(authService.getSession());
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  // Logo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileMeta, setLogoFileMeta] = useState<{ name: string; sizeKb: number; type: string } | null>(null);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showLogoConfirmModal, setShowLogoConfirmModal] = useState(false);
  const [showLogoDeleteModal, setShowLogoDeleteModal] = useState(false);
  const [logoAuthKeyInput, setLogoAuthKeyInput] = useState('');
  const [logoAuthError, setLogoAuthError] = useState<string | null>(null);

  // Security Auth Modal State (Company Profile)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Reset & Clear Confirmation Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
    setSession(authService.getSession());
    return unsub;
  }, []);

  const handleInitiateSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKeyInput('');
    setAuthError(null);
    setShowAuthModal(true);
  };

  const handleConfirmAuthorizedSave = () => {
    // Admin authorization check (Standard admin key or default PIN)
    const validKeys = ['ARTAKARYA-ADMIN', '2026', 'ADMIN', 'artakarya'];
    if (!validKeys.includes(adminKeyInput.trim().toUpperCase()) && adminKeyInput.trim() !== '2026') {
      setAuthError('Kunci otorisasi administrator tidak valid. Silakan coba lagi (Kunci default: 2026).');
      return;
    }

    // Format WhatsApp URL automatically
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const finalSettings: SystemSettings = {
      ...settings,
      whatsappUrl: `https://wa.me/${internationalPhone}`,
    };

    storage.saveSettings(finalSettings);
    setShowAuthModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // LOGO UPLOAD & AUTHENTICATION HANDLERS
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSuperAdmin) {
      setLogoMessage({
        type: 'error',
        text: 'Akses Ditolak: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang mengunggah atau mengganti logo resmi lembaga.',
      });
      return;
    }

    // Supported formats: PNG, JPG, JPEG, SVG
    const isSvg = file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml';
    const isPng = file.name.toLowerCase().endsWith('.png') || file.type === 'image/png';
    const isJpg = file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg') || file.type === 'image/jpeg';

    if (!isSvg && !isPng && !isJpg) {
      setLogoMessage({
        type: 'error',
        text: 'Format berkas tidak valid. Harap gunakan format gambar PNG, JPG, atau SVG.',
      });
      return;
    }

    // Max size: 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setLogoMessage({
        type: 'error',
        text: 'Ukuran berkas logo terlalu besar (maksimal 5 MB).',
      });
      return;
    }

    setLogoMessage(null);
    setLogoFileMeta({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
      type: isSvg ? 'SVG (Vektor Transparan)' : isPng ? 'PNG (Transparan)' : 'JPG (Gambar)',
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting same file works
    e.target.value = '';
  };

  const handleInitiateLogoSave = () => {
    if (!logoPreview) return;
    if (!isSuperAdmin) {
      setLogoMessage({
        type: 'error',
        text: 'Akses Ditolak: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang mengubah logo resmi lembaga.',
      });
      return;
    }
    setLogoAuthKeyInput('');
    setLogoAuthError(null);
    setShowLogoConfirmModal(true);
  };

  const handleConfirmLogoSave = async () => {
    const validKeys = ['ARTAKARYA-ADMIN', '2026', 'ADMIN', 'artakarya'];
    if (!validKeys.includes(logoAuthKeyInput.trim().toUpperCase()) && logoAuthKeyInput.trim() !== '2026') {
      setLogoAuthError('Kunci otorisasi administrator tidak valid. Silakan coba lagi (Kunci default: 2026).');
      return;
    }

    if (!logoPreview) return;

    setIsSavingLogo(true);
    setLogoAuthError(null);

    const res = await storage.saveOfficialLogo(logoPreview);
    setIsSavingLogo(false);

    if (res.success) {
      setLogoPreview(null);
      setLogoFileMeta(null);
      setShowLogoConfirmModal(false);
      setLogoMessage({
        type: 'success',
        text: 'Logo resmi ARTAKARYA Creative Intelligence Lab berhasil disimpan secara permanen di server dan diterapkan ke seluruh sistem.',
      });
      setTimeout(() => setLogoMessage(null), 5000);
    } else {
      setLogoAuthError(res.error || 'Gagal menyimpan logo ke server.');
    }
  };

  const handleInitiateLogoDelete = () => {
    if (!isSuperAdmin) {
      setLogoMessage({
        type: 'error',
        text: 'Akses Ditolak: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang menghapus logo resmi lembaga.',
      });
      return;
    }
    setLogoAuthKeyInput('');
    setLogoAuthError(null);
    setShowLogoDeleteModal(true);
  };

  const handleConfirmLogoDelete = async () => {
    const validKeys = ['ARTAKARYA-ADMIN', '2026', 'ADMIN', 'artakarya'];
    if (!validKeys.includes(logoAuthKeyInput.trim().toUpperCase()) && logoAuthKeyInput.trim() !== '2026') {
      setLogoAuthError('Kunci otorisasi administrator tidak valid. Silakan coba lagi (Kunci default: 2026).');
      return;
    }

    setIsSavingLogo(true);
    setLogoAuthError(null);

    const res = await storage.deleteOfficialLogo();
    setIsSavingLogo(false);

    if (res.success) {
      setShowLogoDeleteModal(false);
      setLogoPreview(null);
      setLogoFileMeta(null);
      setLogoMessage({
        type: 'success',
        text: 'Logo resmi lembaga berhasil dihapus dari server. Tampilan dikembalikan ke ikon default.',
      });
      setTimeout(() => setLogoMessage(null), 5000);
    } else {
      setLogoAuthError(res.error || 'Gagal menghapus logo dari server.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(MYSQL_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const executeResetDemo = () => {
    storage.resetToDemoData();
    setShowResetModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const executeClearAll = () => {
    storage.clearAllData();
    setShowClearModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-stat font-extrabold px-2.5 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 uppercase">
              KONFIGURASI TERPUSAT
            </span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">Company Profile & Contact Settings</h2>
          <p className="text-xs text-slate-400">
            Satu sumber konfigurasi resmi untuk identitas perusahaan, informasi kontak, dan otorisasi sertifikat.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-heading font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            Pengaturan Berhasil Disimpan & Diterapkan!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-900/60 text-xs sm:text-sm font-heading font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'company'
              ? 'border-[#00E5FF] text-[#00E5FF]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Profil Perusahaan & Kontak Resmi</span>
        </button>

        <button
          onClick={() => setActiveTab('signers')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'signers'
              ? 'border-[#00E5FF] text-[#00E5FF]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Penandatangan Resmi Kredensial</span>
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'backend'
              ? 'border-[#00E5FF] text-[#00E5FF]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-[#00E5FF]" />
          <span>Arsitektur MySQL & Node.js</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-stat bg-blue-900/60 text-cyan-300">
            Fase 2
          </span>
        </button>
      </div>

      {/* TAB 1: COMPANY PROFILE & CONTACT SETTINGS */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          
          {/* SECTION: LOGO RESMI LEMBAGA (EXCLUSIVE SUPER_ADMIN) */}
          <div className="p-6 rounded-3xl bg-[#101B55]/50 border border-[#00E5FF]/40 space-y-5 text-xs sm:text-sm backdrop-blur-xl shadow-[0_0_35px_rgba(8,123,255,0.15)]">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                  <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-white text-base sm:text-lg">Logo Resmi Lembaga</h3>
                    <span className="text-[10px] font-stat font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                      SUPER_ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-body">
                    Identitas visual resmi ARTAKARYA Creative Intelligence Lab yang disimpan permanen di server.
                  </p>
                </div>
              </div>

              {/* Privilege Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-stat font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Akses Super Admin Terverifikasi</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-stat font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khusus Super Admin ({session?.email || 'Akses Terbatas'})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Notification Message */}
            {logoMessage && (
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-heading font-semibold animate-in fade-in ${
                  logoMessage.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                }`}
              >
                {logoMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{logoMessage.text}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoFileSelect}
              accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
              className="hidden"
            />

            {/* Main Visual Display: Current Logo vs Guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* CURRENT ACTIVE LOGO CONTAINER */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-stat font-bold text-slate-400 uppercase tracking-wider">
                      Status Logo Saat Ini
                    </span>
                    <span className="text-[10px] font-stat px-2 py-0.5 rounded bg-blue-900/60 text-[#00E5FF]">
                      {settings.logoUrl ? 'LOGO KUSTOM RESMI' : 'IKON DEFAULT SISTEM'}
                    </span>
                  </div>

                  {/* Visual Preview Box with Transparency Pattern */}
                  <div className="w-full h-36 rounded-xl border border-blue-900/80 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px] bg-[#03071E] flex items-center justify-center p-4 relative overflow-hidden group">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo Resmi ARTAKARYA"
                        className="max-h-24 max-w-[85%] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                          <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                            <Cpu className="w-7 h-7 text-[#00E5FF]" />
                          </div>
                        </div>
                        <span className="text-[11px] font-heading text-slate-400">
                          ARTAKARYA Default Vector Badge
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Logo Action Buttons */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isSuperAdmin}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                        isSuperAdmin
                          ? 'bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:opacity-95 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{settings.logoUrl ? 'Ganti Logo Resmi' : 'Unggah Logo Baru'}</span>
                    </button>

                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={handleInitiateLogoDelete}
                        disabled={!isSuperAdmin}
                        className={`px-3.5 py-2.5 rounded-xl border font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          isSuperAdmin
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/40 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        }`}
                        title="Hapus Logo Resmi"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {!isSuperAdmin && (
                    <p className="text-[10px] text-amber-400/90 font-body text-center">
                      Hanya akun SUPER_ADMIN (artakarya03@gmail.com) yang dapat mengunggah atau menghapus logo.
                    </p>
                  )}
                </div>
              </div>

              {/* SPECIFICATIONS & INTEGRATION COVERAGE INFO */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-[#050B2E]/60 border border-blue-900/40 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-heading font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#00E5FF]" />
                    <span>Ketentuan Berkas & Sinkronisasi Otomatis</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#03071E] border border-blue-900/60 space-y-1">
                      <span className="font-stat font-bold text-[#00E5FF] block">Format Berkas</span>
                      <p className="text-slate-300 font-body text-[11px]">
                        Mendukung <strong className="text-white">PNG</strong>, <strong className="text-white">SVG</strong>, dan <strong className="text-white">JPG</strong>. Disarankan latar belakang transparan.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#03071E] border border-blue-900/60 space-y-1">
                      <span className="font-stat font-bold text-[#00E5FF] block">Penyimpanan Server</span>
                      <p className="text-slate-300 font-body text-[11px]">
                        Disimpan permanen pada basis data server backend, aman dan tidak terhapus saat cache browser dibersihkan.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-stat font-bold text-slate-400 uppercase tracking-wider block">
                      Cakupan Penggunaan Otomatis (5 Target Wajib):
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-body">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>1. Header Halaman Publik (Navbar)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>2. Portal Verifikasi Keaslian</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>3. Tampilan Template Sertifikat</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>4. Berkas PDF Sertifikat Siap Cetak</span>
                      </li>
                      <li className="flex items-center gap-1.5 sm:col-span-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>5. Profil Resmi & Footer Lembaga</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-cyan-200 font-body flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span>Sistem menjaga proporsi, warna, dan rasio asli gambar tanpa distorsi/stretching.</span>
                </div>
              </div>

            </div>

            {/* PREVIEW BARU SEBELUM DISIMPAN (INTERACTIVE DUAL PREVIEW) */}
            {logoPreview && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0b164a] to-[#050B2E] border-2 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.25)] space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-800/60">
                  <div>
                    <span className="text-[10px] font-stat font-extrabold px-2.5 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] uppercase border border-[#00E5FF]/40">
                      PRATINJAU LOGO BARU SEBELUM DISIMPAN
                    </span>
                    <h4 className="font-heading font-black text-white text-base mt-1">
                      Konfirmasi Logo Baru Sebelum Diterapkan
                    </h4>
                    <p className="text-xs text-slate-300 font-body">
                      Logo lama tetap aktif dan aman. Logo baru hanya akan menggantikan logo lama setelah Anda memverifikasi kunci otorisasi.
                    </p>
                  </div>

                  {logoFileMeta && (
                    <div className="text-left sm:text-right font-stat text-xs text-slate-300">
                      <span className="font-bold text-white block truncate max-w-xs">{logoFileMeta.name}</span>
                      <span className="text-[11px] text-[#00E5FF]">{logoFileMeta.type} • {logoFileMeta.sizeKb} KB</span>
                    </div>
                  )}
                </div>

                {/* Dual Canvas Preview (Dark Theme vs Certificate Ivory) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Canvas 1: Website Dark Canvas */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-stat text-slate-400 block font-semibold">
                      Tampilan pada Header Web & Halaman Publik (Gelap)
                    </span>
                    <div className="h-28 rounded-xl bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:10px_10px] bg-[#050B2E] border border-blue-900 flex items-center justify-center p-3 relative">
                      <img
                        src={logoPreview}
                        alt="Pratinjau Web"
                        className="max-h-20 max-w-[85%] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Canvas 2: Certificate Ivory Canvas */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-stat text-slate-400 block font-semibold">
                      Tampilan pada Template & PDF Sertifikat (Ivory/Putih)
                    </span>
                    <div className="h-28 rounded-xl bg-[#FFFDF9] border border-slate-300 flex items-center justify-center p-3 relative">
                      <img
                        src={logoPreview}
                        alt="Pratinjau Sertifikat"
                        className="max-h-20 max-w-[85%] object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Confirmation Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFileMeta(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-blue-900/60 text-slate-300 font-heading font-semibold text-xs transition-colors"
                  >
                    Batalkan Pratinjau
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateLogoSave}
                    disabled={isSavingLogo}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Simpan & Terapkan Logo Resmi Permanen</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Form for Company Profile & Signers */}
          <form onSubmit={handleInitiateSave} className="space-y-6">
          
          {/* Section: Brand & Corporate Identity */}
          <div className="p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 space-y-4 text-xs sm:text-sm backdrop-blur-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-blue-900/60">
              <div className="w-8 h-8 rounded-xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base">Identitas Perusahaan & Brand</h3>
                <p className="text-xs text-slate-400 font-body">Pengaturan nama induk dan produk digital sertifikasi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Nama Induk Organisasi *
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  placeholder="ARTAKARYA Creative Intelligence Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Identitas organisasi induk resmi</span>
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Nama Brand & Produk
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.brandName || 'ARTAKARYA'}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    placeholder="ARTAKARYA"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                  <input
                    type="text"
                    value={settings.productName || 'ARTAKARYA Certificate System'}
                    onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
                    placeholder="ARTAKARYA Certificate System"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Tagline Resmi *
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="Digital Certification & Verification Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Website Resmi
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  placeholder="https://artakarya.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-heading font-semibold mb-1">
                Deskripsi Profil Perusahaan (Brand Profile Footer & About)
              </label>
              <textarea
                rows={2}
                value={settings.profileDescription}
                onChange={(e) => setSettings({ ...settings, profileDescription: e.target.value })}
                placeholder="Platform pengembangan teknologi kreatif, kecerdasan buatan, edukasi digital, dan solusi inovasi."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          {/* Section: Official Contact Information */}
          <div className="p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 space-y-4 text-xs sm:text-sm backdrop-blur-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-blue-900/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base">Informasi Kontak & Alamat Resmi</h3>
                <p className="text-xs text-slate-400 font-body">Data kontak yang tampil pada Footer dan Halaman Kontak.</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-heading font-semibold mb-1">
                Alamat Kantor Resmi *
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Jl. A.H. Nasution No. 86, Bandung"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Alamat resmi terintegrasi dengan Google Maps pada halaman Kontak.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Email Bisnis Resmi *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="artakarya01@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF] font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Nomor WhatsApp Resmi *
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsappNumber: e.target.value,
                        contactPhone: e.target.value,
                      })
                    }
                    placeholder="087821008929"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF] font-mono text-xs"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Tautan otomatis: <code className="text-emerald-400">https://wa.me/62...</code>
                </span>
              </div>
            </div>
          </div>

          {/* Section: Social Media Accounts */}
          <div className="p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 space-y-4 text-xs sm:text-sm backdrop-blur-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-blue-900/60">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base">Akun Media Sosial Resmi</h3>
                <p className="text-xs text-slate-400 font-body">
                  Akun yang belum ditentukan akan otomatis disembunyikan dari antarmuka publik.
                </p>
              </div>
            </div>

            {/* Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Instagram Handle *
                </label>
                <input
                  type="text"
                  value={settings.instagramHandle}
                  onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                  placeholder="@artakarya.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  URL Instagram Resmi
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  placeholder="https://www.instagram.com/artakarya.co/"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* YouTube & TikTok (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-blue-900/40">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  URL YouTube Resmi (Opsional)
                </label>
                <input
                  type="url"
                  value={settings.youtubeUrl || ''}
                  onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                  placeholder="Kosongkan jika belum tersedia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Status: {settings.youtubeUrl ? 'Aktif' : 'Belum ditentukan (Disembunyikan dari publik)'}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  URL TikTok Resmi (Opsional)
                </label>
                <input
                  type="url"
                  value={settings.tiktokUrl || ''}
                  onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                  placeholder="Kosongkan jika belum tersedia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Status: {settings.tiktokUrl ? 'Aktif' : 'Belum ditentukan (Disembunyikan dari publik)'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#101B55]/60 border border-blue-900/60">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
              <span>Perubahan data identitas dilindungi oleh otentikasi administrator.</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-[#087BFF]/30 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Simpan Identitas Perusahaan</span>
            </button>
          </div>

        </form>
        </div>
      )}

      {/* TAB 2: SIGNERS & CERTIFICATE AUTHORITY */}
      {activeTab === 'signers' && (
        <form onSubmit={handleInitiateSave} className="p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 space-y-6 text-xs sm:text-sm backdrop-blur-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-blue-900/60">
            <div className="w-8 h-8 rounded-xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">Penandatangan Resmi Sertifikat</h3>
              <p className="text-xs text-slate-400 font-body">
                Nama dan jabatan pejabat pengesah yang tercantum pada sertifikat digital.
              </p>
            </div>
          </div>

          {/* Signer 1 */}
          <div className="p-4 rounded-2xl bg-[#050B2E] border border-blue-950 space-y-3">
            <span className="text-[11px] font-stat font-bold text-[#00E5FF] uppercase tracking-wider block">
              Penandatangan Utama 1 (Kiri)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-heading mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={settings.defaultSigner1.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSigner1: { ...settings.defaultSigner1, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B55] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-heading mb-1">Jabatan Resmi</label>
                <input
                  type="text"
                  value={settings.defaultSigner1.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSigner1: { ...settings.defaultSigner1, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B55] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* Signer 2 */}
          <div className="p-4 rounded-2xl bg-[#050B2E] border border-blue-950 space-y-3">
            <span className="text-[11px] font-stat font-bold text-fuchsia-400 uppercase tracking-wider block">
              Penandatangan Utama 2 (Kanan)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-heading mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={settings.defaultSigner2.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSigner2: { ...settings.defaultSigner2, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B55] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-heading mb-1">Jabatan Resmi</label>
                <input
                  type="text"
                  value={settings.defaultSigner2.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSigner2: { ...settings.defaultSigner2, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#101B55] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* Default Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-heading font-semibold mb-1">
                Prefix Nomor Seri Sertifikat Standar
              </label>
              <input
                type="text"
                value={settings.serialPrefix}
                onChange={(e) => setSettings({ ...settings, serialPrefix: e.target.value.toUpperCase() })}
                placeholder="AK"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 font-mono text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-body text-xs">
                <input
                  type="checkbox"
                  checked={settings.requireAttendanceForIssue}
                  onChange={(e) =>
                    setSettings({ ...settings, requireAttendanceForIssue: e.target.checked })
                  }
                  className="rounded border-blue-900 text-[#087BFF] focus:ring-[#00E5FF] w-4 h-4"
                />
                <span>Hanya terbitkan sertifikat untuk peserta yang berstatus HADIR</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-900/60 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-[#087BFF]/30 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Simpan Penandatangan Resmi</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BACKEND ARCHITECTURE & DATA MANAGEMENT */}
      {activeTab === 'backend' && (
        <div className="space-y-6">
          {/* Architecture Status Banner */}
          <div className="p-6 rounded-3xl bg-[#101B55]/60 border border-[#00E5FF]/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base">Arsitektur Backend Node.js & MySQL (Fase 2)</h3>
                <p className="text-xs text-slate-400 font-body">ARTAKARYA Certificate System</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              Arsitektur backend sistem ARTAKARYA disiapkan menggunakan Node.js Express dan database MySQL. Seluruh skema tabel dan endpoint REST API telah diformulasikan untuk implementasi Fase 2.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-stat">
              <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px]">Basis Data Target</span>
                <strong className="text-white">MySQL 8.0+ / MariaDB</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px]">Framework Backend</span>
                <strong className="text-white">Node.js Express & TypeScript</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block text-[10px]">Status Fase Saat Ini</span>
                <strong className="text-[#00E5FF]">Frontend Ready + Mock Storage</strong>
              </div>
            </div>
          </div>

          {/* MySQL Schema Preview */}
          <div className="p-6 rounded-3xl bg-[#050B2E] border border-blue-900/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#00E5FF]" />
                <h4 className="font-heading font-bold text-white text-sm">Skema Tabel Database MySQL Resmi</h4>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-[#101B55] hover:bg-blue-900 text-xs text-slate-200 border border-blue-800 flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00E5FF]" />}
                <span>{copiedSql ? 'Disalin ke Clipboard' : 'Salin SQL'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-[#030820] border border-blue-950 font-mono text-xs text-cyan-300 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
              {MYSQL_SCHEMA_SQL}
            </pre>
          </div>

          {/* Reset & Clear Database Controls */}
          <div className="p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 space-y-4">
            <h4 className="font-heading font-bold text-white text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00E5FF]" />
              Manajemen Data Lokal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#050B2E] border border-blue-950 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-heading font-bold text-white text-xs">Reset ke Data Demo</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kembalikan contoh kegiatan AI CEO Masterclass, peserta dummy, dan riwayat sertifikat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#087BFF]/30 hover:bg-[#087BFF]/50 border border-[#087BFF]/40 text-xs font-heading font-semibold text-white transition-colors"
                >
                  Reset Data Demo
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#050B2E] border border-red-950/60 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-heading font-bold text-red-300 text-xs">Kosongkan Data (Mode Bersih)</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hapus semua data demo untuk mempersiapkan sistem dengan data kegiatan riil ARTAKARYA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs font-heading font-semibold text-red-300 transition-colors"
                >
                  Kosongkan Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY PIN / AUTHORIZATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-body">
          <div className="w-full max-w-md bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.25)] p-6 text-white my-8">
            <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Otorisasi Administrator</h3>
                  <p className="text-xs text-slate-400">Proteksi Identitas Resmi Perusahaan</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-slate-300">
              <p>
                Perubahan pada nama lembaga, kontak resmi WhatsApp, email, dan alamat kantor akan otomatis diperbarui di seluruh halaman publik dan cetak.
              </p>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-cyan-200">
                <span className="font-semibold block mb-0.5">Verifikasi Otoritas:</span>
                Masukkan Kunci Keamanan Administrator untuk mengesahkan pembaruan identitas (Default: <strong className="text-white">2026</strong>).
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kunci Keamanan Administrator
                </label>
                <input
                  type="password"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmAuthorizedSave();
                    }
                  }}
                  placeholder="Masukkan Kunci Keamanan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF] font-mono text-center tracking-widest text-sm"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-slate-800 text-slate-300 font-heading font-semibold text-xs sm:text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAuthorizedSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-[#087BFF]/30 transition-all"
              >
                Konfirmasi & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-body">
          <div className="w-full max-w-md bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl p-6 text-white my-8">
            <h3 className="font-heading text-lg font-bold text-white mb-2">Reset Data Demo</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Apakah Anda yakin ingin mengembalikan seluruh kegiatan, peserta, dan sertifikat ke data demo awal (AI CEO Masterclass)?
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-[#101B55] text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={executeResetDemo}
                className="px-5 py-2 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-white font-heading font-bold text-xs"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGO SAVE CONFIRMATION MODAL */}
      {showLogoConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-body">
          <div className="w-full max-w-lg bg-[#050B2E] border-2 border-[#00E5FF] rounded-3xl p-6 sm:p-7 text-white shadow-[0_0_50px_rgba(0,229,255,0.3)] space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087BFF] to-[#00E5FF] p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#00E5FF]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-white">
                    Otorisasi Super Admin: Terapkan Logo
                  </h3>
                  <p className="text-xs text-slate-400 font-body">
                    Pembaruan logo resmi ARTAKARYA Creative Intelligence Lab
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Preview */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="p-3 rounded-xl bg-[#03071E] border border-blue-900 text-center space-y-1">
                <span className="text-[10px] font-stat text-slate-400 uppercase tracking-wider block">
                  Logo Lama (Aktif)
                </span>
                <div className="h-16 flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo Lama"
                      className="max-h-14 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-heading">
                      <Cpu className="w-5 h-5 text-[#00E5FF]" />
                      <span>Ikon Default</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#03071E] border border-emerald-500/50 text-center space-y-1">
                <span className="text-[10px] font-stat text-emerald-400 uppercase tracking-wider block font-bold">
                  Logo Baru (Diajukan)
                </span>
                <div className="h-16 flex items-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Baru"
                      className="max-h-14 max-w-full object-contain"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Logo lama <strong className="text-white">tidak akan hilang</strong> sebelum logo baru berhasil divalidasi dan disimpan secara permanen di server backend.
            </p>

            {/* Admin Key Input */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-heading font-semibold text-xs">
                Kunci Otorisasi Administrator *
              </label>
              <input
                type="password"
                value={logoAuthKeyInput}
                onChange={(e) => {
                  setLogoAuthKeyInput(e.target.value);
                  setLogoAuthError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmLogoSave();
                  }
                }}
                placeholder="Masukkan Kunci Administrator (cth: 2026)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03071E] border border-blue-800 text-white focus:outline-none focus:border-[#00E5FF] text-xs font-mono"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 block">
                Kunci default otorisasi: <code className="text-[#00E5FF] font-mono">2026</code> atau <code className="text-[#00E5FF] font-mono">ARTAKARYA-ADMIN</code>
              </span>
            </div>

            {logoAuthError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-heading flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{logoAuthError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => setShowLogoConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-blue-900/60 text-slate-300 text-xs font-heading font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogoSave}
                disabled={isSavingLogo}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-heading font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                {isSavingLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Server...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Verifikasi & Terapkan Logo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGO DELETE CONFIRMATION MODAL */}
      {showLogoDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-body">
          <div className="w-full max-w-md bg-[#050B2E] border-2 border-red-500/60 rounded-3xl p-6 text-white shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-white">
                    Hapus Logo Resmi Lembaga
                  </h3>
                  <p className="text-xs text-red-300 font-body">
                    Tindakan ini memerlukan otorisasi administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoDeleteModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Apakah Anda yakin ingin menghapus logo resmi dari server permanen? Tampilan pada seluruh header, halaman verifikasi, template sertifikat, dan file PDF akan kembali menggunakan ikon resmi ARTAKARYA.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-300 font-heading font-semibold text-xs">
                Kunci Otorisasi Administrator *
              </label>
              <input
                type="password"
                value={logoAuthKeyInput}
                onChange={(e) => {
                  setLogoAuthKeyInput(e.target.value);
                  setLogoAuthError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmLogoDelete();
                  }
                }}
                placeholder="Masukkan Kunci Administrator (cth: 2026)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#03071E] border border-red-900/60 text-white focus:outline-none focus:border-red-400 text-xs font-mono"
                autoFocus
              />
            </div>

            {logoAuthError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-heading flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{logoAuthError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => setShowLogoDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#101B55] text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogoDelete}
                disabled={isSavingLogo}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs flex items-center gap-2"
              >
                {isSavingLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Logo Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
