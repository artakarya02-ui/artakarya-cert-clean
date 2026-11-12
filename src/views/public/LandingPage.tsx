import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  QrCode,
  Zap,
  Layers,
  Cpu,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { ActivityCarousel } from '../../components/events/ActivityCarousel';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(storage.getSettings());

  React.useEffect(() => {
    const unsub = storage.subscribe(() => setSettings(storage.getSettings()));
    return unsub;
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', { q: searchQuery.trim() });
    } else {
      onNavigate('search');
    }
  };

  const modernFeatures = [
    {
      id: 'feature-1',
      title: 'Penerbitan Otomatis',
      desc: 'Generasi nomor seri otomatis, sidik jari kriptografis SHA-256, dan rilis massal batch dalam hitungan detik.',
      icon: Zap,
      gradient: 'from-[#087BFF] to-[#00E5FF]',
      borderGlow: 'border-cyan-500/30 hover:border-cyan-400',
    },
    {
      id: 'feature-2',
      title: 'Verifikasi QR Code',
      desc: 'Pemindaian instan kode QR unik untuk validasi keabsahan dokumen real-time tanpa risiko rekayasa fisik.',
      icon: QrCode,
      gradient: 'from-[#7928CA] to-[#E83EFF]',
      borderGlow: 'border-fuchsia-500/30 hover:border-fuchsia-400',
    },
    {
      id: 'feature-3',
      title: 'Download Sertifikat PDF',
      desc: 'Ekspor dokumen vektor beresolusi tinggi format A4 Landscape pada latar ivory/putih bersih siap cetak.',
      icon: Download,
      gradient: 'from-[#00E5FF] to-[#087BFF]',
      borderGlow: 'border-blue-500/30 hover:border-blue-400',
    },
    {
      id: 'feature-4',
      title: 'Manajemen Multi Kegiatan',
      desc: 'Pengelolaan terpadu untuk seminar, webinar nasional, workshop, masterclass eksekutif, dan program pelatihan.',
      icon: Layers,
      gradient: 'from-[#E83EFF] to-[#00E5FF]',
      borderGlow: 'border-cyan-500/30 hover:border-cyan-400',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 font-body">
      
      {/* CLEAN FUTURISTIC HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-[#00E5FF]/15">
        
        {/* Dynamic Deep Space Ambient Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#087BFF]/25 via-[#7928CA]/20 to-[#E83EFF]/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-5 right-10 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-7">
          
          {/* Organization Logo & Identification Badge */}
          <div className="flex flex-col items-center gap-3">
            {settings.logoUrl && (
              <div className="mb-1">
                <img
                  src={settings.logoUrl}
                  alt="Logo Resmi ARTAKARYA"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_4px_30px_rgba(0,229,255,0.4)]"
                />
              </div>
            )}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101B55]/70 border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-200">
                {settings.organizationName || 'ARTAKARYA CREATIVE INTELLIGENCE LAB'}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            PENERBITAN & VERIFIKASI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#087BFF] to-[#E83EFF]">
              SERTIFIKAT DIGITAL RESMI
            </span>
          </h1>

          {/* Product Identification Subtitle */}
          <p className="text-sm sm:text-base font-heading font-bold text-cyan-300 -mt-2">
            ARTAKARYA EDU CERTIFICATE SYSTEM
          </p>

          {/* Clean Description */}
          <p className="text-sm sm:text-base text-slate-300 font-body max-w-2xl mx-auto leading-relaxed">
            Platform digital ARTAKARYA untuk mengelola, menerbitkan, dan memverifikasi sertifikat peserta seminar, webinar, workshop, dan program pelatihan.
          </p>

          {/* Certificate Search Box - Primary Hero Feature */}
          <div className="pt-2 max-w-2xl mx-auto w-full">
            <form
              onSubmit={handleHeroSearch}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#101B55]/85 border border-[#00E5FF]/40 shadow-[0_0_35px_rgba(8,123,255,0.25)] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-3 w-full px-3 py-2 sm:py-0">
                <Search className="w-5 h-5 text-[#00E5FF] shrink-0" />
                <input
                  type="text"
                  placeholder="Masukkan Nomor Sertifikat (AK-...) atau Nama Peserta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-body"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 shrink-0"
              >
                <span>Cari Sertifikat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Action Button: Verifikasi Keaslian (Katalog & Demo buttons removed as requested) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('verify')}
              className="px-6 py-3 rounded-xl bg-[#101B55]/90 hover:bg-[#101B55] border border-[#00E5FF]/50 text-cyan-200 font-heading font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
              <span>Verifikasi Keaslian</span>
            </button>
          </div>

        </div>
      </section>

      {/* FEATURE SECTION (4 MODERN PILLAR CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101B55] border border-[#00E5FF]/30 text-xs font-stat font-bold text-[#00E5FF] mb-3 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>MODERN DIGITAL EXPERIENCE</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
            Pilar Sertifikasi Digital Generasi Baru
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 font-body">
            Empat fondasi utama platform ARTAKARYA yang mengkombinasikan kecepatan otomasi, keamanan kriptografi, dan kemudahan akses peserta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modernFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`group p-6 rounded-3xl bg-[#101B55]/40 backdrop-blur-xl border ${feat.borderGlow} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(8,123,255,0.2)] flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} p-[1.5px] mb-5 shadow-lg`}>
                    <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-blue-900/40 flex items-center text-xs font-stat font-semibold text-[#00E5FF] group-hover:translate-x-1 transition-transform">
                  <span>Standar Digital 2026 →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HORIZONTAL ACTIVITIES CAROUSEL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ActivityCarousel onNavigate={onNavigate} />
      </section>

    </div>
  );
};
