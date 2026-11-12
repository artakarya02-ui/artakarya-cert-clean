import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  MapPin,
  ExternalLink,
  Cpu,
  Sparkles,
  MessageCircle,
  Instagram,
  Youtube,
  FileText,
  X,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

type LegalModalType = 'about' | 'privacy' | 'terms' | null;

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState(storage.getSettings());
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
    });
    return unsub;
  }, []);

  return (
    <>
      <footer className="bg-[#03071E] border-t border-[#00E5FF]/20 text-slate-400 text-sm font-body relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#087BFF]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7928CA]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* BAGIAN A: BRAND PROFILE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <div className="h-10 flex items-center justify-center shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt="Logo Resmi ARTAKARYA"
                      className="max-h-10 w-auto max-w-[130px] object-contain drop-shadow-[0_2px_10px_rgba(0,229,255,0.3)]"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
                    <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-heading text-lg font-black tracking-wider text-white block">
                    {settings.brandName || 'ARTAKARYA'}
                  </span>
                  <p className="text-[10px] text-[#00E5FF] font-stat font-bold tracking-widest uppercase">
                    CREATIVE INTELLIGENCE LAB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-white font-heading font-semibold">
                  {settings.organizationName}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  {settings.profileDescription ||
                    'Platform pengembangan teknologi kreatif, kecerdasan buatan, edukasi digital, dan solusi inovasi.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-cyan-300 bg-[#101B55]/60 border border-[#00E5FF]/30 px-3 py-2 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span className="font-stat font-semibold">Otentikasi Kriptografis SHA-256 Aktif</span>
              </div>
            </div>

            {/* BAGIAN B: CONTACT INFORMATION */}
            <div className="space-y-4">
              <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                Informasi Kontak Resmi
              </h4>

              <ul className="space-y-3 text-xs font-body">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-heading font-semibold">Alamat Kantor</span>
                    <span className="text-slate-200 leading-relaxed block">{settings.address}</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-heading font-semibold">Email Bisnis</span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-cyan-300 hover:text-white transition-colors underline font-mono"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-heading font-semibold">WhatsApp Resmi</span>
                    <a
                      href={settings.whatsappUrl || 'https://wa.me/6287821008929'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-white transition-colors font-mono font-semibold flex items-center gap-1"
                    >
                      <span>{settings.whatsappNumber || '087821008929'}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* BAGIAN C: SOCIAL MEDIA */}
            <div className="space-y-4">
              <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E83EFF]" />
                Media Sosial Resmi
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed font-body">
                Ikuti perkembangan riset, program sertifikasi kecerdasan buatan, dan kegiatan ARTAKARYA:
              </p>

              <div className="space-y-2.5">
                {/* Instagram (Resmi & Wajib) */}
                <a
                  href={settings.instagramUrl || 'https://www.instagram.com/artakarya.co/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#101B55]/50 hover:bg-[#101B55] border border-fuchsia-500/30 hover:border-fuchsia-400 text-xs transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-white font-heading font-bold block">Instagram</span>
                      <span className="text-slate-400 text-[11px] font-mono">{settings.instagramHandle || '@artakarya.co'}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-fuchsia-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* YouTube: Ditampilkan HANYA jika sudah ditentukan */}
                {settings.youtubeUrl && settings.youtubeUrl.trim() !== '' && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#101B55]/50 hover:bg-[#101B55] border border-red-500/30 hover:border-red-400 text-xs transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                        <Youtube className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-white font-heading font-bold block">YouTube Resmi</span>
                        <span className="text-slate-400 text-[11px]">Kanal Edukasi AI</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-red-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {/* TikTok: Ditampilkan HANYA jika sudah ditentukan */}
                {settings.tiktokUrl && settings.tiktokUrl.trim() !== '' && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#101B55]/50 hover:bg-[#101B55] border border-cyan-500/30 hover:border-cyan-400 text-xs transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        TT
                      </div>
                      <div>
                        <span className="text-white font-heading font-bold block">TikTok Resmi</span>
                        <span className="text-slate-400 text-[11px]">Konten Singkat AI</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </div>

            {/* BAGIAN D: LEGAL INFORMATION */}
            <div className="space-y-4">
              <h4 className="font-heading text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFC857]" />
                Informasi Legal & Layanan
              </h4>

              <ul className="space-y-2.5 text-xs font-body">
                <li>
                  <button
                    onClick={() => setActiveLegalModal('about')}
                    className="hover:text-[#00E5FF] transition-colors text-left flex items-center gap-2"
                  >
                    <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Tentang ARTAKARYA</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('privacy')}
                    className="hover:text-[#00E5FF] transition-colors text-left flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kebijakan Privasi</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('terms')}
                    className="hover:text-[#00E5FF] transition-colors text-left flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Syarat dan Ketentuan</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-cyan-300 hover:text-white transition-colors text-left flex items-center gap-2 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Kontak Resmi & Peta Lokasi</span>
                  </button>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('verify')}
                  className="w-full py-2 px-3 rounded-xl bg-[#101B55]/60 hover:bg-[#101B55] border border-blue-900 text-[11px] text-slate-300 hover:text-white font-heading font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Validasi Dokumen Publik</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar & Copyright */}
          <div className="mt-12 pt-8 border-t border-[#101B55] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body">
            <p className="text-slate-400 text-center sm:text-left">
              © 2026 <strong className="text-white font-semibold">ARTAKARYA Creative Intelligence Lab</strong>. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-stat font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                Digital Certification & Verification Platform
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* LEGAL MODALS (About, Privacy, Terms) */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-body">
          <div className="w-full max-w-2xl bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.25)] p-6 sm:p-8 text-white my-8 max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {activeLegalModal === 'about' && 'Tentang ARTAKARYA'}
                    {activeLegalModal === 'privacy' && 'Kebijakan Privasi'}
                    {activeLegalModal === 'terms' && 'Syarat dan Ketentuan'}
                  </h3>
                  <p className="text-xs text-slate-400">ARTAKARYA Creative Intelligence Lab</p>
                </div>
              </div>

              <button
                onClick={() => setActiveLegalModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              {activeLegalModal === 'about' && (
                <>
                  <p>
                    <strong className="text-white">ARTAKARYA Creative Intelligence Lab</strong> adalah organisasi riset dan inovasi yang berdedikasi pada pengembangan teknologi kreatif, kecerdasan buatan, edukasi digital, dan solusi otomasi masa depan.
                  </p>
                  <p>
                    <strong className="text-[#00E5FF]">ARTAKARYA EDU CERTIFICATE SYSTEM</strong> dirancang sebagai infrastruktur verifikasi digital berstandar enterprise yang memungkinkan penerbitan kredensial dan sertifikat pelatihan secara instan, aman, serta terotentikasi secara kriptografis menggunakan algoritma SHA-256.
                  </p>
                  <div className="p-4 rounded-2xl bg-[#101B55]/60 border border-blue-900/60 space-y-1.5">
                    <span className="font-heading font-bold text-white block">Sekretariat Resmi:</span>
                    <p className="text-xs text-slate-300">Jl. A.H. Nasution No. 86, Bandung</p>
                    <p className="text-xs text-slate-300">Email: artakarya01@gmail.com</p>
                    <p className="text-xs text-slate-300">WhatsApp: 087821008929</p>
                    <p className="text-xs text-slate-300">Instagram: @artakarya.co</p>
                  </div>
                </>
              )}

              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    Kebijakan Privasi ini menjelaskan bagaimana ARTAKARYA Creative Intelligence Lab menjaga keamanan data peserta, instansi mitra, dan dokumen digital yang diterbitkan melalui platform ini.
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">1. Data yang Dikelola</h4>
                  <p>
                    Kami hanya memproses data yang diperlukan untuk penerbitan kredensial resmi, mencakup nama lengkap peserta, institusi asal, nomor sertifikat, status kehadiran program, dan tanggal penyelesaian.
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">2. Integritas Kriptografis</h4>
                  <p>
                    Setiap sertifikat dilengkapi dengan hash SHA-256 unik yang tersimpan permanen untuk mencegah manipulasi, pemalsuan, atau duplikasi tanpa izin.
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">3. Kerahasiaan Data Kontak</h4>
                  <p>
                    Nomor WhatsApp dan email peserta tidak dipublikasikan ke publik dan hanya digunakan untuk keperluan konfirmasi kehadiran serta pengiriman dokumen sertifikat.
                  </p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    Dengan mengakses dan menggunakan portal ARTAKARYA EDU CERTIFICATE SYSTEM, Anda menyetujui seluruh ketentuan dan pedoman integritas kredensial berikut:
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">1. Keabsahan Kredensial</h4>
                  <p>
                    Sertifikat resmi yang sah hanyalah sertifikat yang terdaftar aktif dalam basis data sistem dan lolos uji validasi pada portal verifikasi resmi kami di <code className="text-[#00E5FF]">/verify</code>.
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">2. Larangan Pemalsuan</h4>
                  <p>
                    Segala bentuk rekayasa visual, pengubahan identitas penerima, atau pencantuman stempel tanpa hak akan ditindak sesuai ketentuan hukum yang berlaku.
                  </p>
                  <h4 className="font-heading font-bold text-white pt-2">3. Pencabutan Sertifikat</h4>
                  <p>
                    ARTAKARYA Creative Intelligence Lab berhak mencabut sertifikat apabila ditemukan pelanggaran kode etik akademik, ketidakhadiran dalam program, atau ketidaksesuaian data verifikasi.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-blue-900/60">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] text-white font-heading font-bold text-xs"
              >
                Tutup Dokumen
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
