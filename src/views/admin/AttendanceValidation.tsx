import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Search,
  CheckCheck,
  Award,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { ParticipantItem, AttendanceStatus } from '../../types';

interface AttendanceValidationProps {
  onAdminNavigate: (subView: string, params?: any) => void;
}

export const AttendanceValidation: React.FC<AttendanceValidationProps> = ({ onAdminNavigate }) => {
  const events = storage.getEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || 'evt-ai-ceo-2026'
  );
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState<ParticipantItem[]>(
    storage.getParticipants(selectedEventId)
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const reloadData = (eId?: string) => {
    setParticipants(storage.getParticipants(eId || selectedEventId));
  };

  const handleEventChange = (eId: string) => {
    setSelectedEventId(eId);
    reloadData(eId);
  };

  const handleUpdateStatus = (id: string, newStatus: AttendanceStatus) => {
    storage.updateAttendance(id, newStatus);
    reloadData();
  };

  const handleValidateAll = () => {
    if (confirm(`Validasi kehadiran seluruh peserta untuk kegiatan "${selectedEvent?.title}"?`)) {
      const count = storage.validateAllAttendance(selectedEventId);
      reloadData();
      alert(`Berhasil memvalidasi kehadiran ${count} peserta!`);
    }
  };

  // Metrics
  const total = participants.length;
  const hadir = participants.filter((p) => p.attendanceStatus === 'HADIR').length;
  const pending = participants.filter((p) => p.attendanceStatus === 'MENUNGGU_VALIDASI').length;
  const absen = participants.filter((p) => p.attendanceStatus === 'TIDAK_HADIR').length;
  const readyToIssue = participants.filter((p) => p.attendanceStatus === 'HADIR' && !p.certificateIssued).length;

  const filtered = participants.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Validasi Kehadiran Peserta</h2>
          <p className="text-xs text-slate-400">
            Verifikasi presensi sebelum peserta berhak menerima sertifikat resmi ARTAKARYA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleValidateAll}
            className="px-4 py-2.5 rounded-2xl bg-[#101B55] hover:bg-blue-900 border border-[#00E5FF]/40 text-cyan-300 font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#00E5FF]" />
            <span>Validasi Hadir Semua</span>
          </button>
          
          <button
            onClick={() => onAdminNavigate('issue', { eventId: selectedEventId })}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
          >
            <Award className="w-4 h-4 text-white" />
            <span>Terbitkan Sertifikat ({readyToIssue})</span>
          </button>
        </div>
      </div>

      {/* Event Selector & Filter */}
      <div className="p-4 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 flex flex-col md:flex-row items-center gap-3 backdrop-blur-xl">
        <div className="w-full md:w-80">
          <label className="text-[10px] uppercase font-stat font-bold text-slate-400 block mb-1">
            Pilih Kegiatan
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs font-heading font-semibold focus:outline-none focus:border-[#00E5FF]"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full relative pt-4 md:pt-0">
          <Search className="w-4 h-4 text-[#00E5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama peserta / perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>
      </div>

      {/* Mini KPI Cards for this Event with Space Grotesk */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-stat">
        <div className="p-4 rounded-2xl bg-[#101B55]/40 border border-blue-900/60 backdrop-blur-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-heading">Total Terdaftar</span>
          <p className="text-2xl font-bold text-white mt-0.5">{total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 backdrop-blur-xl">
          <span className="text-[10px] text-emerald-400 font-bold uppercase font-heading">Hadir Tervalidasi</span>
          <p className="text-2xl font-bold text-emerald-400 mt-0.5">{hadir}</p>
        </div>
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-900/50 backdrop-blur-xl">
          <span className="text-[10px] text-cyan-300 font-bold uppercase font-heading">Menunggu Validasi</span>
          <p className="text-2xl font-bold text-cyan-300 mt-0.5">{pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-fuchsia-950/30 border border-fuchsia-900/50 backdrop-blur-xl">
          <span className="text-[10px] text-fuchsia-300 font-bold uppercase font-heading">Siap Terbit Sertifikat</span>
          <p className="text-2xl font-bold text-fuchsia-300 mt-0.5">{readyToIssue}</p>
        </div>
      </div>

      {/* Validation Checklist Table */}
      <div className="rounded-3xl bg-[#101B55]/40 border border-blue-900/60 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050B2E] border-b border-blue-900/60 text-slate-400 font-stat uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Peserta</th>
                <th className="px-5 py-3.5">Instansi</th>
                <th className="px-5 py-3.5">Status Kehadiran</th>
                <th className="px-5 py-3.5">Waktu Verifikasi</th>
                <th className="px-5 py-3.5 text-right">Aksi Presensi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500 font-body">
                    Tidak ada peserta dalam daftar ini.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#101B55]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-heading font-bold text-white text-sm">{p.fullName}</div>
                      <div className="text-slate-400 text-[11px] font-body">{p.email}</div>
                    </td>

                    <td className="px-5 py-3.5 font-body">
                      <div className="text-slate-200">{p.organization}</div>
                      <span className="text-slate-400 text-[11px]">{p.jobTitle}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-stat font-bold ${
                          p.attendanceStatus === 'HADIR'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : p.attendanceStatus === 'MENUNGGU_VALIDASI'
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {p.attendanceStatus === 'HADIR' && <CheckCircle className="w-3 h-3" />}
                        {p.attendanceStatus === 'MENUNGGU_VALIDASI' && <Clock className="w-3 h-3" />}
                        {p.attendanceStatus === 'TIDAK_HADIR' && <XCircle className="w-3 h-3" />}
                        <span>{p.attendanceStatus.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[11px] text-slate-400 font-stat">
                      {p.validatedAt ? (
                        <div>
                          <span className="text-slate-200 font-medium">{p.validatedAt}</span>
                          <span className="text-[10px] text-slate-500 block font-body">{p.validatedBy}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-600 font-body">Belum divalidasi</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 font-heading">
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'HADIR')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            p.attendanceStatus === 'HADIR'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'MENUNGGU_VALIDASI')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            p.attendanceStatus === 'MENUNGGU_VALIDASI'
                              ? 'bg-[#087BFF] text-white shadow'
                              : 'bg-[#101B55] hover:bg-blue-900 text-cyan-300 border border-blue-800'
                          }`}
                        >
                          Menunggu
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'TIDAK_HADIR')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            p.attendanceStatus === 'TIDAK_HADIR'
                              ? 'bg-red-600 text-white shadow'
                              : 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800'
                          }`}
                        >
                          Absen
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

    </div>
  );
};
