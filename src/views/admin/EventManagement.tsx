import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  Award,
  Search,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Archive,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { EventItem, EventStatus } from '../../types';
import { formatJakartaDate } from '../../utils/dateFormatter';

interface EventManagementProps {
  onAdminNavigate: (subView: string, params?: any) => void;
  onPublicNavigate: (view: string, params?: any) => void;
}

export const EventManagement: React.FC<EventManagementProps> = ({
  onAdminNavigate,
  onPublicNavigate,
}) => {
  const [events, setEvents] = useState<EventItem[]>(storage.getEvents());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal states
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const reloadEvents = () => {
    setEvents(storage.getEvents());
  };

  useEffect(() => {
    const unsubscribe = storage.subscribe(reloadEvents);
    return () => unsubscribe();
  }, []);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleOpenAdd = () => {
    setEditingEvent({
      title: '',
      subtitle: '',
      description: '',
      organizer: 'ARTAKARYA Creative Intelligence Lab',
      date: new Date().toISOString().split('T')[0],
      formattedDate: '',
      time: '09:00 - 17:00 WIB',
      location: 'Grand Ballroom ARTAKARYA & Hybrid Broadcast',
      category: 'Masterclass',
      status: 'BERLANGSUNG',
      certificatePrefix: 'AK-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-NEW',
      instructor: {
        name: 'Dr. Arya Pratama, M.Kom.',
        title: 'Founder & AI Strategist ARTAKARYA',
      },
      templateId: 'tpl-gold-royal',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingEvent({ ...ev });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInitiateDelete = (ev: EventItem) => {
    setEventToDelete(ev);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      // Simulate minor async tick for smooth UI and prevention of double clicks
      await new Promise((r) => setTimeout(r, 350));
      const res = storage.deleteEvent(eventToDelete.id);
      if (res.success) {
        setToast({ text: res.message, type: 'success' });
        setEventToDelete(null);
        reloadEvents();
      } else {
        setToast({ text: res.message || 'Gagal menghapus kegiatan.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ text: err?.message || 'Terjadi kesalahan sistem saat menghapus kegiatan.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!eventToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = storage.archiveEvent(eventToDelete.id);
      if (res.success) {
        setToast({ text: res.message, type: 'success' });
        setEventToDelete(null);
        reloadEvents();
      } else {
        setToast({ text: res.message || 'Gagal mengarsipkan kegiatan.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ text: err?.message || 'Terjadi kesalahan saat mengarsipkan kegiatan.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const errors: Record<string, string> = {};
    if (!editingEvent.title?.trim()) errors.title = 'Judul kegiatan wajib diisi';
    if (!editingEvent.date) errors.date = 'Tanggal kegiatan wajib diisi';
    if (!editingEvent.organizer?.trim()) errors.organizer = 'Penyelenggara wajib diisi';
    if (!editingEvent.certificatePrefix?.trim()) errors.certificatePrefix = 'Prefix nomor sertifikat wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formatted = formatJakartaDate(editingEvent.date!);
    const saved = storage.saveEvent({
      ...editingEvent,
      title: editingEvent.title!.trim(),
      date: editingEvent.date!,
      formattedDate: formatted,
    });

    setToast({
      text: editingEvent.id
        ? `Kegiatan "${saved.title}" dan seluruh tanggal sertifikat berhasil disinkronkan (${formatted}).`
        : `Kegiatan "${saved.title}" berhasil ditambahkan.`,
      type: 'success',
    });

    setIsModalOpen(false);
    setEditingEvent(null);
    reloadEvents();
  };

  const filtered = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(search.toLowerCase()) ||
      ev.certificatePrefix.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || ev.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 font-body">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Manajemen Kegiatan</h2>
          <p className="text-xs text-slate-400">
            Daftar kegiatan, masterclass, seminar, webinar, dan konfigurasi sertifikat ARTAKARYA.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kegiatan Baru</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 backdrop-blur-xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kegiatan ARTAKARYA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-slate-200 text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
          >
            <option value="ALL">Semua Status</option>
            <option value="BERLANGSUNG">Berlangsung</option>
            <option value="SELESAI">Selesai</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="p-5 sm:p-6 rounded-3xl bg-[#101B55]/40 border border-blue-900/60 hover:border-[#00E5FF]/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-xl"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-stat font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                  {ev.certificatePrefix}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-stat font-semibold bg-[#101B55] text-cyan-300 border border-blue-800">
                  {ev.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-stat font-semibold ${
                    ev.status === 'BERLANGSUNG'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700/40 text-slate-300'
                  }`}
                >
                  {ev.status}
                </span>
                {ev.isDemo && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-stat font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">
                    DATA DEMO
                  </span>
                )}
              </div>

              <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                {ev.title}
              </h3>
              {ev.subtitle && (
                <p className="text-xs font-heading font-medium text-[#00E5FF]">
                  "{ev.subtitle}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-body">
                <span>Penyelenggara: <strong className="text-slate-200">{ev.organizer}</strong></span>
                <span>Tanggal: <strong className="text-cyan-300 font-stat">{ev.date}</strong></span>
                <span>Instruktur: <strong className="text-slate-300">{ev.instructor.name}</strong></span>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-4 lg:self-center border-t lg:border-t-0 pt-4 lg:pt-0 border-blue-900/60">
              <div className="flex items-center gap-3 text-xs text-center pr-2 font-stat">
                <div className="px-3.5 py-2 rounded-2xl bg-[#050B2E] border border-blue-950">
                  <span className="text-slate-500 block text-[10px] font-body">Peserta</span>
                  <span className="font-bold text-white text-sm">{ev.participantCount || 0}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[#050B2E] border border-blue-950">
                  <span className="text-slate-500 block text-[10px] font-body">Sertifikat</span>
                  <span className="font-bold text-emerald-400 text-sm">{ev.issuedCount || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAdminNavigate('participants', { eventId: ev.id })}
                  className="px-3.5 py-2 rounded-xl bg-[#087BFF]/30 hover:bg-[#087BFF]/50 border border-[#087BFF]/40 text-white text-xs font-heading font-semibold flex items-center gap-1.5 transition-colors"
                  title="Kelola Peserta"
                >
                  <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Peserta</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(ev)}
                  className="p-2 rounded-xl bg-[#101B55] hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-800"
                  title="Edit Kegiatan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleInitiateDelete(ev)}
                  className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-900 transition-colors"
                  title="Hapus Kegiatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah/Edit Kegiatan */}
      {isModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-2xl p-6 text-white my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingEvent.id ? 'Edit Kegiatan ARTAKARYA' : 'Tambah Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 py-4 text-xs sm:text-sm">
              
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Nama Kegiatan / Judul Masterclass *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: AI CEO MASTERCLASS"
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Sub-judul / Tagline Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Membangun Perusahaan dengan Karyawan AI"
                  value={editingEvent.subtitle || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Tanggal Acara *</label>
                  <input
                    type="date"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                  {formErrors.date && <p className="text-red-400 text-xs mt-1">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00 - 17:00 WIB"
                    value={editingEvent.time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Penyelenggara *</label>
                  <input
                    type="text"
                    value={editingEvent.organizer || 'ARTAKARYA Creative Intelligence Lab'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Prefix Nomor Seri Sertifikat *</label>
                  <input
                    type="text"
                    placeholder="Contoh: AK-20261102-AICEO"
                    value={editingEvent.certificatePrefix || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, certificatePrefix: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 font-stat text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
                  />
                  {formErrors.certificatePrefix && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.certificatePrefix}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Nama Instruktur / Pembicara</label>
                  <input
                    type="text"
                    value={editingEvent.instructor?.name || ''}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        instructor: { ...editingEvent.instructor!, name: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Status Kegiatan</label>
                  <select
                    value={editingEvent.status || 'BERLANGSUNG'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="BERLANGSUNG">Berlangsung</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARSIP">Arsip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">Template Desain Sertifikat</label>
                {storage.getTemplates().length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                    Belum ada template kustom yang diunggah. Sertifikat akan menggunakan tata letak presisi resmi ARTAKARYA sampai Anda mengunggah template di menu <strong>Template Sertifikat</strong>.
                  </div>
                ) : (
                  <select
                    value={editingEvent.templateId || storage.getTemplates().find((t) => t.isDefault)?.id || storage.getTemplates()[0]?.id || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, templateId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    {storage.getTemplates().map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} {tpl.isDefault ? '[Default]' : ''} ({tpl.orientation === 'portrait' ? 'Portrait' : 'Landscape'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-slate-800 text-slate-300 font-heading font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold"
                >
                  Simpan Kegiatan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kegiatan */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#050B2E] border border-red-500/40 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-6 text-white my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Konfirmasi Hapus Kegiatan
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-slate-300">{eventToDelete.id}</span>
                  </p>
                </div>
              </div>
              <button
                disabled={isDeleting}
                onClick={() => setEventToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-300">
                Apakah Anda yakin ingin menghapus kegiatan berikut dari sistem ARTAKARYA?
              </p>

              {/* Event Info Card */}
              <div className="p-4 rounded-2xl bg-[#101B55]/70 border border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-bold text-white text-base">
                    {eventToDelete.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-stat font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                    {eventToDelete.category}
                  </span>
                </div>
                {eventToDelete.subtitle && (
                  <p className="text-xs text-slate-400 italic">"{eventToDelete.subtitle}"</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-blue-900/40">
                  <span>Tanggal: <strong className="text-white">{eventToDelete.formattedDate || eventToDelete.date}</strong></span>
                  <span>Peserta: <strong className="text-white">{eventToDelete.participantCount || 0} orang</strong></span>
                  <span>Sertifikat: <strong className="text-emerald-400">{eventToDelete.issuedCount || 0} terbit</strong></span>
                </div>
              </div>

              {/* Data Protection Check: If certificates already issued */}
              {eventToDelete.issuedCount > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-heading font-bold text-amber-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Peringatan Perlindungan Data</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Kegiatan ini telah menerbitkan <strong className="text-white">{eventToDelete.issuedCount} sertifikat digital</strong>. Menghapus kegiatan secara permanen berisiko membuat referensi publik kegiatan ini tidak ditemukan saat verifikasi.
                  </p>
                  <p className="text-xs text-amber-300 font-semibold">
                    💡 Disarankan untuk memilih opsi "Arsipkan Kegiatan" agar seluruh sertifikat tetap sah dan dapat diverifikasi.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tindakan ini akan menghapus data kegiatan secara permanen. Pastikan Anda telah memeriksa kembali sebelum melanjutkan.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-blue-900/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEventToDelete(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-slate-800 text-slate-300 font-heading font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50"
              >
                Batal
              </button>

              {eventToDelete.issuedCount > 0 && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmArchive}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-heading font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                  <span>Arsipkan Kegiatan (Aman)</span>
                </button>
              )}

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{eventToDelete.issuedCount > 0 ? 'Tetap Hapus Permanen' : 'Hapus Kegiatan'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Feedback Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 text-xs sm:text-sm font-heading font-medium text-white ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-900/40'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 shadow-red-900/40'
                : 'bg-amber-950/90 border-amber-500/50 shadow-amber-900/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white ml-2 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
