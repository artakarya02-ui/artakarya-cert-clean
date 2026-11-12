import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { ParticipantItem, AttendanceStatus } from '../../types';

interface ParticipantManagementProps {
  initialEventId?: string;
  onAdminNavigate: (subView: string, params?: any) => void;
  onPublicNavigate: (view: string, params?: any) => void;
}

export const ParticipantManagement: React.FC<ParticipantManagementProps> = ({
  initialEventId,
  onAdminNavigate,
  onPublicNavigate,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || 'ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [participants, setParticipants] = useState<ParticipantItem[]>(storage.getParticipants());
  
  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Partial<ParticipantItem> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal state
  const [participantToDelete, setParticipantToDelete] = useState<ParticipantItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const events = storage.getEvents();

  const reloadData = () => {
    setParticipants(storage.getParticipants());
  };

  useEffect(() => {
    const unsubscribe = storage.subscribe(reloadData);
    return () => unsubscribe();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleOpenAdd = () => {
    setEditingParticipant({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      jobTitle: '',
      role: 'Peserta',
      eventId: selectedEventId !== 'ALL' ? selectedEventId : (events[0]?.id || 'evt-ai-ceo-2026'),
      attendanceStatus: 'MENUNGGU_VALIDASI',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ParticipantItem) => {
    setEditingParticipant({ ...p });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleInitiateDelete = (p: ParticipantItem) => {
    setParticipantToDelete(p);
  };

  const handleConfirmDelete = async () => {
    if (!participantToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      // Slight delay to prevent accidental multiple clicks
      await new Promise((r) => setTimeout(r, 350));
      const res = storage.deleteParticipant(participantToDelete.id);
      
      if (res.success) {
        setToast({ text: res.message, type: 'success' });
        setParticipantToDelete(null);
        reloadData();
      } else {
        setToast({ text: res.message || 'Gagal menghapus data peserta.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ text: err?.message || 'Terjadi kesalahan sistem saat menghapus peserta.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    const errors: Record<string, string> = {};

    if (!editingParticipant.fullName?.trim()) errors.fullName = 'Nama lengkap peserta wajib diisi';
    if (!editingParticipant.email?.trim()) errors.email = 'Email wajib diisi';
    if (!editingParticipant.eventId) errors.eventId = 'Pilih kegiatan wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const isEdit = Boolean(editingParticipant.id);
    const saved = storage.saveParticipant({
      ...editingParticipant,
      fullName: editingParticipant.fullName!.trim(),
      email: editingParticipant.email!.trim(),
      eventId: editingParticipant.eventId!,
      phone: editingParticipant.phone?.trim(),
      organization: editingParticipant.organization?.trim() || '',
      jobTitle: editingParticipant.jobTitle?.trim() || 'Profesional',
      role: editingParticipant.role || 'Peserta',
      attendanceStatus: editingParticipant.attendanceStatus || 'MENUNGGU_VALIDASI',
    });

    setToast({
      text: isEdit
        ? `Data peserta "${saved.fullName}" berhasil diperbarui.`
        : `Peserta "${saved.fullName}" berhasil ditambahkan.`,
      type: 'success',
    });

    setIsModalOpen(false);
    setEditingParticipant(null);
    reloadData();
  };

  const handleAttendanceChange = (id: string, newStatus: AttendanceStatus) => {
    storage.updateAttendance(id, newStatus);
    reloadData();
  };

  const filtered = participants.filter((p) => {
    const matchEvent = selectedEventId === 'ALL' || p.eventId === selectedEventId;
    const matchStatus = statusFilter === 'ALL' || p.attendanceStatus === statusFilter;
    const matchSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 font-body">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-heading font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                : 'bg-red-950/90 text-red-200 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Data Peserta Kegiatan</h2>
          <p className="text-xs text-slate-400">
            Daftar seluruh peserta terdaftar, status verifikasi presensi, dan penerbitan sertifikat resmi ARTAKARYA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Peserta</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 flex flex-col md:flex-row gap-3 backdrop-blur-xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari peserta berdasarkan nama, email, perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-slate-200 text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
          >
            <option value="ALL">Semua Kegiatan</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-slate-200 text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
          >
            <option value="ALL">Semua Kehadiran</option>
            <option value="HADIR">Hadir (Tervalidasi)</option>
            <option value="MENUNGGU_VALIDASI">Menunggu Validasi</option>
            <option value="TIDAK_HADIR">Tidak Hadir</option>
          </select>
        </div>
      </div>

      {/* Participant Table */}
      <div className="rounded-3xl bg-[#101B55]/40 border border-blue-900/60 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050B2E] border-b border-blue-900/60 text-slate-400 font-stat uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama & Kontak Peserta</th>
                <th className="px-5 py-3.5">Instansi / Peran</th>
                <th className="px-5 py-3.5">Kegiatan</th>
                <th className="px-5 py-3.5">Status Kehadiran</th>
                <th className="px-5 py-3.5">Sertifikat</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-body">
                    Tidak ada data peserta yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const ev = events.find((e) => e.id === p.eventId);
                  return (
                    <tr key={p.id} className="hover:bg-[#101B55]/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-heading font-bold text-white text-sm">{p.fullName}</div>
                        <div className="text-slate-400 text-[11px] font-body">{p.email}</div>
                        {p.phone && <div className="text-slate-500 text-[10px] font-stat">{p.phone}</div>}
                      </td>

                      <td className="px-5 py-4 font-body">
                        <div className="text-slate-200 font-medium">{p.organization}</div>
                        <div className="text-slate-400 text-[11px]">{p.jobTitle}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-stat font-bold bg-[#101B55] text-cyan-300 border border-blue-800">
                          {p.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-200 font-heading font-semibold max-w-[200px] truncate">
                          {ev?.title || p.eventId}
                        </div>
                        <div className="text-slate-400 text-[11px] font-stat">{ev?.formattedDate || ev?.date}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <select
                            value={p.attendanceStatus}
                            onChange={(e) =>
                              handleAttendanceChange(p.id, e.target.value as AttendanceStatus)
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border focus:outline-none ${
                              p.attendanceStatus === 'HADIR'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                                : p.attendanceStatus === 'MENUNGGU_VALIDASI'
                                ? 'bg-blue-950/80 text-cyan-300 border-blue-700/60'
                                : 'bg-red-950/80 text-red-400 border-red-700/60'
                            }`}
                          >
                            <option value="HADIR">Hadir</option>
                            <option value="MENUNGGU_VALIDASI">Menunggu</option>
                            <option value="TIDAK_HADIR">Tidak Hadir</option>
                          </select>
                          {p.validatedAt && (
                            <div className="text-[10px] text-slate-500 font-stat">
                              Val: {p.validatedAt}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {p.certificateIssued ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-stat font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                              <Award className="w-3 h-3 text-[#00E5FF]" />
                              {p.certificateNumber}
                            </span>
                            <button
                              onClick={() =>
                                onPublicNavigate('detail', { certNumber: p.certificateNumber })
                              }
                              className="block text-[10px] text-cyan-400 hover:underline mt-1 font-heading"
                            >
                              Lihat Dokumen
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic font-body">
                            Belum Diterbitkan
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900 text-[#00E5FF] hover:text-white border border-blue-800"
                            title="Edit Data Peserta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleInitiateDelete(p)}
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white border border-red-900"
                            title="Hapus Peserta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Peserta */}
      {isModalOpen && editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-2xl p-6 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingParticipant.id ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingParticipant(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParticipant} className="space-y-3.5 py-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Masukkan Nama Peserta *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Peserta (Contoh: Budi Santoso, S.Kom., M.B.A.)"
                  value={editingParticipant.fullName || ''}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
                {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">Alamat Email *</label>
                <input
                  type="email"
                  placeholder="peserta@domain.com"
                  value={editingParticipant.email || ''}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
                {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={editingParticipant.phone || ''}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">Kegiatan ARTAKARYA *</label>
                <select
                  value={editingParticipant.eventId || ''}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, eventId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.formattedDate || ev.date})
                    </option>
                  ))}
                </select>
                {formErrors.eventId && <p className="text-red-400 text-xs mt-1">{formErrors.eventId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Instansi / Perusahaan</label>
                  <input
                    type="text"
                    placeholder="PT Nusantara Tech"
                    value={editingParticipant.organization || ''}
                    onChange={(e) => setEditingParticipant({ ...editingParticipant, organization: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Jabatan / Profesi</label>
                  <input
                    type="text"
                    placeholder="Chief Executive Officer"
                    value={editingParticipant.jobTitle || ''}
                    onChange={(e) => setEditingParticipant({ ...editingParticipant, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Peran</label>
                  <select
                    value={editingParticipant.role || 'Peserta'}
                    onChange={(e) =>
                      setEditingParticipant({ ...editingParticipant, role: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Peserta">Peserta</option>
                    <option value="VIP">VIP</option>
                    <option value="Pembicara">Pembicara</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-heading font-semibold mb-1">Status Kehadiran</label>
                  <select
                    value={editingParticipant.attendanceStatus || 'MENUNGGU_VALIDASI'}
                    onChange={(e) =>
                      setEditingParticipant({
                        ...editingParticipant,
                        attendanceStatus: e.target.value as AttendanceStatus,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="MENUNGGU_VALIDASI">Menunggu Validasi</option>
                    <option value="HADIR">Hadir</option>
                    <option value="TIDAK_HADIR">Tidak Hadir</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingParticipant(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#101B55] text-slate-300 font-heading font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold"
                >
                  {editingParticipant.id ? 'Simpan Perubahan' : 'Simpan Peserta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Peserta (Explicit & Iframe Safe) */}
      {participantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border-2 border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-950/70 border border-red-500/40">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Konfirmasi Hapus Peserta</h3>
                <p className="text-xs text-red-300/80">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#101B55]/60 border border-blue-900/60 text-xs space-y-2">
              <div>
                <span className="text-slate-400">Nama Peserta:</span>
                <p className="font-heading font-bold text-sm text-white">{participantToDelete.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-stat text-slate-200">{participantToDelete.email}</p>
              </div>
              {participantToDelete.certificateIssued && (
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] font-body">
                  ⚠️ <strong>Perhatian:</strong> Peserta ini telah memiliki sertifikat terbit ({participantToDelete.certificateNumber}). Sertifikat yang sudah diterbitkan akan tetap tersimpan di basis data untuk menjaga integritas riwayat verifikasi publik.
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 font-body">
              Apakah Anda yakin ingin menghapus peserta ini dari database kegiatan? Data yang dihapus tidak akan muncul kembali setelah halaman dimuat ulang.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setParticipantToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-[#101B55]/80 text-slate-300 font-heading font-semibold text-xs disabled:opacity-50 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:opacity-95 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Peserta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
