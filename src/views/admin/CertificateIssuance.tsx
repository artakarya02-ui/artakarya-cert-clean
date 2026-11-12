import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Users,
  Eye,
  Check,
  Layers,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { ParticipantItem, EventItem } from '../../types';

interface CertificateIssuanceProps {
  initialEventId?: string;
  onAdminNavigate: (subView: string, params?: any) => void;
  onPublicNavigate: (view: string, params?: any) => void;
}

export const CertificateIssuance: React.FC<CertificateIssuanceProps> = ({
  initialEventId,
  onAdminNavigate,
  onPublicNavigate,
}) => {
  const events = storage.getEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || events[0]?.id || 'evt-ai-ceo-2026'
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const participants = storage.getParticipants(selectedEventId);
  const eligible = participants.filter((p) => p.attendanceStatus === 'HADIR' && !p.certificateIssued);
  const alreadyIssued = participants.filter((p) => p.certificateIssued);

  const handleSelectAll = () => {
    if (selectedParticipants.length === eligible.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(eligible.map((p) => p.id));
    }
  };

  const handleToggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleIssueBatch = async () => {
    if (selectedParticipants.length === 0) return;

    setIsIssuing(true);
    let count = 0;

    for (const pId of selectedParticipants) {
      const cert = storage.issueCertificate(pId);
      if (cert) count++;
    }

    confetti({
      particleCount: 110,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#00E5FF', '#087BFF', '#7928CA', '#E83EFF', '#FFC857'],
    });

    setIsIssuing(false);
    setSuccessCount(count);
    setSelectedParticipants([]);
  };

  return (
    <div className="space-y-6 font-body">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Penerbitan Sertifikat Digital</h2>
          <p className="text-xs text-slate-400">
            Workflow batch generator nomor seri unik dan tanda tangan kriptografis ARTAKARYA.
          </p>
        </div>

        <button
          onClick={() => onAdminNavigate('history')}
          className="px-4 py-2 rounded-2xl bg-[#101B55] hover:bg-blue-900 border border-[#00E5FF]/30 text-cyan-300 text-xs font-heading font-semibold flex items-center gap-1.5 self-start"
        >
          <Award className="w-4 h-4 text-[#00E5FF]" />
          <span>Lihat Riwayat Terbit</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successCount !== null && (
        <div className="p-5 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">
                Berhasil Menerbitkan {successCount} Sertifikat Kredensial!
              </h4>
              <p className="text-xs text-emerald-300/90 font-body">
                Nomor seri unik, hash SHA-256, dan tautan verifikasi telah aktif secara instan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdminNavigate('history')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs"
            >
              Buka Riwayat Sertifikat →
            </button>
            <button
              onClick={() => setSuccessCount(null)}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Event Selection & Issuance Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Queue (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="p-5 rounded-3xl bg-[#101B55]/40 border border-[#00E5FF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-stat font-bold text-slate-400 block mb-1">
                Pilih Kegiatan ARTAKARYA
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedParticipants([]);
                  setSuccessCount(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white font-heading font-bold text-sm focus:outline-none focus:border-[#00E5FF]"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-stat font-bold uppercase">Format Serial</span>
                <span className="font-stat text-xs font-bold text-[#00E5FF]">
                  {selectedEvent?.certificatePrefix}-XXX
                </span>
              </div>
            </div>
          </div>

          {/* Queue of Eligible Participants */}
          <div className="rounded-3xl bg-[#101B55]/40 border border-blue-900/60 overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="p-4 bg-[#050B2E] border-b border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={eligible.length > 0 && selectedParticipants.length === eligible.length}
                  onChange={handleSelectAll}
                  disabled={eligible.length === 0}
                  className="w-4 h-4 rounded text-[#087BFF] bg-slate-900 border-slate-700"
                />
                <label htmlFor="selectAll" className="font-heading font-bold text-xs text-white cursor-pointer">
                  Pilih Semua Peserta Tervalidasi ({selectedParticipants.length}/{eligible.length})
                </label>
              </div>

              <span className="text-[11px] text-slate-400 font-body">
                Hanya peserta berstatus <strong className="text-emerald-400">HADIR</strong>
              </span>
            </div>

            <div className="divide-y divide-blue-900/40 max-h-96 overflow-y-auto">
              {eligible.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs space-y-2 font-body">
                  <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-heading font-semibold text-slate-300">
                    Tidak ada antrean peserta yang menunggu penerbitan sertifikat.
                  </p>
                  <p className="text-slate-500">
                    Semua peserta yang hadir telah memiliki sertifikat, atau Anda perlu memvalidasi kehadiran peserta terlebih dahulu.
                  </p>
                  <button
                    onClick={() => onAdminNavigate('attendance', { eventId: selectedEventId })}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-white font-heading font-bold"
                  >
                    Buka Validasi Presensi
                  </button>
                </div>
              ) : (
                eligible.map((p, idx) => {
                  const isChecked = selectedParticipants.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleParticipant(p.id)}
                      className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-[#087BFF]/20 border-l-4 border-[#00E5FF]' : 'hover:bg-[#101B55]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#087BFF] bg-slate-900 border-slate-700"
                        />
                        <div>
                          <p className="font-heading font-bold text-white text-sm">{p.fullName}</p>
                          <p className="text-xs text-slate-400 font-body">{p.email} • {p.organization}</p>
                        </div>
                      </div>

                      <div className="text-right font-stat">
                        <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                          Antrean #{idx + 1}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          Val: {p.validatedAt || 'Otomatis'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Issuance Bar */}
            {eligible.length > 0 && (
              <div className="p-4 bg-[#050B2E] border-t border-blue-900/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-body">
                  <strong className="text-[#00E5FF] font-stat">{selectedParticipants.length}</strong> peserta dipilih
                </span>
                <button
                  onClick={handleIssueBatch}
                  disabled={selectedParticipants.length === 0 || isIssuing}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isIssuing
                      ? 'Menerbitkan Kredensial...'
                      : `Terbitkan ${selectedParticipants.length} Sertifikat`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Template & Event Card (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-[#101B55]/50 border border-blue-900/60 space-y-4 backdrop-blur-xl">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <span>Spesifikasi Kredensial</span>
            </h3>

            <div className="space-y-3 text-xs font-body">
              <div className="p-3.5 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block font-stat text-[10px]">Format Layout</span>
                <p className="font-heading font-bold text-[#00E5FF] mt-0.5">Ivory / White Precision (A4)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bingkai tipis elegan, stempel resmi, dan QR verifikasi.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block font-stat text-[10px]">Penandatangan Utama</span>
                <p className="font-heading font-bold text-white mt-0.5">Dr. Arya Pratama, M.Kom.</p>
                <p className="text-[11px] text-slate-400">Founder & AI Strategist ARTAKARYA</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block font-stat text-[10px]">Penandatangan Pendamping</span>
                <p className="font-heading font-bold text-white mt-0.5">Nadia Salsabila, S.T., M.M.</p>
                <p className="text-[11px] text-slate-400">Head of Certification Board</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#050B2E] border border-blue-950">
                <span className="text-slate-500 block font-stat text-[10px]">Integritas Hash</span>
                <p className="font-stat text-cyan-300 font-bold mt-0.5">SHA-256 HMAC Digital Signature</p>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 border-t border-blue-900/60 font-stat">
              <span>Sudah Diterbitkan: <strong className="text-white">{alreadyIssued.length}</strong> peserta</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
