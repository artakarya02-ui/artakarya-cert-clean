import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  Calendar,
  Building,
  User,
  Hash,
  FileText,
  AlertTriangle,
  Cpu,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { supabaseService } from '../../services/supabaseService';
import { CertificateRenderer } from '../../components/certificate/CertificateRenderer';
import { downloadCertificatePDF, printCertificate } from '../../utils/pdfExport';
import { CertificateItem } from '../../types';

interface DetailPageProps {
  certNumber?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({ certNumber, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const targetNumber = certNumber || 'AK-20261102-AICEO-001';
  const initialCert = storage.getCertificateByNumber(targetNumber) || storage.getCertificates()[0];
  const [cert, setCert] = useState<CertificateItem | undefined>(initialCert);

  React.useEffect(() => {
    // If not found locally or want to fetch fresh online record
    if (targetNumber) {
      supabaseService.getByNumber(targetNumber).then((onlineCert) => {
        if (onlineCert) setCert(onlineCert);
      }).catch(() => {});
    }
  }, [targetNumber]);

  const template = cert ? storage.getTemplateById(cert.templateId) : undefined;

  if (!cert) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#FFC857] mx-auto" />
        <h2 className="text-2xl font-heading font-bold text-white">Sertifikat Tidak Ditemukan</h2>
        <p className="text-slate-400 font-body">Nomor sertifikat "{targetNumber}" tidak terdaftar dalam sistem.</p>
        <button
          onClick={() => onNavigate('search')}
          className="px-5 py-2.5 rounded-xl bg-[#087BFF] text-white font-heading font-semibold text-sm"
        >
          Kembali ke Pencarian
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#087BFF', '#7928CA', '#E83EFF', '#FFC857'],
      });
      storage.incrementDownload(cert.id);
      await downloadCertificatePDF(cert);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify?cert=${encodeURIComponent(cert.certificateNumber)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#00E5FF]/20">
        <button
          onClick={() => onNavigate('search')}
          className="flex items-center gap-2 text-sm font-heading font-semibold text-slate-300 hover:text-[#00E5FF] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 text-[#00E5FF]" />
          <span>Kembali ke Pencarian</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-[#101B55]/60 hover:bg-[#101B55] border border-blue-900 text-slate-300 text-xs font-heading font-semibold flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#00E5FF]" />}
            <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
          </button>

          <button
            onClick={printCertificate}
            className="px-3.5 py-2 rounded-xl bg-[#101B55]/60 hover:bg-[#101B55] border border-blue-900 text-slate-300 text-xs font-heading font-semibold flex items-center gap-2 transition-colors no-print"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>Cetak (A4)</span>
          </button>

          <button
            onClick={() => onNavigate('verify', { certNumber: cert.certificateNumber })}
            className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-blue-900 border border-[#00E5FF]/40 text-cyan-300 text-xs font-heading font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
            <span>Verifikasi Keabsahan</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#087BFF] to-[#7928CA] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-transform hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isDownloading ? 'Menyiapkan PDF...' : 'Download PDF Resmi'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Certificate Showcase & Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Certificate Visual Display (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-stat font-semibold text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
              Pratinjau Dokumen Resolusi Penuh
            </span>
            <span className="text-xs text-slate-400 font-stat">
              Format: A4 Landscape • Standar Vektor Bersih
            </span>
          </div>

          {/* Interactive Clean Certificate Canvas */}
          <div className="p-3 sm:p-5 rounded-3xl bg-[#050B2E] border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(8,123,255,0.2)] overflow-x-auto">
            <CertificateRenderer certificate={cert} template={template} scale={1} />
          </div>

          {/* Verification Hash Note */}
          <div className="p-4 rounded-2xl bg-[#101B55]/50 border border-[#00E5FF]/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF] shrink-0" />
              <div className="space-y-0.5">
                <span className="font-heading font-bold text-white block">Tanda Tangan Kriptografis Sah</span>
                <span className="text-slate-400 font-stat break-all text-[11px]">
                  SHA-256: {cert.verificationHash}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-stat font-bold uppercase shrink-0">
              {cert.status}
            </span>
          </div>
        </div>

        {/* Certificate Metadata Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-6 rounded-3xl bg-[#101B55]/50 border border-blue-900/60 shadow-xl backdrop-blur-xl space-y-5">
            <div className="border-b border-blue-900/60 pb-3">
              <span className="text-[11px] font-stat font-bold text-[#00E5FF] uppercase tracking-wider block">
                Metadata Kredensial
              </span>
              <h3 className="font-heading text-xl font-bold text-white mt-0.5">
                Rincian Sertifikat
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-body">
              <div>
                <span className="text-slate-400 text-xs block mb-1">Nomor Seri Sertifikat</span>
                <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-900 font-stat font-bold text-[#00E5FF] flex items-center justify-between">
                  <span>{cert.certificateNumber}</span>
                  <span className="text-[10px] text-slate-500 font-stat">RESMI</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs block mb-1">Penerima Penghargaan</span>
                <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-900 text-white">
                  <p className="text-sm font-heading font-extrabold text-white">{cert.participantName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cert.participantEmail}</p>
                  {cert.participantOrg && (
                    <p className="text-xs text-cyan-300 font-semibold mt-0.5">{cert.participantOrg}</p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs block mb-1">Program Pelatihan / Kegiatan</span>
                <div className="p-3 rounded-xl bg-[#050B2E] border border-blue-900">
                  <p className="font-heading font-bold text-white">{cert.eventTitle}</p>
                  <p className="text-xs text-slate-300 italic mt-0.5">{cert.eventSubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-stat">
                <div className="p-2.5 rounded-xl bg-[#050B2E] border border-blue-900">
                  <span className="text-slate-500 block text-[10px]">Tanggal Acara</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{cert.eventDate}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#050B2E] border border-blue-900">
                  <span className="text-slate-500 block text-[10px]">Tanggal Terbit</span>
                  <span className="font-semibold text-[#00E5FF] mt-0.5 block">{cert.issueDate}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-xs font-body">
                <span className="text-slate-500 block text-[10px] font-stat">Penyelenggara Resmi</span>
                <span className="font-heading font-bold text-white mt-0.5 block">{cert.organizer}</span>
              </div>

              <div className="border-t border-blue-900/60 pt-3">
                <span className="text-slate-400 text-xs block mb-2 font-heading font-semibold">Penandatangan Resmi:</span>
                <ul className="space-y-2 text-xs font-body">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-bold text-slate-200">{cert.signer1.name}</p>
                      <p className="text-[11px] text-slate-400">{cert.signer1.title}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-bold text-slate-200">{cert.signer2.name}</p>
                      <p className="text-[11px] text-slate-400">{cert.signer2.title}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-blue-900/60 font-stat">
                <span>Diunduh: <strong className="text-white">{cert.downloadCount} kali</strong></span>
                {cert.lastDownloadedAt && <span>Terakhir: {cert.lastDownloadedAt}</span>}
              </div>

            </div>
          </div>

          {/* Verification CTA Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#101B55] to-[#050B2E] border border-[#00E5FF]/40 text-center space-y-3 shadow-lg">
            <Cpu className="w-8 h-8 text-[#00E5FF] mx-auto" />
            <h4 className="font-heading font-bold text-white text-sm">Otentikasi Publik Kredensial</h4>
            <p className="text-xs text-slate-300 font-body">
              Gunakan sistem verifikasi kami untuk membuktikan keaslian dokumen ini secara real-time di hadapan pihak ketiga.
            </p>
            <button
              onClick={() => onNavigate('verify', { certNumber: cert.certificateNumber })}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#7928CA] hover:opacity-95 text-white font-heading font-bold text-xs transition-all shadow-md"
            >
              Cek Halaman Verifikasi
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
