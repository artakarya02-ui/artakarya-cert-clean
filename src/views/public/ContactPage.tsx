import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Send,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Cpu,
  Share2,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface ContactPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const settings = storage.getSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Verifikasi Sertifikat',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (method: 'whatsapp' | 'email') => {
    if (!formData.name.trim() || !formData.message.trim()) {
      alert('Mohon isi nama lengkap dan pesan Anda.');
      return;
    }

    if (method === 'whatsapp') {
      const text = encodeURIComponent(
        `Halo ARTAKARYA Creative Intelligence Lab,\n\nNama: ${formData.name}\nEmail: ${formData.email || '-'}\nTelepon/WA: ${formData.phone || '-'}\nKeperluan: ${formData.category}\n\nPesan:\n${formData.message}`
      );
      window.open(`https://wa.me/6287821008929?text=${text}`, '_blank', 'noopener,noreferrer');
    } else {
      const subject = encodeURIComponent(`[Inquiry] ${formData.category} - ${formData.name}`);
      const body = encodeURIComponent(
        `Nama: ${formData.name}\nEmail: ${formData.email}\nTelepon: ${formData.phone}\nKategori: ${formData.category}\n\nPesan:\n${formData.message}\n\n---\nDikirim melalui Portal ARTAKARYA Certificate System`
      );
      window.open(`mailto:artakarya01@gmail.com?subject=${subject}&body=${body}`, '_blank');
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#050B2E] text-slate-100 font-body pb-20">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-[#00E5FF]/20 bg-gradient-to-b from-[#030820] to-[#050B2E]">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#087BFF]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#7928CA]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101B55]/70 border border-[#00E5FF]/40 text-xs font-heading font-extrabold tracking-widest text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)] uppercase">
            <Cpu className="w-4 h-4 text-[#00E5FF]" />
            ARTAKARYA CREATIVE INTELLIGENCE LAB
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight">
            Hubungi Kami & Sekretariat Resmi
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pusat layanan informasi resmi, bantuan verifikasi dokumen, dan konsultasi kemitraan untuk ekosistem <strong className="text-white">ARTAKARYA Certificate System</strong>.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-12">
        
        {/* 4 Official Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: WhatsApp */}
          <div className="p-6 rounded-3xl bg-[#101B55]/70 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-stat font-bold uppercase tracking-widest text-emerald-400 block">
                  FAST RESPONSE WHATSAPP
                </span>
                <h3 className="font-heading font-bold text-white text-base">WhatsApp Resmi</h3>
              </div>
              <p className="font-mono text-sm font-semibold text-emerald-300">
                087821008929
              </p>
              <p className="text-xs text-slate-400 font-body">
                Layanan pesan cepat untuk verifikasi sertifikat & bantuan teknis peserta.
              </p>
            </div>

            <a
              href="https://wa.me/6287821008929"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>

          {/* Card 2: Email */}
          <div className="p-6 rounded-3xl bg-[#101B55]/70 backdrop-blur-xl border border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] flex flex-col justify-between space-y-4 hover:border-[#00E5FF] transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#087BFF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-sm group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-stat font-bold uppercase tracking-widest text-[#00E5FF] block">
                  OFFICIAL BUSINESS INQUIRY
                </span>
                <h3 className="font-heading font-bold text-white text-base">Email Resmi</h3>
              </div>
              <p className="font-mono text-sm font-semibold text-cyan-300 truncate">
                artakarya01@gmail.com
              </p>
              <p className="text-xs text-slate-400 font-body">
                Korespondensi formal, verifikasi institusi, dan penerbitan sertifikat kemitraan.
              </p>
            </div>

            <a
              href="mailto:artakarya01@gmail.com"
              className="w-full py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-white font-heading font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Kirim Email</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>

          {/* Card 3: Instagram */}
          <div className="p-6 rounded-3xl bg-[#101B55]/70 backdrop-blur-xl border border-fuchsia-500/40 shadow-[0_0_30px_rgba(232,62,255,0.15)] flex flex-col justify-between space-y-4 hover:border-fuchsia-400 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E83EFF]/20 border border-[#E83EFF]/40 flex items-center justify-center text-[#E83EFF] shadow-sm group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-stat font-bold uppercase tracking-widest text-fuchsia-400 block">
                  OFFICIAL SOCIAL MEDIA
                </span>
                <h3 className="font-heading font-bold text-white text-base">Instagram Resmi</h3>
              </div>
              <p className="font-mono text-sm font-semibold text-fuchsia-300">
                @artakarya.co
              </p>
              <p className="text-xs text-slate-400 font-body">
                Update masterclass AI, dokumentasi kelulusan, dan agenda pelatihan terbaru.
              </p>
            </div>

            <a
              href="https://www.instagram.com/artakarya.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7928CA] to-[#E83EFF] hover:opacity-95 text-white font-heading font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/40 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              <span>Ikuti Instagram</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>

          {/* Card 4: Address */}
          <div className="p-6 rounded-3xl bg-[#101B55]/70 backdrop-blur-xl border border-blue-900/60 shadow-lg flex flex-col justify-between space-y-4 hover:border-blue-700 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-stat font-bold uppercase tracking-widest text-slate-400 block">
                  KANTOR & SEKRETARIAT
                </span>
                <h3 className="font-heading font-bold text-white text-base">Alamat Kantor</h3>
              </div>
              <p className="text-xs text-slate-300 font-body leading-relaxed">
                Jl. A.H. Nasution No. 86, Bandung
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Senin - Jumat (09:00 - 17:00 WIB)</span>
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Jl.+A.H.+Nasution+No.+86,+Bandung"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#101B55] hover:bg-blue-900 border border-blue-800 text-white font-heading font-semibold text-xs text-center flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#00E5FF]" />
              <span>Peta Lokasi</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>

        </div>

        {/* Interactive Google Maps & Office Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map Embed (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00E5FF]" />
                Peta Lokasi Kantor ARTAKARYA
              </h3>
              <span className="text-xs font-stat text-[#00E5FF] px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                Bandung, Jawa Barat
              </span>
            </div>

            <div className="p-3 rounded-3xl bg-[#030820] border border-[#00E5FF]/30 shadow-2xl overflow-hidden relative group">
              <iframe
                title="Peta Lokasi ARTAKARYA Creative Intelligence Lab"
                src="https://maps.google.com/maps?q=Jl.+A.H.+Nasution+No.+86,+Bandung&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="380"
                style={{ border: 0, borderRadius: '1.25rem', filter: 'contrast(1.05) saturate(1.1)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#101B55]/50 border border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                <span>ARTAKARYA Creative Intelligence Lab • Jl. A.H. Nasution No. 86, Bandung</span>
              </div>
              <a
                href="https://maps.google.com/?q=Jl.+A.H.+Nasution+No.+86,+Bandung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E5FF] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Inquiry / Message Form (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#101B55]/60 backdrop-blur-xl border border-blue-900/60 shadow-xl space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-stat font-bold text-[#00E5FF] mb-2 uppercase">
                FORMULIR KONSULTASI RESMI
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Kirim Pesan ke Tim ARTAKARYA
              </h3>
              <p className="text-xs text-slate-400 font-body">
                Sampaikan pertanyaan seputar verifikasi sertifikat, pelatihan AI, atau validasi kredensial.
              </p>
            </div>

            {submitted && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-heading font-semibold animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Pesan Anda telah diteruskan ke kanal komunikasi resmi ARTAKARYA.</span>
              </div>
            )}

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Nama Anda atau Instansi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B2E] border border-blue-900 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B2E] border border-blue-900 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori Keperluan</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="Verifikasi Sertifikat">Bantuan Verifikasi Sertifikat</option>
                  <option value="Penerbitan Sertifikat Kegiatan">Penerbitan Sertifikat Program / Masterclass</option>
                  <option value="Kerja Sama Kreatif & AI">Kemitraan AI & Creative Intelligence</option>
                  <option value="Pertanyaan Umum">Pertanyaan Umum Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pesan / Keterangan *</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan nomor sertifikat atau hal yang ingin ditanyakan..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#050B2E] border border-blue-900 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit('whatsapp')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit('email')}
                  className="py-2.5 px-3 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/40"
                >
                  <Mail className="w-4 h-4" />
                  <span>Kirim ke Email</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center font-body pt-1">
                Data Anda dilindungi oleh Kebijakan Privasi ARTAKARYA Creative Intelligence Lab.
              </p>
            </div>
          </div>

        </div>

        {/* Corporate Trust & Identity Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101B55] via-[#050B2E] to-[#101B55] border border-[#00E5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#7928CA] to-[#00E5FF] p-[1.5px] shrink-0">
              <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-stat font-bold text-[#00E5FF] uppercase tracking-wider block">
                ORGANISASI INDUK RESMI
              </span>
              <h4 className="font-heading font-black text-white text-base sm:text-lg">
                ARTAKARYA Creative Intelligence Lab
              </h4>
              <p className="text-xs text-slate-300 font-body max-w-xl">
                {settings.profileDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('verify')}
              className="px-5 py-2.5 rounded-xl bg-[#101B55] hover:bg-blue-900 border border-[#00E5FF]/40 text-xs font-heading font-bold text-white transition-colors"
            >
              Portal Verifikasi
            </button>
            <button
              onClick={() => onNavigate('search')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] text-white text-xs font-heading font-bold transition-opacity hover:opacity-95"
            >
              Cari Sertifikat
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
