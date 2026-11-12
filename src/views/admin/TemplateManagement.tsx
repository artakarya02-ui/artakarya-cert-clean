import React, { useState, useEffect } from 'react';
import {
  Layers,
  Check,
  Eye,
  Award,
  Sparkles,
  ShieldCheck,
  Sliders,
  Cpu,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  CheckCircle,
  Star,
  Settings,
  Calendar,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { CertificateTemplate, CertificateItem } from '../../types';
import { CertificateRenderer } from '../../components/certificate/CertificateRenderer';
import { TemplateUploadModal } from './TemplateUploadModal';

interface TemplateManagementProps {
  onPublicNavigate: (view: string, params?: any) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({ onPublicNavigate }) => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Upload & Customizer Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  // Edit Name Modal
  const [editingNameTemplate, setEditingNameTemplate] = useState<CertificateTemplate | null>(null);
  const [tempName, setTempName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Delete Confirmation Modal
  const [templateToDelete, setTemplateToDelete] = useState<CertificateTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const reloadTemplates = () => {
    const list = storage.getTemplates();
    setTemplates(list);
    if (list.length > 0) {
      const currentActive = list.find((t) => t.id === activeTemplateId);
      if (!currentActive) {
        const def = list.find((t) => t.isDefault) || list[0];
        setActiveTemplateId(def.id);
      }
    } else {
      setActiveTemplateId('');
    }
  };

  useEffect(() => {
    // Initial sync with IndexedDB & backend
    setIsLoading(true);
    storage.loadCustomTemplates().then(() => {
      reloadTemplates();
      setIsLoading(false);
    });

    const unsubscribe = storage.subscribe(reloadTemplates);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    const target = templates.find((t) => t.id === id);
    if (target) {
      setToast({
        text: `Template "${target.name}" dipilih untuk pratinjau aktif.`,
        type: 'success',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;

    target.isDefault = true;
    await storage.saveTemplate(target);
    setActiveTemplateId(id);
    reloadTemplates();
    setToast({
      text: `Template "${target.name}" sekarang ditetapkan sebagai TEMPLATE DEFAULT untuk penerbitan sertifikat.`,
      type: 'success',
    });
  };

  const handleSaveUploadedTemplate = async (savedTpl: CertificateTemplate) => {
    await storage.saveTemplate(savedTpl);
    reloadTemplates();
    setActiveTemplateId(savedTpl.id);
    setToast({
      text: `Template "${savedTpl.name}" berhasil diunggah dan disimpan ke database!`,
      type: 'success',
    });
  };

  const handleOpenUploadNew = () => {
    setEditingTemplate(null);
    setIsUploadModalOpen(true);
  };

  const handleOpenEditCustom = (tpl: CertificateTemplate) => {
    setEditingTemplate(tpl);
    setIsUploadModalOpen(true);
  };

  const handleOpenEditName = (tpl: CertificateTemplate) => {
    setEditingNameTemplate(tpl);
    setTempName(tpl.name);
  };

  const handleSaveName = async () => {
    if (!editingNameTemplate || !tempName.trim()) return;
    setIsSavingName(true);
    try {
      const updated: CertificateTemplate = {
        ...editingNameTemplate,
        name: tempName.trim(),
        updatedAt: new Date().toISOString(),
      };
      await storage.saveTemplate(updated);
      setToast({
        text: `Nama template berhasil diperbarui menjadi "${updated.name}".`,
        type: 'success',
      });
      setEditingNameTemplate(null);
      reloadTemplates();
    } catch (e: any) {
      setToast({ text: e?.message || 'Gagal mengubah nama template.', type: 'error' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      const deleted = await storage.deleteTemplate(templateToDelete.id);
      if (deleted) {
        setToast({
          text: `Template "${templateToDelete.name}" berhasil dihapus dari database.`,
          type: 'success',
        });
        setTemplateToDelete(null);
        reloadTemplates();
      } else {
        setToast({
          text: 'Gagal menghapus template.',
          type: 'error',
        });
      }
    } catch (e: any) {
      setToast({
        text: e?.message || 'Terjadi kesalahan saat menghapus template.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const previewCert: CertificateItem = {
    id: 'cert-preview-sample',
    certificateNumber: 'AK-20261102-AICEO-001',
    participantId: 'par-demo',
    participantName: 'Budi Santoso, S.Kom., M.B.A.',
    participantEmail: 'budi.santoso@nusantaradigital.id',
    participantOrg: 'PT Nusantara Digital Inovasi',
    participantRole: 'Peserta Masterclass',
    eventId: 'evt-ai-ceo-2026',
    eventTitle: 'AI CEO MASTERCLASS',
    eventSubtitle: 'Membangun Perusahaan dengan Karyawan AI',
    eventDate: '02 November 2026',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    issueDate: '02 November 2026',
    templateId: activeTemplate?.id || 'tpl-custom',
    orientation: activeTemplate?.orientation || 'landscape',
    verificationHash: 'e7f9a2b84c310d55e81f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    verificationUrl: typeof window !== 'undefined'
      ? `${window.location.origin}/?cert=AK-20261102-AICEO-001`
      : 'https://artakarya.id/?cert=AK-20261102-AICEO-001',
    status: 'AKTIF',
    downloadCount: 3,
    signer1: {
      name: 'Dr. Arya Pratama, M.Kom.',
      title: 'Founder & AI Strategist ARTAKARYA',
    },
    signer2: {
      name: 'Nadia Salsabila, S.T., M.M.',
      title: 'Head of Certification Board ARTAKARYA',
    },
  };

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
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
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

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Desain Template Sertifikat</h2>
          <p className="text-xs text-slate-400">
            Unggah dan kelola desain sertifikat resmi ARTAKARYA dalam format A4 Portrait maupun Landscape.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenUploadNew}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white text-xs sm:text-sm font-heading font-bold shadow-lg shadow-[#087BFF]/30 flex items-center gap-2 transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Unggah Template Baru</span>
          </button>
        </div>
      </div>

      {/* Area Unggah Desain Cepat / Banner Edukatif */}
      <div
        onClick={handleOpenUploadNew}
        className="p-6 rounded-3xl bg-gradient-to-r from-[#101B55]/60 via-[#050B2E] to-[#101B55]/60 border-2 border-dashed border-[#00E5FF]/40 hover:border-[#00E5FF] transition-all cursor-pointer group text-center backdrop-blur-xl"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#087BFF]/20 to-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.2)]">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="font-heading font-bold text-base text-white mt-3">
          Klik untuk Mengunggah Desain Template Sertifikat
        </h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto mt-1 font-body">
          Mendukung format PNG atau JPG resolusi tinggi. Tersedia penataan otomatis atau kustom untuk penempatan nama peserta, nomor sertifikat, tanggal, dan QR Code verifikasi.
        </p>
      </div>

      {/* JIKA BELUM ADA TEMPLATE */}
      {!isLoading && templates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#101B55]/30 border border-blue-900/60 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#050B2E] border border-blue-900 flex items-center justify-center text-slate-500">
            <ImageIcon className="w-10 h-10 text-slate-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Belum ada template sertifikat. Silakan unggah desain sertifikat ARTAKARYA Anda.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-body">
              Template bawaan telah dibersihkan. Anda memiliki kendali penuh untuk mengunggah desain piagam atau sertifikat resmi mandiri.
            </p>
          </div>
          <button
            onClick={handleOpenUploadNew}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] text-white font-heading font-bold text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Desain Sekarang</span>
          </button>
        </div>
      ) : (
        /* KETIKA SUDAH ADA TEMPLATE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Galeri Template Saya (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 block">
                Daftar Template Saya ({templates.length})
              </span>
              <span className="text-[11px] text-[#00E5FF] font-stat font-semibold">
                Klik kartu untuk memilih & pratinjau
              </span>
            </div>

            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {templates.map((tpl) => {
                const isSelected = tpl.id === activeTemplateId;
                const isDefault = tpl.isDefault;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-4 rounded-3xl border transition-all duration-200 relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'bg-[#101B55] border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.25)] ring-1 ring-[#00E5FF]'
                        : 'bg-[#101B55]/40 border-blue-900/40 hover:border-blue-700 hover:bg-[#101B55]/60'
                    }`}
                  >
                    {/* Thumbnail & Info Row */}
                    <div className="flex gap-4 items-start">
                      {/* Thumbnail Container */}
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-black/40 border border-blue-900 shrink-0 relative flex items-center justify-center">
                        {tpl.backgroundImageUrl ? (
                          <img
                            src={tpl.backgroundImageUrl}
                            alt={tpl.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-stat font-bold bg-black/80 text-white">
                          {tpl.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-heading font-bold text-sm text-white truncate">
                            {tpl.name}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-stat font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" />
                              AKTIF
                            </span>
                          )}
                          {isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-stat font-bold bg-amber-500/20 text-[#FFC857] border border-amber-500/40 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-[#FFC857]" />
                              DEFAULT
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-stat text-slate-400 bg-blue-950/60 border border-blue-900">
                            A4 {tpl.orientation === 'portrait' ? '210×297 mm' : '297×210 mm'}
                          </span>
                        </div>

                        {tpl.description && (
                          <p className="text-[11px] text-slate-300 font-body line-clamp-1 mb-2">
                            {tpl.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-blue-900/60 text-xs">
                      <div className="flex items-center gap-2">
                        {!isDefault ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(tpl.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-[#087BFF] text-cyan-300 hover:text-white border border-blue-800 text-[10px] font-heading font-semibold transition-colors"
                          >
                            Jadikan Default
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-stat font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-amber-300" />
                            Template Utama
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditName(tpl);
                          }}
                          className="p-1.5 rounded-lg bg-[#050B2E] hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-900 transition-colors"
                          title="Ganti Nama Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCustom(tpl);
                          }}
                          className="p-1.5 rounded-lg bg-[#050B2E] hover:bg-blue-900 text-cyan-300 hover:text-white border border-blue-900 transition-colors"
                          title="Atur Posisi Teks & QR Code"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(tpl);
                          }}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-900 transition-colors"
                          title="Hapus Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau Ukuran Besar (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00E5FF]" />
                Pratinjau Ukuran Besar: <strong className="text-white">{activeTemplate?.name}</strong>
              </span>
              <div className="flex items-center gap-2">
                {activeTemplate?.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-stat font-bold bg-amber-500/20 text-[#FFC857] border border-amber-500/40">
                    Template Default Sistem
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-stat font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                  {activeTemplate?.orientation === 'portrait' ? 'A4 Portrait (210×297 mm)' : 'A4 Landscape (297×210 mm)'}
                </span>
              </div>
            </div>

            {/* Canvas Renderer */}
            <div className="p-4 sm:p-6 rounded-3xl bg-[#050B2E] border-2 border-[#00E5FF]/30 shadow-2xl overflow-hidden backdrop-blur-xl">
              {activeTemplate ? (
                <CertificateRenderer
                  certificate={previewCert}
                  template={activeTemplate}
                  scale={1}
                />
              ) : (
                <div className="p-16 text-center text-slate-500">
                  Pilih salah satu template untuk melihat pratinjau.
                </div>
              )}
            </div>

            {/* Quick Actions Footer for Selected Template */}
            {activeTemplate && (
              <div className="p-4 rounded-2xl bg-[#101B55]/50 border border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-heading font-bold text-white text-sm">{activeTemplate.name}</p>
                  <p className="text-slate-400 font-stat text-[11px]">
                    Format: {activeTemplate.orientation === 'portrait' ? 'A4 Portrait' : 'A4 Landscape'} • Berkas: {activeTemplate.imageFileName || 'desain-mandiri.png'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditCustom(activeTemplate)}
                    className="px-4 py-2 rounded-xl bg-blue-900/50 hover:bg-blue-800 text-cyan-300 font-heading font-semibold flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Sesuaikan Posisi</span>
                  </button>
                  {!activeTemplate.isDefault && (
                    <button
                      onClick={() => handleSetDefault(activeTemplate.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-95 text-white font-heading font-bold flex items-center gap-1.5 shadow"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Jadikan Default</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Modal Edit Nama Template */}
      {editingNameTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <h3 className="font-heading text-lg font-bold text-white">Edit Nama Template</h3>
              <button
                onClick={() => setEditingNameTemplate(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-heading font-semibold text-xs mb-1">
                Nama Desain Template *
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Contoh: Template Wisuda AI 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/60 text-xs">
              <button
                type="button"
                onClick={() => setEditingNameTemplate(null)}
                className="px-4 py-2 rounded-xl bg-[#101B55] text-slate-300 font-heading font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingName || !tempName.trim()}
                onClick={handleSaveName}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00E5FF] text-white font-heading font-bold disabled:opacity-50"
              >
                {isSavingName ? 'Menyimpan...' : 'Simpan Nama'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Template */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050B2E] border-2 border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-6 text-white animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-950/70 border border-red-500/40">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Konfirmasi Hapus Template</h3>
                <p className="text-xs text-red-300/80">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#101B55]/60 border border-blue-900/60 text-xs space-y-2">
              <div>
                <span className="text-slate-400">Nama Template:</span>
                <p className="font-heading font-bold text-sm text-white">{templateToDelete.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Orientasi:</span>
                <p className="font-stat text-cyan-300">
                  {templateToDelete.orientation === 'portrait' ? 'A4 Portrait (210×297 mm)' : 'A4 Landscape (297×210 mm)'}
                </p>
              </div>
              <p className="text-slate-400 pt-1 border-t border-blue-900/40">
                Data sertifikat yang pernah diterbitkan dengan template ini tidak akan hilang, namun desain ini akan dihapus dari daftar template aktif.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/60 text-xs">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-slate-800 text-slate-300 font-heading font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteTemplate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-heading font-bold shadow-lg disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Visual Position Adjuster Modal */}
      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingTemplate(null);
        }}
        initialTemplate={editingTemplate}
        onSave={handleSaveUploadedTemplate}
        previewCert={previewCert}
      />

    </div>
  );
};
