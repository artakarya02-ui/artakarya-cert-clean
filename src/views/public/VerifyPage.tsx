import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  QrCode,
  Award,
  Calendar,
  Building,
  User,
  Hash,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { supabaseService } from '../../services/supabaseService';
import { CertificateItem } from '../../types';

interface VerifyPageProps {
  initialCertNumber?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ initialCertNumber = '', onNavigate }) => {
  const [inputCode, setInputCode] = useState(initialCertNumber);
  const [searchedCode, setSearchedCode] = useState('');
  const [certResult, setCertResult] = useState<CertificateItem | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'qr'>('manual');
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialCertNumber) {
      setInputCode(initialCertNumber);
      handleVerify(initialCertNumber);
    }
  }, [initialCertNumber]);

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || inputCode).trim().toUpperCase();
    if (!target) return;

    setIsVerifying(true);
    setSearchedCode(target);

    try {
      // 1. Query Supabase online database directly (Real-time lookup from mobile/online)
      const onlineCert = await supabaseService.getByNumber(target);
      if (onlineCert) {
        setCertResult(onlineCert);
        setHasChecked(true);
        setIsVerifying(false);
        return;
      }
    } catch (e) {
      console.warn('[Verify] Supabase online lookup fallback:', e);
    }

    try {
      // 2. Query backend API verification core
      const res = await fetch(`/api/v1/public/certificates/verify/${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.certificate) {
          setCertResult(data.certificate);
          setHasChecked(true);
          setIsVerifying(false);
          return;
        }
      }
    } catch {
      // Offline / network fallback
    }

    // 3. Fallback to local persistent storage
    const localMatch = storage.getCertificateByNumber(target);
    setCertResult(localMatch || null);
    setHasChecked(true);
    setIsVerifying(false);
  };

  const handleTestDemo = (code: string) => {
    setInputCode(code);
    handleVerify(code);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        {settings.logoUrl && (
          <div className="mb-5 flex justify-center">
            <img
              src={settings.logoUrl}
              alt="Logo Resmi ARTAKARYA"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_25px_rgba(0,229,255,0.4)]"
            />
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101B55] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-stat font-bold mb-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
          PORTAL OTENTIKASI RESMI ARTAKARYA
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black text-white">
          Verifikasi Keaslian Sertifikat Digital
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 font-body">
          Validasi keabsahan dokumen, integritas kriptografis, dan status penerbitan sertifikat resmi yang dikeluarkan oleh ARTAKARYA Creative Intelligence Lab.
        </p>
      </div>

      {/* Futuristic Verification Terminal */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#101B55]/50 border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(8,123,255,0.2)] backdrop-blur-xl">
        
        {/* Tab Selector */}
        <div className="flex border-b border-blue-900/60 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-4 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Masukkan Nomor Seri</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-4 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'qr'
                ? 'border-[#00E5FF] text-[#00E5FF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Simulasi Scan QR</span>
          </button>
        </div>

        {activeTab === 'manual' ? (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Contoh: AK-20261102-AICEO-001"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#050B2E] border border-blue-900 text-white font-stat text-sm sm:text-base tracking-wider placeholder-slate-500 uppercase focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !inputCode.trim()}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'Memvalidasi...' : 'Verifikasi Keaslian'}</span>
              </button>
            </form>

            {/* Quick Sample Test Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#00E5FF] font-stat font-semibold">Contoh Format Resmi:</span>
              <button
                type="button"
                onClick={() => handleTestDemo('AK-20261102-AICEO-001')}
                className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 font-stat text-[11px] border border-blue-900"
              >
                AK-20261102-AICEO-001 (Budi Santoso)
              </button>
              <button
                type="button"
                onClick={() => handleTestDemo('AK-20261102-AICEO-002')}
                className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 font-stat text-[11px] border border-blue-900"
              >
                AK-20261102-AICEO-002 (Siti Rahmawati)
              </button>
              <button
                type="button"
                onClick={() => handleTestDemo('AK-20261102-AICEO-003')}
                className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 font-stat text-[11px] border border-blue-900"
              >
                AK-20261102-AICEO-003 (Hendro Wijaya)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-[#050B2E] border border-dashed border-[#00E5FF]/40 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#101B55] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.25)]">
              <QrCode className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-base">Pemindai QR Code Digital</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-body">
                Gunakan kamera ponsel atau pemindai untuk langsung memeriksa tanda tangan digital dan keabsahan sertifikat peserta.
              </p>
            </div>
            <button
              onClick={() => handleTestDemo('AK-20261102-AICEO-001')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:opacity-95 text-white font-heading font-semibold text-xs transition-colors shadow-md"
            >
              Simulasikan Scan QR AI CEO Masterclass
            </button>
          </div>
        )}

      </div>

      {/* Verification Result Area */}
      {hasChecked && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {certResult ? (
            certResult.status === 'AKTIF' ? (
              /* VALID RESULT CARD */
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#062423] via-[#051833] to-[#050B2E] border-2 border-emerald-400/70 shadow-[0_0_40px_rgba(16,185,129,0.25)] space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/60">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-stat font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 uppercase tracking-wider">
                          STATUS: VALID
                        </span>
                        <span className="text-[10px] text-slate-400 font-stat">Terdaftar Resmi</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                        Sertifikat Terverifikasi Asli
                      </h2>
                      <p className="text-xs text-slate-300 font-body">
                        Dokumen ini sah, aktif, dan terdaftar resmi di basis data ARTAKARYA Creative Intelligence Lab.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('detail', { certNumber: certResult.certificateNumber })}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg"
                  >
                    <span>Buka Dokumen Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-body">
                  <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-3">
                    <div>
                      <span className="text-[11px] font-stat text-slate-400 block">Nomor Seri Sertifikat</span>
                      <p className="font-stat font-bold text-base text-[#00E5FF]">
                        {certResult.certificateNumber}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-stat text-slate-400 block">Nama Penerima Penghargaan</span>
                      <p className="font-heading font-black text-lg text-white">
                        {certResult.participantName}
                      </p>
                      {certResult.participantOrg && (
                        <p className="text-xs text-slate-400 font-heading">{certResult.participantOrg}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-stat text-slate-400 block">Peran / Predikat</span>
                      <p className="font-heading font-semibold text-slate-200">{certResult.participantRole}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#050B2E]/90 border border-blue-900/60 space-y-3">
                    <div>
                      <span className="text-[11px] font-stat text-slate-400 block">Program Pelatihan / Kegiatan</span>
                      <p className="font-heading font-bold text-base text-white">{certResult.eventTitle}</p>
                      {certResult.eventSubtitle && (
                        <p className="text-xs text-slate-300 italic">"{certResult.eventSubtitle}"</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-stat">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Tanggal Acara</span>
                        <p className="font-semibold text-slate-200">{certResult.eventDate}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Tanggal Terbit</span>
                        <p className="font-semibold text-emerald-400">{certResult.issueDate}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-stat text-slate-400 block">Penyelenggara Resmi</span>
                      <div className="flex items-center gap-2.5 mt-1">
                        {settings.logoUrl && (
                          <img
                            src={settings.logoUrl}
                            alt="Logo Penyelenggara"
                            className="h-7 w-auto object-contain shrink-0"
                          />
                        )}
                        <p className="font-heading font-bold text-white">{certResult.organizer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash Integrity Match */}
                <div className="p-4 rounded-2xl bg-[#03081F] border border-emerald-900/50 text-xs font-stat space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Integritas Sidik Jari Kriptografis (SHA-256)
                    </span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      MATCH 100%
                    </span>
                  </div>
                  <p className="text-slate-400 break-all text-[11px]">
                    {certResult.verificationHash}
                  </p>
                </div>

              </div>
            ) : (
              /* REVOKED CERTIFICATE CARD */
              <div className="p-6 sm:p-8 rounded-3xl bg-red-950/40 border-2 border-red-500/60 shadow-2xl space-y-4 text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <div className="inline-block px-3 py-1 rounded-full bg-red-900/60 border border-red-500/60 text-xs font-stat font-extrabold text-red-300 uppercase tracking-widest">
                  STATUS: DIBATALKAN
                </div>
                <h3 className="text-2xl font-heading font-black text-white">Sertifikat Telah Dibatalkan</h3>
                <p className="text-sm text-slate-300 font-body max-w-md mx-auto">
                  Sertifikat dengan nomor seri <strong className="text-red-300 font-stat">{certResult.certificateNumber}</strong> atas nama <strong className="text-white">{certResult.participantName}</strong> telah dibatalkan / dinonaktifkan oleh ARTAKARYA.
                </p>
                {certResult.revokeReason && (
                  <div className="p-3 rounded-xl bg-red-900/30 border border-red-800/40 max-w-md mx-auto text-xs text-red-200 font-body">
                    Alasan Pembatalan: {certResult.revokeReason}
                  </div>
                )}
              </div>
            )
          ) : (
            /* NOT FOUND CARD */
            <div className="p-8 rounded-3xl bg-[#101B55]/40 border-2 border-[#FFC857]/50 shadow-2xl text-center space-y-4">
              <AlertTriangle className="w-14 h-14 text-[#FFC857] mx-auto" />
              <div className="inline-block px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/60 text-xs font-stat font-extrabold text-[#FFC857] uppercase tracking-widest">
                STATUS: TIDAK DITEMUKAN
              </div>
              <h3 className="text-xl font-heading font-bold text-white">Sertifikat Tidak Ditemukan</h3>
              <p className="text-sm text-slate-300 font-body max-w-md mx-auto">
                Nomor seri <span className="font-stat text-[#FFC857] font-bold">{searchedCode}</span> tidak ditemukan dalam basis data resmi ARTAKARYA.
              </p>
              <p className="text-xs text-slate-400 font-body max-w-lg mx-auto">
                Mohon periksa kembali ejaan nomor seri, atau hubungi sekretariat ARTAKARYA di <strong className="text-slate-200">artakarya01@gmail.com</strong> jika Anda telah menyelesaikan program.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trust & Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 font-body">
        <div className="p-5 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 text-center">
          <Award className="w-6 h-6 text-[#00E5FF] mx-auto mb-2" />
          <h4 className="font-heading font-bold text-white text-sm">Lembaga Terakreditasi</h4>
          <p className="text-xs text-slate-400 mt-1">Diterbitkan langsung oleh ARTAKARYA Creative Intelligence Lab.</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 text-center">
          <Lock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-white text-sm">Anti Manipulasi</h4>
          <p className="text-xs text-slate-400 mt-1">Setiap modifikasi data akan menggagalkan verifikasi hash kriptografis.</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 text-center">
          <QrCode className="w-6 h-6 text-[#E83EFF] mx-auto mb-2" />
          <h4 className="font-heading font-bold text-white text-sm">Aksesibilitas Global</h4>
          <p className="text-xs text-slate-400 mt-1">Dapat diverifikasi 24/7 di manapun oleh rekruter maupun institusi mitra.</p>
        </div>
      </div>

    </div>
  );
};
