import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  X,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  authService,
  AUTHORIZED_ADMIN_EMAIL,
  RECOVERY_SECURITY_CODE,
} from '../../services/authService';
import { HumanVerification } from './HumanVerification';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Input fields EMPTY on open as required
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Recovery / Lupa Password Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Reset fields on modal open
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setHumanVerified(false);
      setErrorMessage(null);
      setSuccessNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct Email & Password Login (No routine WhatsApp OTP)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email resmi administrator.');
      return;
    }

    if (!password) {
      setErrorMessage('Harap masukkan kata sandi administrator.');
      return;
    }

    if (!humanVerified) {
      setErrorMessage('Harap selesaikan verifikasi manusia terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.login(email, password, humanVerified);
      if (res.success) {
        setSuccessNotice('Autentikasi berhasil! Mengalihkan ke Command Center...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memproses login. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Lupa Password Recovery
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryEmail.trim()) {
      setRecoveryError('Harap masukkan email administrator.');
      return;
    }

    if (!recoveryCode.trim()) {
      setRecoveryError('Harap masukkan kode keamanan pemulihan.');
      return;
    }

    if (newPassword.length < 8) {
      setRecoveryError('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsRecovering(true);
    try {
      const res = await authService.forgotPassword(recoveryEmail, recoveryCode, newPassword);
      if (res.success) {
        setRecoverySuccess(res.message);
        setTimeout(() => {
          setShowRecoveryModal(false);
          setRecoverySuccess(null);
          setPassword('');
          setErrorMessage(null);
          setSuccessNotice('Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.');
        }, 1500);
      } else {
        setRecoveryError(res.message);
      }
    } catch {
      setRecoveryError('Terjadi kendala saat memproses pemulihan kata sandi.');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_60px_rgba(8,123,255,0.35)] p-5 sm:p-8 text-white max-h-[94vh] overflow-y-auto">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header & Mandatory Exclusive Disclaimer */}
          <div className="text-center pb-4 sm:pb-5 border-b border-[#101B55]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shadow-[0_0_25px_rgba(0,229,255,0.4)] mb-2.5">
              <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#00E5FF]" />
              </div>
            </div>

            {/* EXACT MANDATORY HEADLINE & NOTICE */}
            <h2 className="font-heading text-lg sm:text-2xl font-black text-white tracking-wider">
              AKSES KHUSUS ADMIN ARTAKARYA
            </h2>
            <p className="text-[11px] sm:text-xs text-cyan-300 font-body mt-2 leading-relaxed max-w-sm mx-auto font-medium bg-[#101B55]/70 p-2.5 rounded-xl border border-[#00E5FF]/30">
              "Halaman ini hanya diperuntukkan bagi Administrator Resmi ARTAKARYA. Akses tidak tersedia untuk peserta maupun pengguna umum."
            </p>

            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className="text-[9px] sm:text-[10px] font-stat font-extrabold uppercase tracking-widest text-[#00E5FF] px-2.5 py-0.5 rounded-full bg-[#03071E] border border-[#00E5FF]/30 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Otoritas: ADMIN & SUPER_ADMIN</span>
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="my-3.5 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="my-3.5 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successNotice}</div>
            </div>
          )}

          {/* Direct Email & Password Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4 pt-3">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-slate-200">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artakarya03@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#101B55]/70 border border-blue-900 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors disabled:opacity-50"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-heading font-bold text-slate-200">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[11px] text-[#00E5FF] hover:underline font-heading font-semibold"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi admin..."
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#101B55]/70 border border-blue-900 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors disabled:opacity-50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00E5FF] p-1 transition-colors"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Human Verification (CAPTCHA) */}
            <div className="pt-0.5">
              <HumanVerification
                isVerified={humanVerified}
                onVerifyChange={setHumanVerified}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(8,123,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="pt-2 text-center text-[10px] sm:text-[11px] text-slate-400 font-body">
              <p className="flex items-center justify-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Koneksi terenkripsi end-to-end • Akses kompatibel untuk HP Android & Komputer</span>
              </p>
            </div>

          </form>

        </div>
      </div>

      {/* LUPA PASSWORD / RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#050B2E] border border-cyan-400/40 rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.25)] p-5 sm:p-7 text-white max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setShowRecoveryModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1 rounded-xl"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3.5 border-b border-[#101B55]">
              <div className="w-10 h-10 rounded-2xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                  Pemulihan Kata Sandi Admin
                </h3>
                <p className="text-[11px] text-slate-400 font-body">
                  ARTAKARYA Creative Intelligence Lab
                </p>
              </div>
            </div>

            {recoveryError && (
              <div className="mt-3.5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="mt-3.5 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-300">
                  Email Administrator
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="artakarya03@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-300 flex items-center justify-between">
                  <span>Kode Keamanan Pemulihan</span>
                  <span className="text-[10px] text-cyan-300 font-mono">Kode Resmi</span>
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Masukkan kode otorisasi pemulihan..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
                />
                <p className="text-[10px] text-slate-400">
                  Masukkan kode otorisasi pemulihan rahasia yang terdaftar pada Dewan Administrator.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-300">
                  Kata Sandi Baru (Min. 8 karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-300">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#101B55]/60 hover:bg-[#101B55] text-slate-300 font-heading font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  {isRecovering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Atur Ulang Sandi</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
