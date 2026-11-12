import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CertificateItem, CertificateTemplate } from '../../types';
import { ShieldCheck, Award, QrCode, Cpu, CheckCircle } from 'lucide-react';
import { DEFAULT_CUSTOM_ELEMENTS_CONFIG } from '../../services/templateStorage';
import { storage } from '../../services/storage';
import { getOfficialVerificationUrl } from '../../utils/verificationUrl';

interface CertificateRendererProps {
  certificate: CertificateItem;
  template?: CertificateTemplate;
  scale?: number;
  showWatermark?: boolean;
  className?: string;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  certificate,
  template,
  scale = 1,
  showWatermark = true,
  className = '',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
    return unsub;
  }, []);

  // Target official public verification URL for QR code (Protected against dev URLs)
  const verificationUrl = getOfficialVerificationUrl(certificate.certificateNumber, settings.website);

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#050B2E',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate certificate QR code:', err));
  }, [verificationUrl]);

  const isPortrait = template?.orientation === 'portrait';
  const aspectRatio = isPortrait ? '1 / 1.414' : '1.414 / 1';
  const maxWidth = isPortrait ? `${680 * scale}px` : `${960 * scale}px`;

  // If template has an uploaded background image
  if (template?.backgroundImageUrl) {
    const cfg = template.elementsConfig || DEFAULT_CUSTOM_ELEMENTS_CONFIG;
    
    return (
      <div
        id="certificate-print-area"
        className={`relative select-none overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 border border-slate-700 bg-white ${className}`}
        style={{
          aspectRatio,
          width: '100%',
          maxWidth,
          margin: '0 auto',
        }}
      >
        {/* Uploaded High-Res Certificate Background Image */}
        <img
          src={template.backgroundImageUrl}
          alt={template.name}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />

        {/* Certificate Title */}
        {cfg.certificateTitle?.show !== false && (
          <div
            className="absolute pointer-events-none select-none"
            style={{
              left: `${cfg.certificateTitle.xPercent}%`,
              top: `${cfg.certificateTitle.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: cfg.certificateTitle.align || 'center',
              color: cfg.certificateTitle.color || '#050B2E',
              fontFamily: cfg.certificateTitle.fontFamily || 'Plus Jakarta Sans',
              fontSize: `clamp(12px, ${cfg.certificateTitle.fontSizePt * 1.15 * scale}px, 32px)`,
              fontWeight: cfg.certificateTitle.isBold !== false ? 800 : 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              width: '85%',
            }}
          >
            {cfg.certificateTitle.customText || 'SERTIFIKAT PENGHARGAAN'}
          </div>
        )}

        {/* Recipient Name (Prominent) */}
        {cfg.recipientName?.show !== false && (
          <div
            className="absolute pointer-events-none select-none"
            style={{
              left: `${cfg.recipientName.xPercent}%`,
              top: `${cfg.recipientName.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: cfg.recipientName.align || 'center',
              color: cfg.recipientName.color || '#050B2E',
              fontFamily: cfg.recipientName.fontFamily || 'Plus Jakarta Sans',
              fontSize: `clamp(16px, ${cfg.recipientName.fontSizePt * 1.25 * scale}px, 42px)`,
              fontWeight: cfg.recipientName.isBold !== false ? 900 : 600,
              letterSpacing: '-0.01em',
              width: '90%',
            }}
          >
            <span>{certificate.participantName}</span>
            {certificate.participantOrg && (
              <span
                className="block font-medium tracking-normal mt-0.5"
                style={{
                  fontSize: `clamp(9px, ${cfg.recipientName.fontSizePt * 0.45 * scale}px, 16px)`,
                  color: '#087BFF',
                }}
              >
                {certificate.participantOrg}
              </span>
            )}
          </div>
        )}

        {/* Event Title */}
        {cfg.eventTitle?.show !== false && (
          <div
            className="absolute pointer-events-none select-none"
            style={{
              left: `${cfg.eventTitle.xPercent}%`,
              top: `${cfg.eventTitle.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: cfg.eventTitle.align || 'center',
              color: cfg.eventTitle.color || '#087BFF',
              fontFamily: cfg.eventTitle.fontFamily || 'Plus Jakarta Sans',
              fontSize: `clamp(11px, ${cfg.eventTitle.fontSizePt * 1.15 * scale}px, 26px)`,
              fontWeight: cfg.eventTitle.isBold !== false ? 800 : 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              width: '85%',
            }}
          >
            <div>{certificate.eventTitle}</div>
            {certificate.eventSubtitle && (
              <div
                className="font-normal italic normal-case tracking-normal opacity-85 mt-0.5"
                style={{ fontSize: `clamp(9px, ${cfg.eventTitle.fontSizePt * 0.65 * scale}px, 14px)` }}
              >
                "{certificate.eventSubtitle}"
              </div>
            )}
          </div>
        )}

        {/* Certificate Number */}
        {cfg.certificateNumber?.show !== false && (
          <div
            className="absolute pointer-events-none select-none font-mono"
            style={{
              left: `${cfg.certificateNumber.xPercent}%`,
              top: `${cfg.certificateNumber.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: cfg.certificateNumber.align || 'center',
              color: cfg.certificateNumber.color || '#64748B',
              fontSize: `clamp(8px, ${cfg.certificateNumber.fontSizePt * 1.05 * scale}px, 14px)`,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            NO: {certificate.certificateNumber}
          </div>
        )}

        {/* Issue Date */}
        {cfg.issueDate?.show !== false && (
          <div
            className="absolute pointer-events-none select-none font-sans"
            style={{
              left: `${cfg.issueDate.xPercent}%`,
              top: `${cfg.issueDate.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: cfg.issueDate.align || 'center',
              color: cfg.issueDate.color || '#64748B',
              fontSize: `clamp(8px, ${cfg.issueDate.fontSizePt * 1.05 * scale}px, 14px)`,
              fontWeight: 500,
            }}
          >
            {certificate.issueDate}
          </div>
        )}

        {/* Scannable High-Res QR Code */}
        {cfg.qrCode?.show !== false && (
          <div
            className="absolute pointer-events-none select-none flex flex-col items-center justify-center p-1 rounded-lg bg-white/95 border border-slate-300 shadow-sm"
            style={{
              left: `${cfg.qrCode.xPercent}%`,
              top: `${cfg.qrCode.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              width: `${(cfg.qrCode.sizePercent || 12) * scale * 5.5}px`,
              height: `${(cfg.qrCode.sizePercent || 12) * scale * 5.5}px`,
            }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-full h-full text-[#050B2E]" />
            )}
          </div>
        )}

        {/* Dual Signatures */}
        {cfg.signatures?.show !== false && (
          <div
            className="absolute pointer-events-none select-none flex items-center justify-between px-6 w-3/4"
            style={{
              left: `${cfg.signatures?.xPercent || 50}%`,
              top: `${cfg.signatures?.yPercent || 88}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="text-center">
              <p
                className="font-bold border-b border-slate-400 pb-0.5"
                style={{
                  fontSize: `clamp(8px, 10 * ${scale}px, 13px)`,
                  color: '#050B2E',
                }}
              >
                {cfg.signatures?.signer1Name || certificate.signer1.name}
              </p>
              <p
                className="text-slate-500 pt-0.5"
                style={{ fontSize: `clamp(7px, 8.5 * ${scale}px, 11px)` }}
              >
                {cfg.signatures?.signer1Title || certificate.signer1.title}
              </p>
            </div>

            <div className="text-center">
              <p
                className="font-bold border-b border-slate-400 pb-0.5"
                style={{
                  fontSize: `clamp(8px, 10 * ${scale}px, 13px)`,
                  color: '#050B2E',
                }}
              >
                {cfg.signatures?.signer2Name || certificate.signer2.name}
              </p>
              <p
                className="text-slate-500 pt-0.5"
                style={{ fontSize: `clamp(7px, 8.5 * ${scale}px, 11px)` }}
              >
                {cfg.signatures?.signer2Title || certificate.signer2.title}
              </p>
            </div>
          </div>
        )}

        {/* Official Brand Logo (Custom Template Overlay) */}
        {cfg.logo?.show !== false && settings.logoUrl && (
          <div
            className="absolute pointer-events-none select-none flex items-center justify-center"
            style={{
              left: `${cfg.logo?.xPercent || 50}%`,
              top: `${cfg.logo?.yPercent || 15}%`,
              transform: 'translate(-50%, -50%)',
              maxWidth: `${(cfg.logo?.sizePercent || 15) * scale * 5.5}px`,
              maxHeight: `${(cfg.logo?.sizePercent || 15) * scale * 3.5}px`,
            }}
          >
            <img
              src={settings.logoUrl}
              alt="Logo Resmi"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Revoked Banner */}
        {certificate.status === 'DICABUT' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-red-600 text-white font-heading font-black text-xl sm:text-3xl px-8 py-3 rounded-xl border-4 border-white shadow-2xl z-30 uppercase tracking-widest">
            SERTIFIKAT DICABUT / INVALID
          </div>
        )}
      </div>
    );
  }

  // Always clean Ivory/White background as requested for maximum readability & printability
  const bgStyle = 'bg-[#FFFDF9] text-[#050B2E]';

  return (
    <div
      id="certificate-print-area"
      className={`relative select-none overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 border border-slate-200 ${bgStyle} ${className}`}
      style={{
        aspectRatio,
        width: '100%',
        maxWidth,
        margin: '0 auto',
      }}
    >
      {/* Background Subtle Cyber Geometric Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cert-digital-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#087BFF" strokeWidth="0.75" />
              <circle cx="15" cy="15" r="1.5" fill="#7928CA" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cert-digital-grid)" />
        </svg>
      </div>

      {/* Outer Border with ARTAKARYA Gradient Accents */}
      <div className="absolute inset-3 sm:inset-4 md:inset-5 border-2 border-slate-300 pointer-events-none rounded-xl">
        <div className="absolute inset-1 sm:inset-1.5 border border-slate-200 rounded-lg" />
        
        {/* Geometric Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-[#087BFF] rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-[#087BFF] rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-[#087BFF] rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-[#087BFF] rounded-br-lg" />
      </div>

      {/* Revoked Overlay if status is DICABUT */}
      {certificate.status === 'DICABUT' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-red-600 text-white font-heading font-black text-xl sm:text-3xl px-8 py-3 rounded-xl border-4 border-white shadow-2xl z-30 uppercase tracking-widest">
          SERTIFIKAT DICABUT / INVALID
        </div>
      )}

      {/* Inner Certificate Content Container */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${isPortrait ? 'p-6 sm:p-8' : 'p-6 sm:p-8 md:p-12'} text-center`}>
        
        {/* Top Header: Organization & Serial Number */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-4 px-2 sm:px-6">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <div className="h-9 sm:h-11 flex items-center justify-center">
                  <img
                    src={settings.logoUrl}
                    alt="Logo Resmi ARTAKARYA"
                    className="max-h-9 sm:max-h-11 w-auto max-w-[120px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-[#050B2E] rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E5FF]" />
                  </div>
                </div>
              )}
              <div className="text-left">
                <span className="block font-heading font-black text-xs sm:text-sm tracking-wider text-[#050B2E]">
                  ARTAKARYA
                </span>
                <span className="block text-[8px] sm:text-[10px] font-stat text-[#087BFF] font-bold uppercase tracking-wider">
                  CREATIVE INTELLIGENCE LAB
                </span>
              </div>
            </div>

            {/* Right: Verified Serial Number */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-stat font-bold tracking-wider border border-[#087BFF]/30 bg-blue-50 text-[#087BFF]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087BFF]" />
                <span>NO: {certificate.certificateNumber}</span>
              </span>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="mt-1 sm:mt-2">
            <h1 className="font-heading text-lg sm:text-2xl md:text-3xl font-black tracking-widest text-[#050B2E] uppercase">
              SERTIFIKAT PENGHARGAAN
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm font-stat font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              CERTIFICATE OF ACCOMPLISHMENT & PARTICIPATION
            </p>
          </div>
        </div>

        {/* Recipient Section (Main Focus) */}
        <div className="my-auto py-2 sm:py-3">
          <p className="text-[11px] sm:text-xs md:text-sm font-body text-slate-600">
            Diberikan dengan hormat dan apresiasi tertinggi kepada:
          </p>

          {/* Big Prominent Name */}
          <div className="relative inline-block my-2 sm:my-3 max-w-full">
            <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-[#050B2E] px-4 py-1 tracking-tight">
              {certificate.participantName}
            </h2>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#087BFF] to-transparent mx-auto mt-1" />
            {certificate.participantOrg && (
              <p className="text-[11px] sm:text-xs text-[#087BFF] font-heading font-bold tracking-wide mt-1">
                {certificate.participantOrg}
              </p>
            )}
          </div>

          <p className="max-w-2xl mx-auto text-[10px] sm:text-xs md:text-sm leading-relaxed text-slate-600 px-4 font-body">
            Atas partisipasi aktif, dedikasi, dan keberhasilan menyelesaikan seluruh kurikulum program:
          </p>

          {/* Event Title */}
          <div className="mt-2 sm:mt-3 px-2">
            <h3 className="font-heading font-extrabold text-base sm:text-xl md:text-2xl text-[#101B55] tracking-wide uppercase">
              {certificate.eventTitle}
            </h3>
            {certificate.eventSubtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-500 italic mt-0.5 font-heading">
                "{certificate.eventSubtitle}"
              </p>
            )}
            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-1 font-body">
              Diselenggarakan oleh <strong className="text-[#050B2E] font-bold">{certificate.organizer}</strong> pada tanggal {certificate.eventDate}
            </p>
          </div>
        </div>

        {/* Footer: Dual Signatures, Modern Lab Medallion, and QR Code */}
        <div className="pt-2 sm:pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 items-end px-2 sm:px-6">
            
            {/* Signer 1 */}
            <div className="text-center">
              <div className="h-10 sm:h-12 md:h-14 flex items-center justify-center">
                <svg className="w-28 sm:w-36 h-10 text-[#087BFF] opacity-90" viewBox="0 0 160 50">
                  <path
                    d="M 10 30 Q 30 10 50 32 T 90 20 T 120 35 T 150 15"
                    fill="none"
                    stroke="#087BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 40 40 Q 80 42 120 38"
                    fill="none"
                    stroke="#087BFF"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
              <p className="font-heading font-bold text-[10px] sm:text-xs text-[#050B2E] border-t border-slate-300 pt-1">
                {certificate.signer1.name}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-body">
                {certificate.signer1.title}
              </p>
            </div>

            {/* Central Modern ARTAKARYA Lab Medallion */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full p-1 bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-white bg-gradient-to-b from-[#101B55] to-[#050B2E] flex flex-col items-center justify-center text-center p-1 text-white">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF] mb-0.5" />
                  <span className="font-heading font-black text-[7px] sm:text-[8px] tracking-tight leading-none uppercase text-white">
                    ARTAKARYA
                  </span>
                  <span className="text-[5px] sm:text-[6px] font-stat font-bold tracking-widest uppercase text-[#00E5FF]">
                    SEAL OF EXCELLENCE
                  </span>
                </div>
              </div>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-stat mt-1">
                Terbit: {certificate.issueDate}
              </span>
            </div>

            {/* Signer 2 */}
            <div className="text-center">
              <div className="h-10 sm:h-12 md:h-14 flex items-center justify-center">
                <svg className="w-28 sm:w-36 h-10 text-[#087BFF] opacity-90" viewBox="0 0 160 50">
                  <path
                    d="M 15 25 Q 45 40 70 15 T 115 35 T 145 20"
                    fill="none"
                    stroke="#087BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 30 38 Q 75 36 125 40"
                    fill="none"
                    stroke="#087BFF"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
              <p className="font-heading font-bold text-[10px] sm:text-xs text-[#050B2E] border-t border-slate-300 pt-1">
                {certificate.signer2.name}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-body">
                {certificate.signer2.title}
              </p>
            </div>
          </div>

          {/* Bottom Security Hash & Scannable QR Bar */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[8px] sm:text-[9px] text-slate-500 font-stat">
            <div className="flex items-center gap-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-6 h-6 border border-slate-300 rounded" />
              ) : (
                <QrCode className="w-4 h-4 text-[#087BFF]" />
              )}
              <span>VERIFIKASI RESMI: {verificationUrl}</span>
            </div>
            <div className="truncate max-w-[200px] sm:max-w-[320px] text-slate-400">
              HASH SHA-256: {certificate.verificationHash.slice(0, 24)}...
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
