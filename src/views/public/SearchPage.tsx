import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Award,
  Calendar,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { supabaseService } from '../../services/supabaseService';
import { CertificateItem } from '../../types';
import { downloadCertificatePDF } from '../../utils/pdfExport';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [results, setResults] = useState<CertificateItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [dbStatus, setDbStatus] = useState(supabaseService.getStatus());

  const events = storage.getEvents();
  const allCertificates = storage.getCertificates();

  useEffect(() => {
    const unsub = supabaseService.subscribeStatus((s) => setDbStatus(s));
    return unsub;
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery, selectedEventId);
    } else {
      setResults(allCertificates);
    }
  }, [initialQuery]);

  const executeSearch = async (q: string, eventId: string) => {
    const term = q.trim();
    setIsSearchingOnline(true);

    try {
      // 1. Try Supabase Online Real-time Query
      const onlineResults = await supabaseService.searchOnline(term, eventId);
      if (onlineResults !== null) {
        setResults(onlineResults);
        setHasSearched(true);
        setIsSearchingOnline(false);
        return;
      }
    } catch (e) {
      console.warn('[Search] Online search fallback to local storage:', e);
    }

    // 2. Resilient local fallback
    let list = allCertificates;
    const lower = term.toLowerCase();

    if (lower) {
      list = list.filter(
        (c) =>
          c.certificateNumber.toLowerCase().includes(lower) ||
          c.participantName.toLowerCase().includes(lower) ||
          c.participantEmail.toLowerCase().includes(lower) ||
          c.eventTitle.toLowerCase().includes(lower)
      );
    }

    if (eventId !== 'ALL') {
      list = list.filter((c) => c.eventId === eventId);
    }

    setResults(list);
    setHasSearched(true);
    setIsSearchingOnline(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedEventId);
  };

  const handleEventFilterChange = (eId: string) => {
    setSelectedEventId(eId);
    executeSearch(query, eId);
  };

  const handleDownload = async (cert: CertificateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.incrementDownload(cert.id);
    await downloadCertificatePDF(cert);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B55] border border-[#00E5FF]/30 text-xs font-stat font-bold text-[#00E5FF] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
          PORTAL PENCARIAN PUBLIK ARTAKARYA
        </div>
        <h1 className="font-heading text-2xl sm:text-4xl font-black text-white">
          Cari Sertifikat Digital Peserta
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 font-body">
          Temukan dokumen kredensial Anda berdasarkan nomor seri resmi, nama lengkap, atau alamat email pendaftaran.
        </p>
      </div>

      {/* Futuristic Search & Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#101B55]/50 border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(8,123,255,0.15)] backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. Sertifikat (cth: AK-20261102-AICEO-001) / Nama / Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#050B2E] border border-blue-900 text-white placeholder-slate-400 text-sm font-body focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedEventId}
              onChange={(e) => handleEventFilterChange(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-[#050B2E] border border-blue-900 text-slate-200 text-sm font-heading font-medium focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="ALL">Semua Kegiatan</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSearchingOnline}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 disabled:opacity-70"
          >
            <Search className={`w-4 h-4 ${isSearchingOnline ? 'animate-spin' : ''}`} />
            <span>{isSearchingOnline ? 'Mencari Online...' : 'Cari Data'}</span>
          </button>
        </form>

        {/* Real-time Online Sync Indicator */}
        <div className="mt-3.5 pt-3 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#00E5FF] font-stat font-semibold">Filter Cepat:</span>
          <button
            onClick={() => {
              setQuery('AI CEO');
              executeSearch('AI CEO', selectedEventId);
            }}
            className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 border border-blue-900 text-xs font-body"
          >
            AI CEO Masterclass
          </button>
          <button
            onClick={() => {
              setQuery('Budi Santoso');
              executeSearch('Budi Santoso', selectedEventId);
            }}
            className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 border border-blue-900 text-xs font-body"
          >
            Budi Santoso
          </button>
          <button
            onClick={() => {
              setQuery('Siti Rahmawati');
              executeSearch('Siti Rahmawati', selectedEventId);
            }}
            className="px-3 py-1 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-slate-300 border border-blue-900 text-xs font-body"
          >
            Siti Rahmawati
          </button>
          <button
            onClick={() => {
              setQuery('');
              setSelectedEventId('ALL');
              setResults(allCertificates);
            }}
            className="px-3 py-1 rounded-xl bg-[#101B55]/70 hover:bg-[#101B55] text-slate-400 font-stat text-xs"
          >
            Reset Filter
          </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
          <span>Hasil Pencarian</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-stat font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
            {results.length} Kredensial
          </span>
        </h2>
        <span className="text-xs text-slate-400 font-body">
          Klik kartu untuk pratinjau & verifikasi resmi
        </span>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#101B55]/30 border border-blue-900/50">
          <FileQuestion className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-heading font-bold text-white">Tidak Ada Sertifikat Ditemukan</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 font-body">
            Pastikan nomor seri, nama peserta, atau email yang Anda masukkan sudah sesuai dengan data pendaftaran ARTAKARYA.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedEventId('ALL');
              setResults(allCertificates);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-white text-xs font-heading font-semibold"
          >
            Tampilkan Semua Sertifikat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((cert) => (
            <div
              key={cert.id}
              onClick={() => onNavigate('detail', { certNumber: cert.certificateNumber })}
              className="group cursor-pointer rounded-3xl bg-[#101B55]/40 hover:bg-[#101B55]/70 border border-blue-900/60 hover:border-[#00E5FF]/60 p-5 shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Serial & Status Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-stat font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {cert.certificateNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-stat font-semibold px-2.5 py-0.5 rounded-full ${
                      cert.status === 'AKTIF'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {cert.status}
                  </span>
                </div>

                {/* Recipient */}
                <p className="text-xs text-slate-400 font-body">Diterbitkan Untuk:</p>
                <h3 className="font-heading font-extrabold text-lg text-white group-hover:text-[#00E5FF] transition-colors mt-0.5">
                  {cert.participantName}
                </h3>
                {cert.participantOrg && (
                  <p className="text-xs text-slate-300 font-body truncate mt-0.5">{cert.participantOrg}</p>
                )}

                {/* Event Name */}
                <div className="mt-3.5 pt-3 border-t border-blue-900/60">
                  <span className="text-[10px] text-[#00E5FF] font-stat font-bold uppercase tracking-wider block">
                    Program Kegiatan
                  </span>
                  <p className="text-sm font-heading font-bold text-slate-100 mt-0.5">
                    {cert.eventTitle}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-body">
                    <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>{cert.eventDate}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-blue-900/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('detail', { certNumber: cert.certificateNumber })}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#087BFF]/30 hover:bg-[#087BFF]/50 border border-[#087BFF]/40 text-xs font-heading font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Lihat Detail</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDownload(cert, e)}
                  className="py-2.5 px-3 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-stat font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="Unduh PDF Resmi"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
