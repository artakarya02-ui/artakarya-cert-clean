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
} from 'lucide-react';
import { storage } from '../../services/storage';
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

  // Revoke Modal State
  const [revokingCert, setRevokingCert] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

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
    }
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 flex flex-col md:flex-row gap-3 backdrop-blur-xl">
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

      {/* Certificates Table */}
      <div className="rounded-3xl bg-[#101B55]/40 border border-blue-900/60 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050B2E] border-b border-blue-900/60 text-slate-400 font-stat uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nomor Seri & Status</th>
                <th className="px-5 py-3.5">Penerima & Instansi</th>
                <th className="px-5 py-3.5">Kegiatan</th>
                <th className="px-5 py-3.5">Tgl Terbit</th>
                <th className="px-5 py-3.5">Unduhan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-body">
                    Tidak ada sertifikat dalam kategori ini.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#101B55]/60 transition-colors">
                    <td className="px-5 py-4">
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

                    <td className="px-5 py-4 font-stat text-slate-400">
                      {cert.issueDate}
                    </td>

                    <td className="px-5 py-4 text-[11px] font-stat">
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
                            className="p-1.5 rounded-xl bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white border border-red-900"
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cabut Sertifikat */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border border-red-500/50 rounded-3xl shadow-2xl p-6 text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base">Cabut Sertifikat</h3>
              </div>
              <button
                onClick={() => setRevokingCert(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRevoke} className="space-y-4 py-4 text-xs sm:text-sm font-body">
              <p className="text-slate-300">
                Apakah Anda yakin ingin mencabut sertifikat nomor{' '}
                <strong className="text-cyan-300 font-stat">
                  {revokingCert.certificateNumber}
                </strong>{' '}
                atas nama <strong className="text-white font-heading">{revokingCert.participantName}</strong>?
              </p>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Alasan Pencabutan Resmi *
                </label>
                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-red-900/60 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 font-heading">
                <button
                  type="button"
                  onClick={() => setRevokingCert(null)}
                  className="px-4 py-2 rounded-xl bg-[#101B55] text-slate-300 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
                >
                  Ya, Cabut Sertifikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
