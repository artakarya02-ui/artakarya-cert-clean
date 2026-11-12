import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, Cpu, Lock } from 'lucide-react';

interface HumanVerificationProps {
  isVerified: boolean;
  onVerifyChange: (verified: boolean) => void;
  disabled?: boolean;
}

export const HumanVerification: React.FC<HumanVerificationProps> = ({
  isVerified,
  onVerifyChange,
  disabled = false,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleTrigger = () => {
    if (disabled || isVerified || isVerifying) return;

    setIsVerifying(true);
    // Simulate real security proof-of-work challenge (800ms)
    setTimeout(() => {
      const code = `AK-SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setVerificationCode(code);
      setIsVerifying(false);
      onVerifyChange(true);
    }, 750);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onVerifyChange(false);
    setVerificationCode('');
  };

  return (
    <div
      onClick={handleTrigger}
      className={`relative w-full p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 select-none ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-[#03071E] border-slate-800'
          : isVerified
          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-default'
          : 'bg-[#050B2E] border-[#00E5FF]/30 hover:border-[#00E5FF]/60 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Checkbox box */}
          <div
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
              isVerified
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : isVerifying
                ? 'bg-[#101B55] border-[#00E5FF] text-[#00E5FF]'
                : 'bg-[#101B55]/70 border-slate-600 text-transparent hover:border-[#00E5FF]'
            }`}
          >
            {isVerified && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            {isVerifying && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />}
          </div>

          <div>
            <p className="text-xs font-heading font-semibold text-white">
              {isVerified
                ? 'Verifikasi Manusia Berhasil'
                : isVerifying
                ? 'Memverifikasi Integritas Perangkat...'
                : 'Saya adalah Manusia (Human Verification)'}
            </p>
            <p className="text-[10px] text-slate-400 font-stat flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#00E5FF]" />
              <span>
                {isVerified
                  ? `Token Terverifikasi: ${verificationCode}`
                  : 'Klik kotak untuk validasi keamanan kriptografi'}
              </span>
            </p>
          </div>
        </div>

        {/* Turnstile / Lab Brand Badge */}
        <div className="flex flex-col items-end shrink-0 pl-2">
          <div className="flex items-center gap-1 text-[9px] font-stat font-extrabold text-[#00E5FF] uppercase tracking-wider">
            <Cpu className="w-3 h-3" />
            <span>ARTASECURITY</span>
          </div>
          <span className="text-[8px] text-slate-500">Zero-Bot Challenge</span>
        </div>
      </div>

      {isVerified && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-2 right-2 text-[9px] text-slate-500 hover:text-slate-300 font-mono underline"
        >
          Ulangi
        </button>
      )}
    </div>
  );
};
