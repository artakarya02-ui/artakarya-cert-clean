import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Sliders,
  Type,
  Palette,
  Eye,
  Check,
  AlertTriangle,
  Move,
  RefreshCw,
  Trash2,
  Sparkles,
  Info,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { CertificateTemplate, CustomTemplateElementsConfig, CertificateItem } from '../../types';
import { DEFAULT_CUSTOM_ELEMENTS_CONFIG } from '../../services/templateStorage';
import { CertificateRenderer } from '../../components/certificate/CertificateRenderer';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: CertificateTemplate | null;
  onSave: (tpl: CertificateTemplate) => Promise<void>;
  previewCert: CertificateItem;
}

type ElementKey =
  | 'recipientName'
  | 'certificateTitle'
  | 'eventTitle'
  | 'certificateNumber'
  | 'issueDate'
  | 'qrCode'
  | 'signatures';

const ELEMENT_LABELS: Record<ElementKey, { label: string; desc: string }> = {
  recipientName: { label: 'Nama Penerima', desc: 'Nama lengkap peserta sertifikat' },
  certificateTitle: { label: 'Judul Sertifikat', desc: 'Contoh: SERTIFIKAT PENGHARGAAN' },
  eventTitle: { label: 'Judul Kegiatan', desc: 'Nama masterclass atau program' },
  certificateNumber: { label: 'Nomor Seri Sertifikat', desc: 'Kode identifikasi unik sertifikat' },
  issueDate: { label: 'Tanggal Penerbitan', desc: 'Tanggal resmi sertifikat diterbitkan' },
  qrCode: { label: 'QR Code Verifikasi', desc: 'Akses instan validasi publik' },
  signatures: { label: 'Tanda Tangan & Nama Pejabat', desc: 'Pengesahan dewan sertifikasi' },
};

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
  isOpen,
  onClose,
  initialTemplate,
  onSave,
  previewCert,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementKey>('recipientName');
  const [activeTab, setActiveTab] = useState<'upload' | 'elements' | 'settings'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Template Form State
  const [name, setName] = useState('Desain Kustom ARTAKARYA');
  const [description, setDescription] = useState('Template sertifikat resmi kustom berbasis desain mandiri.');
  const [badgeLabel, setBadgeLabel] = useState('KUSTOM EKSKLUSIF');
  const [isDefault, setIsDefault] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    fileName: string;
    width: number;
    height: number;
    aspectRatio: number;
    format: 'png' | 'jpg' | 'jpeg' | 'webp';
  } | null>(null);

  const [elementsConfig, setElementsConfig] = useState<CustomTemplateElementsConfig>(
    DEFAULT_CUSTOM_ELEMENTS_CONFIG
  );

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name || 'Desain Kustom ARTAKARYA');
      setDescription(initialTemplate.description || '');
      setBadgeLabel(initialTemplate.badgeLabel || 'KUSTOM EKSKLUSIF');
      setIsDefault(initialTemplate.isDefault || false);
      setOrientation(initialTemplate.orientation || (initialTemplate.aspectRatio && initialTemplate.aspectRatio < 1 ? 'portrait' : 'landscape'));
      setBgImage(initialTemplate.backgroundImageUrl || null);
      if (initialTemplate.imageWidth && initialTemplate.imageHeight) {
        setImageMeta({
          fileName: initialTemplate.imageFileName || 'custom-template.png',
          width: initialTemplate.imageWidth,
          height: initialTemplate.imageHeight,
          aspectRatio: initialTemplate.aspectRatio || 1.414,
          format: initialTemplate.imageFormat || 'png',
        });
      }
      setElementsConfig(initialTemplate.elementsConfig || DEFAULT_CUSTOM_ELEMENTS_CONFIG);
      if (initialTemplate.backgroundImageUrl) {
        setActiveTab('elements');
      }
    } else {
      // Reset defaults
      setName(`Template Mandiri ${new Date().toLocaleDateString('id-ID')}`);
      setDescription('Desain sertifikat diunggah oleh administrator ARTAKARYA.');
      setBadgeLabel('EDISI KHUSUS');
      setIsDefault(false);
      setOrientation('landscape');
      setBgImage(null);
      setImageMeta(null);
      setElementsConfig(DEFAULT_CUSTOM_ELEMENTS_CONFIG);
      setActiveTab('upload');
    }
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Mohon gunakan format PNG, JPG, atau WEBP.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimum 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const ratio = Number((img.naturalWidth / img.naturalHeight).toFixed(3));
        const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
        const format = (extension === 'jpg' ? 'jpeg' : extension) as 'png' | 'jpeg' | 'webp';
        const detectedOrientation: 'landscape' | 'portrait' = ratio < 1 ? 'portrait' : 'landscape';

        setOrientation(detectedOrientation);
        setImageMeta({
          fileName: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: ratio,
          format: format,
        });
        setBgImage(dataUrl);
        setActiveTab('elements');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleSaveTemplate = async () => {
    if (!bgImage) {
      setErrorMsg('Harap unggah gambar latar belakang sertifikat terlebih dahulu.');
      setActiveTab('upload');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama template tidak boleh kosong.');
      setActiveTab('settings');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const newTemplate: CertificateTemplate = {
        id: initialTemplate?.id || `tpl-custom-${Date.now()}`,
        name: name.trim(),
        theme: 'custom_uploaded',
        borderStyle: 'custom_image',
        primaryColor: elementsConfig.recipientName?.color || '#087BFF',
        secondaryColor: elementsConfig.eventTitle?.color || '#101B55',
        accentColor: '#FFC857',
        badgeLabel: badgeLabel.trim() || 'KUSTOM EKSKLUSIF',
        description: description.trim(),
        isDefault: isDefault,
        orientation: orientation,
        isCustom: true,
        backgroundImageUrl: bgImage,
        imageFileName: imageMeta?.fileName,
        imageFormat: imageMeta?.format,
        imageWidth: imageMeta?.width,
        imageHeight: imageMeta?.height,
        aspectRatio: imageMeta?.aspectRatio,
        elementsConfig: elementsConfig,
        updatedAt: new Date().toISOString(),
      };

      await onSave(newTemplate);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan template kustom.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update specific element position / styling
  const updateElementProp = (key: ElementKey, prop: string, value: any) => {
    setElementsConfig((prev) => {
      const current = (prev as any)[key] || {};
      return {
        ...prev,
        [key]: {
          ...current,
          [prop]: value,
        },
      };
    });
  };

  // Current selected element config
  const currentElConfig = (elementsConfig as any)[selectedElement] || {};

  // Construct temporary preview template
  const previewTemplate: CertificateTemplate = {
    id: initialTemplate?.id || 'tpl-custom-preview',
    name: name,
    theme: 'custom_uploaded',
    borderStyle: 'custom_image',
    primaryColor: '#087BFF',
    secondaryColor: '#101B55',
    accentColor: '#FFC857',
    badgeLabel: badgeLabel,
    description: description,
    isDefault: isDefault,
    orientation: orientation,
    isCustom: true,
    backgroundImageUrl: bgImage || undefined,
    elementsConfig: elementsConfig,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-body">
      <div className="w-full max-w-6xl bg-[#050B2E] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.2)] text-white my-auto max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-blue-900/60 flex items-center justify-between bg-[#101B55]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087BFF] to-[#00E5FF] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#050B2E] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <span>{initialTemplate ? 'Edit Template Kustom' : 'Upload Template Sertifikat Sendiri'}</span>
                <span className="text-[10px] font-stat px-2 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                  A4 LANDSCAPE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gunakan desain grafis Anda sendiri sebagai latar belakang dan atur posisi teks secara presisi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-blue-900/40 bg-[#050B2E] flex items-center gap-2 text-xs font-heading font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-[#087BFF] text-white shadow-lg shadow-[#087BFF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#101B55]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>1. Unggah Desain</span>
            {bgImage && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('elements')}
            disabled={!bgImage}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'elements'
                ? 'bg-[#087BFF] text-white shadow-lg shadow-[#087BFF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#101B55] disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Atur Posisi Teks & Elemen</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#087BFF] text-white shadow-lg shadow-[#087BFF]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#101B55]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>3. Pengaturan Template</span>
          </button>
        </div>

        {/* Error Alert Bar */}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-red-950/70 border-b border-red-500/40 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: UPLOAD AREA */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {!bgImage ? (
                /* Empty Upload Dropzone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                    isDragging
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10 scale-[0.99]'
                      : 'border-blue-900/80 bg-[#101B55]/30 hover:border-[#087BFF] hover:bg-[#101B55]/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-[#087BFF]/20 border border-[#087BFF]/40 flex items-center justify-center text-[#00E5FF]">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-heading text-lg font-bold text-white mb-1">
                      Tarik & Letakkan Berkas Desain ke Sini
                    </h4>
                    <p className="text-xs text-slate-400">
                      atau <span className="text-[#00E5FF] font-semibold underline">pilih berkas dari perangkat Anda</span> (Desktop & Android).
                    </p>
                  </div>

                  {/* Recommendation Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left text-xs pt-4 border-t border-blue-900/40">
                    <div className="p-3 rounded-xl bg-[#050B2E]/60 border border-blue-950">
                      <span className="text-slate-500 block text-[10px]">Format Berkas</span>
                      <strong className="text-white">PNG, JPG, WEBP</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#050B2E]/60 border border-blue-950">
                      <span className="text-slate-500 block text-[10px]">Rasio Standar</span>
                      <strong className="text-[#00E5FF]">A4 Landscape (1.414 : 1)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#050B2E]/60 border border-blue-950">
                      <span className="text-slate-500 block text-[10px]">Resolusi Ideal</span>
                      <strong className="text-white">1920×1357 atau 3508×2480</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Image Loaded Preview & Controls */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#101B55]/60 border border-blue-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">{imageMeta?.fileName}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{imageMeta?.width} × {imageMeta?.height} px</span>
                          <span>•</span>
                          <span>Rasio: <strong className="text-white">{imageMeta?.aspectRatio} : 1</strong></span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold uppercase">{imageMeta?.format}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#101B55] hover:bg-blue-900 text-xs font-heading font-semibold text-white border border-blue-800 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ganti Gambar</span>
                      </button>
                      <button
                        onClick={() => {
                          setBgImage(null);
                          setImageMeta(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-xs font-heading font-semibold text-red-300 border border-red-900 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('elements')}
                        className="px-4 py-2 rounded-xl bg-[#087BFF] hover:bg-blue-600 text-xs font-heading font-bold text-white shadow-lg shadow-[#087BFF]/30 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Lanjut ke Posisi Teks →</span>
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio Analysis Banner */}
                  {imageMeta && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                      Math.abs(imageMeta.aspectRatio - 1.414) < 0.1
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    }`}>
                      <Info className="w-4 h-4 shrink-0 text-[#00E5FF]" />
                      <span>
                        {Math.abs(imageMeta.aspectRatio - 1.414) < 0.1
                          ? 'Gambar memiliki rasio proporsional sempurna dengan standar internasional A4 Landscape (1.414 : 1).'
                          : `Rasio gambar terdeteksi adalah ${imageMeta.aspectRatio}:1. Teks dan elemen akan disesuaikan secara otomatis ke kanvas cetak A4 Landscape.`}
                      </span>
                    </div>
                  )}

                  {/* Preview Container */}
                  <div className="p-3 sm:p-5 rounded-3xl bg-[#050B2E] border border-blue-900/60 shadow-2xl overflow-hidden max-w-4xl mx-auto">
                    <CertificateRenderer
                      certificate={previewCert}
                      template={previewTemplate}
                      scale={0.9}
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: POSITION & STYLING CUSTOMIZER */}
          {activeTab === 'elements' && bgImage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Controls Column (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Element Selector Dropdown / Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 block">
                    Pilih Elemen yang Ingin Diatur:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(ELEMENT_LABELS) as ElementKey[]).map((key) => {
                      const isSelected = selectedElement === key;
                      const isVisible = (elementsConfig as any)[key]?.show !== false;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedElement(key)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-[#101B55] border-[#00E5FF] text-white shadow-md'
                              : 'bg-[#101B55]/40 border-blue-900/40 text-slate-300 hover:border-blue-700'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="font-heading font-semibold block truncate">
                              {ELEMENT_LABELS[key].label}
                            </span>
                          </div>
                          {!isVisible && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-stat">
                              OFF
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configuration Card for Selected Element */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#101B55]/60 border border-blue-900/60 space-y-4 text-xs">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
                    <div>
                      <h4 className="font-heading font-bold text-white text-sm">
                        {ELEMENT_LABELS[selectedElement].label}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-body">
                        {ELEMENT_LABELS[selectedElement].desc}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[11px] text-slate-300">Tampilkan</span>
                      <input
                        type="checkbox"
                        checked={currentElConfig.show !== false}
                        onChange={(e) => updateElementProp(selectedElement, 'show', e.target.checked)}
                        className="rounded border-blue-900 text-[#087BFF] focus:ring-[#00E5FF] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Custom Text for Title */}
                  {selectedElement === 'certificateTitle' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Teks Judul</label>
                      <input
                        type="text"
                        value={currentElConfig.customText || 'SERTIFIKAT PENGHARGAAN'}
                        onChange={(e) => updateElementProp(selectedElement, 'customText', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#050B2E] border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  )}

                  {/* Positioning Sliders: X & Y */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Move className="w-3.5 h-3.5 text-[#00E5FF]" />
                          Posisi Horizontal (X)
                        </span>
                        <span className="font-stat font-bold text-[#00E5FF]">{currentElConfig.xPercent || 50}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="1"
                        value={currentElConfig.xPercent || 50}
                        onChange={(e) => updateElementProp(selectedElement, 'xPercent', Number(e.target.value))}
                        className="w-full accent-[#00E5FF] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Move className="w-3.5 h-3.5 text-[#087BFF]" />
                          Posisi Vertikal (Y)
                        </span>
                        <span className="font-stat font-bold text-[#087BFF]">{currentElConfig.yPercent || 50}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="1"
                        value={currentElConfig.yPercent || 50}
                        onChange={(e) => updateElementProp(selectedElement, 'yPercent', Number(e.target.value))}
                        className="w-full accent-[#087BFF] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Text-Specific Properties: Font Size, Color, Alignment, Weight */}
                  {selectedElement !== 'qrCode' && selectedElement !== 'signatures' && (
                    <div className="space-y-3 pt-3 border-t border-blue-900/60">
                      
                      {/* Font Size & Alignment */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">
                            Ukuran Font ({currentElConfig.fontSizePt || 16} pt)
                          </label>
                          <input
                            type="range"
                            min="8"
                            max="46"
                            step="1"
                            value={currentElConfig.fontSizePt || 16}
                            onChange={(e) => updateElementProp(selectedElement, 'fontSizePt', Number(e.target.value))}
                            className="w-full accent-[#00E5FF] cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Rata Teks</label>
                          <div className="flex items-center gap-1">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => updateElementProp(selectedElement, 'align', align)}
                                className={`flex-1 py-1.5 rounded-lg border text-center uppercase text-[10px] font-stat font-bold ${
                                  (currentElConfig.align || 'center') === align
                                    ? 'bg-[#087BFF] border-[#00E5FF] text-white'
                                    : 'bg-[#050B2E] border-blue-900 text-slate-400'
                                }`}
                              >
                                {align === 'left' ? 'Kiri' : align === 'center' ? 'Tengah' : 'Kanan'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Font Family & Color */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Jenis Font</label>
                          <select
                            value={currentElConfig.fontFamily || 'Plus Jakarta Sans'}
                            onChange={(e) => updateElementProp(selectedElement, 'fontFamily', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs"
                          >
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            <option value="Inter">Inter</option>
                            <option value="Space Grotesk">Space Grotesk</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Warna Teks</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentElConfig.color || '#050B2E'}
                              onChange={(e) => updateElementProp(selectedElement, 'color', e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-blue-800"
                            />
                            <input
                              type="text"
                              value={currentElConfig.color || '#050B2E'}
                              onChange={(e) => updateElementProp(selectedElement, 'color', e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white font-mono text-xs uppercase"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* QR Code Specific Options */}
                  {selectedElement === 'qrCode' && (
                    <div className="pt-2 border-t border-blue-900/60">
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="font-semibold">Ukuran QR Code</span>
                        <span className="font-stat font-bold text-[#00E5FF]">{currentElConfig.sizePercent || 12}%</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="20"
                        step="1"
                        value={currentElConfig.sizePercent || 12}
                        onChange={(e) => updateElementProp(selectedElement, 'sizePercent', Number(e.target.value))}
                        className="w-full accent-[#00E5FF] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Signatures Specific Options */}
                  {selectedElement === 'signatures' && (
                    <div className="space-y-3 pt-2 border-t border-blue-900/60">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Nama Pejabat 1 (Kiri)</label>
                        <input
                          type="text"
                          placeholder="Dr. Arya Pratama, M.Kom."
                          value={elementsConfig.signatures?.signer1Name || previewCert.signer1.name}
                          onChange={(e) => updateElementProp('signatures', 'signer1Name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Nama Pejabat 2 (Kanan)</label>
                        <input
                          type="text"
                          placeholder="Nadia Salsabila, S.T., M.M."
                          value={elementsConfig.signatures?.signer2Name || previewCert.signer2.name}
                          onChange={(e) => updateElementProp('signatures', 'signer2Name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#050B2E] border border-blue-900 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Real-time Preview Column (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-stat font-bold text-slate-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#00E5FF]" />
                    Pratinjau Interaktif Waktu-Nyata
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Elemen terpilih: <strong className="text-[#00E5FF]">{ELEMENT_LABELS[selectedElement].label}</strong>
                  </span>
                </div>

                <div className="p-3 sm:p-5 rounded-3xl bg-[#050B2E] border border-[#00E5FF]/40 shadow-2xl overflow-hidden">
                  <CertificateRenderer
                    certificate={previewCert}
                    template={previewTemplate}
                    scale={0.95}
                  />
                </div>

                <p className="text-[11px] text-slate-400 font-body px-2">
                  💡 Tips: Geser slider Horizontal (X) dan Vertikal (Y) untuk menyesuaikan letak nama dan nomor dengan garis atau ruang kosong pada desain sertifikat Anda.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: TEMPLATE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-5 py-2 text-xs sm:text-sm">
              
              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Nama Template Sertifikat *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Prestige Modern AI Gala 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Deskripsi Template
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi peruntukan template sertifikat ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Label Badge Identitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: EDISI RESMI 2026 / KUSTOM EKSKLUSIF"
                  value={badgeLabel}
                  onChange={(e) => setBadgeLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101B55]/70 border border-blue-900 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-heading font-semibold mb-1">
                  Format Ukuran Kertas & Orientasi A4
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      orientation === 'landscape'
                        ? 'bg-[#101B55] border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-[#050B2E] border-blue-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-heading font-bold text-xs flex items-center justify-between">
                      A4 Landscape (Mendatar)
                      {orientation === 'landscape' && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    </span>
                    <span className="text-[10px] text-slate-400 font-stat">297 × 210 mm (Rasio 1.414 : 1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      orientation === 'portrait'
                        ? 'bg-[#101B55] border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-[#050B2E] border-blue-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-heading font-bold text-xs flex items-center justify-between">
                      A4 Portrait (Tegak)
                      {orientation === 'portrait' && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    </span>
                    <span className="text-[10px] text-slate-400 font-stat">210 × 297 mm (Rasio 1 : 1.414)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#101B55]/50 border border-blue-900/60 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-semibold text-white">Jadikan Template Standar (Default)</h4>
                  <p className="text-xs text-slate-400">
                    Otomatis digunakan saat membuat kegiatan baru atau menerbitkan sertifikat instan.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-5 h-5 rounded border-blue-900 text-[#087BFF] focus:ring-[#00E5FF] cursor-pointer"
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-blue-900/60 bg-[#101B55]/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {bgImage ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Desain siap disimpan secara permanen di IndexedDB
              </span>
            ) : (
              <span>Silakan unggah gambar desain sertifikat terlebih dahulu</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#101B55] hover:bg-slate-800 text-slate-300 font-heading font-semibold text-xs sm:text-sm"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving || !bgImage}
              onClick={handleSaveTemplate}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087BFF] via-[#7928CA] to-[#00E5FF] hover:opacity-95 text-white font-heading font-bold shadow-lg shadow-[#087BFF]/30 transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Template</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
