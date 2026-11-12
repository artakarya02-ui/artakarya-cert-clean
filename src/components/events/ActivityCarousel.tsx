import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  Sparkles,
  ArrowRight,
  FileText,
  UserCheck,
  MapPin,
  X,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { EventItem } from '../../types';
import { storage } from '../../services/storage';

interface ActivityCarouselProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ActivityCarousel: React.FC<ActivityCarouselProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<EventItem[]>(storage.getEvents());
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-subscribe to storage updates so newly created admin events instantly reflect here!
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setEvents(storage.getEvents());
    });
    return unsub;
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B55] border border-[#00E5FF]/30 text-xs font-stat font-bold text-[#00E5FF] mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>AGENDA & KEGIATAN RESMI</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Program & Seminar ARTAKARYA
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-body mt-1">
            Telusuri kegiatan edukasi kecerdasan digital, workshop eksekutif, dan sertifikasi keahlian.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-xl bg-[#101B55]/80 hover:bg-[#101B55] border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
            title="Geser ke Kiri"
            aria-label="Geser ke Kiri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-xl bg-[#101B55]/80 hover:bg-[#101B55] border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
            title="Geser ke Kanan"
            aria-label="Geser ke Kanan"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#101B55] scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {events.length === 0 ? (
          <div className="w-full p-8 rounded-3xl bg-[#101B55]/40 border border-slate-800 text-center text-slate-400">
            Belum ada kegiatan yang terdaftar.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="w-[320px] sm:w-[360px] shrink-0 snap-start rounded-3xl bg-gradient-to-b from-[#101B55]/80 to-[#050B2E]/95 border border-[#00E5FF]/30 hover:border-[#00E5FF]/70 shadow-[0_10px_30px_rgba(5,11,46,0.8)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] transition-all duration-300 flex flex-col justify-between p-6 group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Penyelenggara & Tanggal */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-body pb-3 border-b border-blue-900/60">
                  <div className="flex items-center gap-1.5 font-heading font-semibold text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="truncate max-w-[150px]">{event.organizer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-stat font-semibold text-[#00E5FF]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{event.formattedDate || event.date}</span>
                  </div>
                </div>

                {/* Nama Seminar atau Kegiatan */}
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white group-hover:text-[#00E5FF] transition-colors leading-snug line-clamp-2">
                    {event.title}
                  </h3>
                  
                  {/* Tema atau Judul Kegiatan */}
                  <p className="font-heading text-xs sm:text-sm font-semibold text-[#00E5FF]/90 mt-1 line-clamp-2">
                    "{event.subtitle}"
                  </p>
                </div>

                {/* Deskripsi Singkat */}
                <p className="text-xs text-slate-300 font-body leading-relaxed line-clamp-3">
                  {event.description}
                </p>
              </div>

              {/* Action Button: Detail Kegiatan (NO certificate preview images!) */}
              <div className="pt-5 mt-4 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#050B2E] hover:bg-[#101B55] text-cyan-200 hover:text-white font-heading font-bold text-xs sm:text-sm border border-[#00E5FF]/40 hover:border-[#00E5FF] shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                >
                  <span>Detail Kegiatan</span>
                  <ArrowRight className="w-4 h-4 text-[#00E5FF] group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_60px_rgba(8,123,255,0.3)] p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto font-body">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pb-5 border-b border-[#101B55]">
              <div className="flex items-center gap-2 text-xs font-stat text-[#00E5FF] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INFORMASI LENGKAP KEGIATAN</span>
              </div>
              <h3 className="font-heading text-2xl font-black text-white">
                {selectedEvent.title}
              </h3>
              <p className="font-heading text-sm font-semibold text-[#00E5FF] mt-1">
                "{selectedEvent.subtitle}"
              </p>
            </div>

            {/* Event Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
              <div className="p-3.5 rounded-2xl bg-[#101B55]/70 border border-blue-900/60">
                <span className="text-[10px] text-slate-400 font-stat uppercase font-bold block">
                  Penyelenggara
                </span>
                <span className="font-heading font-bold text-white text-xs sm:text-sm">
                  {selectedEvent.organizer}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101B55]/70 border border-blue-900/60">
                <span className="text-[10px] text-slate-400 font-stat uppercase font-bold block">
                  Tanggal Pelaksanaan
                </span>
                <span className="font-stat font-bold text-[#00E5FF] text-xs sm:text-sm">
                  {selectedEvent.formattedDate || selectedEvent.date}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101B55]/70 border border-blue-900/60">
                <span className="text-[10px] text-slate-400 font-stat uppercase font-bold block">
                  Instruktur / Pembicara
                </span>
                <span className="font-heading font-bold text-white text-xs sm:text-sm">
                  {selectedEvent.instructor?.name || 'Tim ARTAKARYA'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {selectedEvent.instructor?.title || 'Creative Intelligence Lab'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101B55]/70 border border-blue-900/60">
                <span className="text-[10px] text-slate-400 font-stat uppercase font-bold block">
                  Lokasi / Format
                </span>
                <span className="font-heading font-bold text-white text-xs sm:text-sm">
                  {selectedEvent.location || 'Hybrid / Bandung'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-heading font-bold text-slate-200 uppercase tracking-wider">
                Deskripsi Program:
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body bg-[#03071E] p-4 rounded-2xl border border-blue-950">
                {selectedEvent.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#101B55] flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  onNavigate('search', { q: selectedEvent.title });
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Cari Sertifikat Kegiatan Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  onNavigate('verify');
                }}
                className="py-3 px-5 rounded-xl bg-[#101B55] hover:bg-[#101B55]/80 text-cyan-200 border border-[#00E5FF]/40 font-heading font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                <span>Verifikasi Dokumen</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
