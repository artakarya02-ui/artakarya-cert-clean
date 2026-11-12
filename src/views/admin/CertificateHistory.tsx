import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  X,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { supabaseService } from '../../services/supabaseService';
import { CertificateItem, CertificateStatus } from '../../types';
import { downloadCertificatePDF } from '../../utils/pdfExport';

interface CertificateHistoryProps {
  onAdminNavigate: (subView: string, params?: any) => void;
  onPublicNavigate: (view: string, params?: any) => void;
}

export const CertificateHistory: React.FC<CertificateHistoryProps> = ({
  onAdminNavigate,
  onPublicNavigate,
}) => {
  const [certs, setCerts] = useState<CertificateItem[]>(storage.getCertificates());
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selection Checkbox State
  const [selectedCertNumbers, setSelectedCertNumbers] = useState<string[]>([]);

  // Revoke Modal State
  const [revokingCert, setRevokingCert] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Delete Confirmation Modal State
  const [deletingCert, setDeletingCert] = useState<CertificateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [showDeleteDemoModal, setShowDeleteDemoModal] = useState(false);

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const events = storage.getEvents();

  const reloadData = () => {
    setCerts(storage.getCertificates());
  };

  const handleDownload = async (cert: CertificateItem) => {
    storage.incrementDownload(cert.id);
    reloadData();
    await downloadCertificatePDF(cert);
  };

  const handleOpenRevoke = (cert: CertificateItem) => {
    setRevokingCert(cert);
    setRevokeReason('Koreksi data administratif oleh ARTAKARYA');
  };

  const handleConfirmRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingCert) return;
    storage.revokeCertificate(revokingCert.id, revokeReason);
    setRevokingCert(null);
    reloadData();
  };

  const handleReactivate = (cert: CertificateItem) => {
    if (confirm(`Aktifkan kembali sertifikat ${cert.certificateNumber}?`)) {
      storage.activateCertificate(cert.id);
      reloadData();
      showToast(`Sertifikat ${cert.certificateNumber} berhasil diaktifkan kembali.`);
    }
  };

  // 1. Single Delete
  const handleOpenDelete = (cert: CertificateItem) => {
    setDeletingCert(cert);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCert) return;
    setIsDeleting(true);

    try {
      const targetNumber = deletingCert.certificateNumber;
      const targetName = deletingCert.participantName;

      // Real-time local state update & Supabase delete via storage
      storage.deleteCertificate(targetNumber);

      // Instantly update certs state so row disappears immediately without refresh
      setCerts((prev) => prev.filter((c) => c.certificateNumber !== targetNumber));
      setSelectedCertNumbers((prev) => prev.filter((n) => n !== targetNumber));

      setDeletingCert(null);
      showToast(`Sertifikat ${targetNumber} milik "${targetName}" berhasil dihapus permanen dari sistem & Supabase.`);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(`Gagal menghapus sertifikat: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 2. Batch Delete
  const handleConfirmBatchDelete = async () => {
    if (!selectedCertNumbers.length) return;
    setIsDeleting(true);

    try {
      const count = storage.batchDeleteCertificates(selectedCertNumbers);
      const targetSet = new Set(selectedCertNumbers);

      setCerts((prev) => prev.filter((c) => !targetSet.has(c.certificateNumber)));
      setSelectedCertNumbers([]);
      setShowBatchDeleteModal(false);

      showToast(`Berhasil menghapus permanen ${count} sertifikat terpilih.`);
    } catch (err: any) {
      showToast(`Gagal menghapus sertifikat terpilih: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Delete Demo Data
  const handleConfirmDeleteDemo = async () => {
    setIsDeleting(true);
    try {
      const count = storage.deleteDemoCertificates();
      setCerts(storage.getCertificates());
      setSelectedCertNumbers([]);
      setShowDeleteDemoModal(false);

      showToast(`Berhasil membersihkan ${count} sertifikat data demo.`);
    } catch (err: any) {
      showToast(`Gagal menghapus data demo: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection Checkbox Helpers
  const handleToggleSelectAll = () => {
    if (selectedCertNumbers.length === filtered.length && filtered.length > 0) {
      setSelectedCertNumbers([]);
    } else {
      setSelectedCertNumbers(filtered.map((c) => c.certificateNumber));
    }
  };

  const handleToggleSelect = (certNumber: string) => {
    setSelectedCertNumbers((prev) =>
      prev.includes(certNumber) ? prev.filter((n) => n !== certNumber) : [...prev, certNumber]
    );
  };

  const filtered = certs.filter((c) => {
    const matchEvent = selectedEventId === 'ALL' || c.eventId === selectedEventId;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchSearch =
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.participantEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.eventTitle.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Riwayat Penerbitan Sertifikat</h2>
          <p className="text-xs text-slate-400">
            Daftar seluruh sertifikat digital resmi yang telah diterbitkan oleh ARTAKARYA Creative Intelligence Lab.
          </p>
        </div>

        <button
          onClick={() => onAdminNavigate('issue')}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
        >
          <Award className="w-4 h-4 text-white" />
          <span>Terbitkan Sertifikat Baru</span>
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter, Search, and Bulk Actions Bar */}
      <div className="p-4 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 space-y-3 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor seri, nama peserta, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-slate-200 text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-slate-200 text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif & Sah</option>
              <option value="DICABUT">Dicabut (Revoked)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Buttons Row */}
        <div className="pt-2 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-[#050B2E] hover:bg-[#101B55] border border-blue-800 text-slate-300 flex items-center gap-1.5 font-heading text-xs font-semibold"
            >
              {selectedCertNumbers.length > 0 && selectedCertNumbers.length === filtered.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#00E5FF]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{selectedCertNumbers.length > 0 ? `Batal Pilih (${selectedCertNumbers.length})` : 'Pilih Semua'}</span>
            </button>

            {selectedCertNumbers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/60 text-red-300 hover:text-white flex items-center gap-1.5 font-heading text-xs font-bold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Hapus Terpilih ({selectedCertNumbers.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteDemoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-500/40 text-fuchsia-300 hover:text-white flex items-center gap-1.5 font-heading text-xs font-semibold"
              title="Bersihkan seluruh sertifikat berkategori demo/contoh"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Hapus Semua Data Demo</span>
            </button>

            <span className="text-[11px] font-stat text-slate-400">
              Total: <strong className="text-[#00E5FF] font-bold">{filtered.length}</strong> Sertifikat
            </span>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="rounded-3xl bg-[#101B55]/40 border border-blue-900/60 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050B2E] border-b border-blue-900/60 text-slate-400 font-stat uppercase font-bold tracking-wider">
              <tr>
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedCertNumbers.length === filtered.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-700 text-[#00E5FF] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Nomor Seri & Status</th>
                <th className="px-5 py-3.5">Penerima & Instansi</th>
                <th className="px-5 py-3.5">Kegiatan</th>
                <th className="px-4 py-3.5">Tgl Terbit</th>
                <th className="px-4 py-3.5">Unduhan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-body">
                    Tidak ada sertifikat dalam kategori ini.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#101B55]/60 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCertNumbers.includes(cert.certificateNumber)}
                        onChange={() => handleToggleSelect(cert.certificateNumber)}
                        className="rounded border-slate-700 text-[#00E5FF] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-stat font-bold text-[#00E5FF] text-sm">
                        {cert.certificateNumber}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-stat">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cert.status === 'AKTIF'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {cert.status === 'AKTIF' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{cert.status}</span>
                        </span>
                        {cert.isDemo && (
                          <span className="text-[9px] text-fuchsia-300 font-stat">DEMO</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-body">
                      <div className="font-heading font-bold text-white text-sm">{cert.participantName}</div>
                      <div className="text-slate-400 text-[11px]">{cert.participantEmail}</div>
                      {cert.participantOrg && (
                        <div className="text-slate-500 text-[10px] mt-0.5">{cert.participantOrg}</div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-200 font-heading font-semibold max-w-[200px] truncate">
                        {cert.eventTitle}
                      </div>
                      <div className="text-slate-500 text-[10px] font-stat">{cert.eventDate}</div>
                    </td>

                    <td className="px-4 py-4 font-stat text-slate-400">
                      {cert.issueDate}
                    </td>

                    <td className="px-4 py-4 text-[11px] font-stat">
                      <span className="text-slate-300 font-semibold">{cert.downloadCount}x</span>
                      {cert.lastDownloadedAt && (
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {cert.lastDownloadedAt}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            onPublicNavigate('detail', { certNumber: cert.certificateNumber })
                          }
                          className="p-1.5 rounded-xl bg-[#087BFF]/30 hover:bg-[#087BFF]/50 border border-[#087BFF]/40 text-white"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                        </button>

                        <button
                          onClick={() => handleDownload(cert)}
                          className="p-1.5 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[#00E5FF]"
                          title="Unduh PDF Resmi"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {cert.status === 'AKTIF' ? (
                          <button
                            onClick={() => handleOpenRevoke(cert)}
                            className="p-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 hover:text-white border border-amber-800/60"
                            title="Cabut / Nonaktifkan Sertifikat"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(cert)}
                            className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 hover:text-white border border-emerald-900"
                            title="Aktifkan Kembali Sertifikat"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Tombol Hapus Sertifikat Permanen */}
                        <button
                          onClick={() => handleOpenDelete(cert)}
                          className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/70 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white transition-all shadow-sm"
                          title="Hapus Sertifikat Permanen dari Sistem & Supabase"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Tunggal */}
      {deletingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border border-red-500/60 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="font-heading font-bold text-base text-white">Hapus Sertifikat Permanen</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingCert(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-body">
              <p className="text-slate-300 leading-relaxed">
                Yakin ingin menghapus sertifikat{' '}
                <strong className="text-cyan-300 font-stat">
                  [{deletingCert.certificateNumber}]
                </strong>{' '}
                milik <strong className="text-white font-heading font-bold">[{deletingCert.participantName}]</strong>?
              </p>

              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Peringatan Penghapusan Permanen:</span>
                </p>
                <p className="text-[11px] leading-relaxed text-red-300/90">
                  Data akan dihapus permanen dari sistem dan tabel <code className="text-cyan-300 font-mono">certificates</code> di Supabase. QR Code dan tautan verifikasi sertifikat ini tidak akan lagi ditemukan oleh publik.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-heading">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCert(null)}
                className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-[#101B55]/80 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Terpilih (Batch Delete) */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border border-red-500/60 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h3 className="font-heading font-bold text-base text-white">Hapus {selectedCertNumbers.length} Sertifikat Terpilih</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-body">
              <p className="text-slate-300 leading-relaxed">
                Yakin ingin menghapus seluruh <strong className="text-white font-bold">{selectedCertNumbers.length} sertifikat terpilih</strong> secara permanen dari database?
              </p>

              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                Data akan langsung terhapus dari penyimpanan lokal dan database Supabase. Tindakan ini tidak dapat dibatalkan.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-heading">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-[#101B55]/80 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmBatchDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : `Hapus ${selectedCertNumbers.length} Sertifikat`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Semua Data Demo */}
      {showDeleteDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border border-fuchsia-500/60 rounded-3xl shadow-[0_0_50px_rgba(217,70,239,0.25)] p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-900/60">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <h3 className="font-heading font-bold text-base text-white">Bersihkan Data Demo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteDemoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-body">
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda ingin menghapus seluruh sertifikat bawaan contoh (Demo) agar daftar riwayat menjadi bersih untuk data kegiatan asli Anda?
              </p>

              <div className="p-3 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-300 text-xs">
                Sertifikat demo akan dihapus permanen dari sistem dan disinkronkan ke Supabase.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-heading">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteDemoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#101B55] hover:bg-[#101B55]/80 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteDemo}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Membersihkan...' : 'Ya, Bersihkan Data Demo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
