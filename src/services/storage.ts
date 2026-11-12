import {
  EventItem,
  ParticipantItem,
  CertificateItem,
  CertificateTemplate,
  SystemSettings,
  DashboardStats,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TEMPLATES,
  DEMO_EVENTS,
  DEMO_PARTICIPANTS,
  DEMO_CERTIFICATES,
} from '../data/demoData';
import { templateStorage } from './templateStorage';
import { authService } from './authService';
import { supabaseService } from './supabaseService';
import { formatJakartaDate } from '../utils/dateFormatter';
import { getOfficialVerificationUrl } from '../utils/verificationUrl';

const STORAGE_KEYS = {
  EVENTS: 'artakarya_events_v1',
  PARTICIPANTS: 'artakarya_participants_v1',
  CERTIFICATES: 'artakarya_certificates_v1',
  TEMPLATES: 'artakarya_templates_v1',
  SETTINGS: 'artakarya_settings_v1',
  DATA_MODE: 'artakarya_data_mode_v1', // 'demo' | 'clean'
};

// Simple pseudo-SHA256 hash generator for verifiable certificates
export function generateCertificateHash(certNumber: string, recipient: string, date: string): string {
  const input = `${certNumber}|${recipient}|${date}|ARTAKARYA_DIGITAL_SECRET`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Array.from(input)
    .reduce((acc, c, idx) => acc + (c.charCodeAt(0) * (idx + 1)), 0)
    .toString(16)
    .padStart(8, '0');
  const part3 = (Math.abs(hash * 31)).toString(16).padStart(8, '0');
  const part4 = Date.now().toString(16).slice(-8);
  return `${hex}${part2}${part3}${part4}`.padEnd(64, 'a').slice(0, 64);
}

class StorageManager {
  private listeners: (() => void)[] = [];
  private customTemplates: CertificateTemplate[] = [];

  constructor() {
    this.init();
    this.loadCustomTemplates();
    this.syncSettingsFromBackend();
    this.syncCertificatesFromSupabase();
  }

  public async syncSettingsFromBackend(): Promise<void> {
    try {
      const res = await fetch('/api/v1/public/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.logoUrl === 'string') {
          const current = this.getSettings();
          if (data.logoUrl !== current.logoUrl) {
            current.logoUrl = data.logoUrl;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
            this.notify();
          }
        }
      }
    } catch {
      // offline fallback
    }
  }

  /**
   * Sync and merge certificates with Supabase online database
   */
  public async syncCertificatesFromSupabase(): Promise<void> {
    try {
      const remoteCerts = await supabaseService.fetchAllCertificates();
      if (remoteCerts && remoteCerts.length > 0) {
        const localCerts = this.getCertificates();
        const localMap = new Map<string, CertificateItem>();
        localCerts.forEach((c) => localMap.set(c.certificateNumber.toUpperCase(), c));

        // Merge remote certificates into local cache
        remoteCerts.forEach((rc) => {
          localMap.set(rc.certificateNumber.toUpperCase(), rc);
        });

        const merged = Array.from(localMap.values());
        localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(merged));
        this.notify();
      } else {
        // If Supabase table is empty but local has certificates, upload local certificates to Supabase
        const localCerts = this.getCertificates();
        if (localCerts.length > 0) {
          supabaseService.batchSaveCertificates(localCerts).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[Supabase] Initial sync skipped (offline or table missing):', e);
    }
  }

  public async loadCustomTemplates(): Promise<CertificateTemplate[]> {
    try {
      const list = await templateStorage.getAllCustomTemplates();
      this.customTemplates = list;
      this.notify();
      return list;
    } catch (e) {
      console.warn('Failed to load custom templates from IndexedDB:', e);
      return [];
    }
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(DEMO_PARTICIPANTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(DEMO_CERTIFICATES));
    }
    // Remove old built-in preset templates from storage
    if (localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DATA_MODE)) {
      localStorage.setItem(STORAGE_KEYS.DATA_MODE, 'demo');
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // DATA MODE (DEMO vs CLEAN)
  public getDataMode(): 'demo' | 'clean' {
    return (localStorage.getItem(STORAGE_KEYS.DATA_MODE) as 'demo' | 'clean') || 'demo';
  }

  public setDataMode(mode: 'demo' | 'clean') {
    localStorage.setItem(STORAGE_KEYS.DATA_MODE, mode);
    this.notify();
  }

  public resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(DEMO_PARTICIPANTS));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(DEMO_CERTIFICATES));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.DATA_MODE, 'demo');
    this.notify();
  }

  public clearAllData() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...INITIAL_SETTINGS, isDemoMode: false }));
    localStorage.setItem(STORAGE_KEYS.DATA_MODE, 'clean');
    this.notify();
  }

  // EVENTS
  public getEvents(): EventItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) return DEMO_EVENTS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_EVENTS;
    }
  }

  public getEventById(id: string): EventItem | undefined {
    return this.getEvents().find((e) => e.id === id);
  }

  public saveEvent(event: Partial<EventItem> & { title: string; date: string }): EventItem {
    const events = this.getEvents();
    const formattedDate = formatJakartaDate(event.date);

    if (event.id) {
      const idx = events.findIndex((e) => e.id === event.id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          ...event,
          formattedDate,
        } as EventItem;
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

        // SINGLE SOURCE OF TRUTH: Cascade updated title and date to all certificates of this event
        const certs = this.getCertificates();
        let certsUpdated = false;
        certs.forEach((c) => {
          if (c.eventId === event.id) {
            c.eventTitle = events[idx].title;
            if (events[idx].subtitle !== undefined) c.eventSubtitle = events[idx].subtitle;
            c.eventDate = formattedDate;
            certsUpdated = true;
          }
        });
        if (certsUpdated) {
          localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
        }

        // Sync with backend API (PUT)
        const token = authService.getAuthToken();
        if (token) {
          fetch(`/api/v1/admin/events/${event.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(events[idx]),
          }).catch(() => {});
        }

        this.notify();
        return events[idx];
      }
    }
    const newId = `evt-${Date.now()}`;
    const cleanPrefix = (event.certificatePrefix || `AK-${event.date.replace(/-/g, '')}-EVENT`).toUpperCase();
    const newEvent: EventItem = {
      id: newId,
      title: event.title,
      subtitle: event.subtitle || '',
      description: event.description || '',
      organizer: event.organizer || 'ARTAKARYA Creative Intelligence Lab',
      date: event.date,
      formattedDate,
      time: event.time || '09:00 - 17:00 WIB',
      location: event.location || 'ARTAKARYA Auditorium & Hybrid',
      category: event.category || 'Masterclass',
      instructor: event.instructor || {
        name: 'Dr. Arya Pratama, M.Kom.',
        title: 'Founder & AI Strategist ARTAKARYA',
      },
      status: event.status || 'BERLANGSUNG',
      certificatePrefix: cleanPrefix,
      templateId: event.templateId || 'tpl-gold-royal',
      participantCount: 0,
      issuedCount: 0,
      isDemo: false,
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    
    // Sync with backend database if authorized admin session is active
    const token = authService.getAuthToken();
    if (token) {
      fetch('/api/v1/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      }).catch(() => {});
    }

    this.notify();
    return newEvent;
  }

  public deleteEvent(id: string): { success: boolean; message: string; certificateCount: number } {
    const events = this.getEvents();
    const target = events.find((e) => e.id === id);
    if (!target) {
      return { success: false, message: 'Kegiatan tidak ditemukan dalam sistem.', certificateCount: 0 };
    }
    const certs = this.getCertificates().filter((c) => c.eventId === id);
    const updated = events.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));

    // Sync deletion with backend database
    const token = authService.getAuthToken();
    if (token) {
      fetch(`/api/v1/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    this.notify();
    return {
      success: true,
      message: `Kegiatan "${target.title}" berhasil dihapus.`,
      certificateCount: certs.length,
    };
  }

  public archiveEvent(id: string): { success: boolean; message: string } {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) {
      return { success: false, message: 'Kegiatan tidak ditemukan.' };
    }
    events[idx].status = 'ARSIP';
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify();
    return {
      success: true,
      message: `Kegiatan "${events[idx].title}" berhasil dipindahkan ke status Arsip. Seluruh sertifikat terbit tetap aman dan valid.`,
    };
  }

  // PARTICIPANTS
  public getParticipants(eventId?: string): ParticipantItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    let items: ParticipantItem[] = [];
    try {
      items = raw ? JSON.parse(raw) : DEMO_PARTICIPANTS;
    } catch {
      items = DEMO_PARTICIPANTS;
    }
    if (eventId) {
      return items.filter((p) => p.eventId === eventId);
    }
    return items;
  }

  public saveParticipant(participant: Partial<ParticipantItem> & { fullName: string; email: string; eventId: string }): ParticipantItem {
    const list = this.getParticipants();
    const token = authService.getAuthToken();

    if (participant.id) {
      const idx = list.findIndex((p) => p.id === participant.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...participant } as ParticipantItem;
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
        this.updateEventCounts(list[idx].eventId);

        // DATA CONSISTENCY: Ensure participant name on certificate perfectly matches participant data
        const certs = this.getCertificates();
        let certsUpdated = false;
        certs.forEach((c) => {
          if (c.participantId === participant.id || (list[idx].certificateNumber && c.certificateNumber === list[idx].certificateNumber)) {
            c.participantName = list[idx].fullName;
            if (list[idx].email) c.participantEmail = list[idx].email;
            if (list[idx].organization) c.participantOrg = list[idx].organization;
            certsUpdated = true;
          }
        });
        if (certsUpdated) {
          localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
        }

        if (token) {
          fetch(`/api/v1/admin/participants/${participant.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(list[idx]),
          }).catch(() => {});
        }

        this.notify();
        return list[idx];
      }
    }

    const newParticipant: ParticipantItem = {
      id: participant.id || `par-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventId: participant.eventId,
      fullName: participant.fullName,
      email: participant.email,
      phone: participant.phone || '',
      organization: participant.organization ? participant.organization.trim() : '',
      jobTitle: participant.jobTitle || 'Profesional',
      role: participant.role || 'Peserta',
      registrationDate: new Date().toISOString().split('T')[0],
      attendanceStatus: participant.attendanceStatus || 'MENUNGGU_VALIDASI',
      certificateIssued: false,
      isDemo: false,
    };
    list.unshift(newParticipant);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
    this.updateEventCounts(newParticipant.eventId);

    if (token) {
      fetch('/api/v1/admin/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newParticipant),
      }).catch(() => {});
    }

    this.notify();
    return newParticipant;
  }

  public deleteParticipant(id: string): { success: boolean; message: string } {
    const list = this.getParticipants();
    const target = list.find((p) => p.id === id);
    if (!target) {
      return { success: false, message: 'Data peserta tidak ditemukan.' };
    }

    const updated = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(updated));

    if (target) {
      this.updateEventCounts(target.eventId);
    }

    // Sync delete with backend database
    const token = authService.getAuthToken();
    if (token) {
      fetch(`/api/v1/admin/participants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    this.notify();
    return { success: true, message: `Peserta "${target.fullName}" berhasil dihapus secara permanen.` };
  }

  public updateAttendance(participantId: string, status: AttendanceStatus): ParticipantItem | null {
    const list = this.getParticipants();
    const idx = list.findIndex((p) => p.id === participantId);
    if (idx === -1) return null;

    list[idx].attendanceStatus = status;
    if (status === 'HADIR') {
      list[idx].validatedAt = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
      list[idx].validatedBy = 'Petugas Verifikator ARTAKARYA';
    } else {
      list[idx].validatedAt = undefined;
      list[idx].validatedBy = undefined;
    }
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
    this.notify();
    return list[idx];
  }

  public validateAllAttendance(eventId: string): number {
    const list = this.getParticipants();
    let count = 0;
    const now = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    list.forEach((p) => {
      if (p.eventId === eventId && p.attendanceStatus !== 'HADIR') {
        p.attendanceStatus = 'HADIR';
        p.validatedAt = now;
        p.validatedBy = 'Admin Batch Validation';
        count++;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
    this.notify();
    return count;
  }

  // CERTIFICATES
  public getCertificates(): CertificateItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) return DEMO_CERTIFICATES;
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_CERTIFICATES;
    }
  }

  public getCertificateById(id: string): CertificateItem | undefined {
    return this.getCertificates().find((c) => c.id === id || c.certificateNumber === id);
  }

  public getCertificateByNumber(certNumber: string): CertificateItem | undefined {
    const clean = certNumber.trim().toUpperCase();
    return this.getCertificates().find(
      (c) => c.certificateNumber.toUpperCase() === clean || c.id.toUpperCase() === clean
    );
  }

  public searchCertificates(keyword: string): CertificateItem[] {
    const q = keyword.trim().toLowerCase();
    if (!q) return [];
    return this.getCertificates().filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.participantName.toLowerCase().includes(q) ||
        c.participantEmail.toLowerCase().includes(q) ||
        c.eventTitle.toLowerCase().includes(q)
    );
  }

  public issueCertificate(participantId: string): CertificateItem | null {
    const participants = this.getParticipants();
    const pIndex = participants.findIndex((p) => p.id === participantId);
    if (pIndex === -1) return null;

    const participant = participants[pIndex];
    const event = this.getEventById(participant.eventId);
    if (!event) return null;

    const certs = this.getCertificates();
    const existing = certs.find((c) => c.participantId === participantId && c.eventId === event.id);
    if (existing) return existing;

    const eventCerts = certs.filter((c) => c.eventId === event.id);
    const seq = (eventCerts.length + 1).toString().padStart(3, '0');
    const certNumber = `${event.certificatePrefix}-${seq}`;
    const certId = `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const settings = this.getSettings();
    const issueDateStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const targetUrl = getOfficialVerificationUrl(certNumber, settings.website);

    // Get active/default template or event template
    const activeTemplate = this.getTemplateById(event.templateId) || this.getTemplates().find((t) => t.isDefault) || this.getTemplates()[0];

    const newCert: CertificateItem = {
      id: certId,
      certificateNumber: certNumber,
      participantId: participant.id,
      participantName: participant.fullName,
      participantEmail: participant.email,
      participantOrg: participant.organization,
      participantRole: `Peserta ${event.title}`,
      eventId: event.id,
      eventTitle: event.title,
      eventSubtitle: event.subtitle,
      eventDate: event.formattedDate,
      organizer: 'ARTAKARYA Creative Intelligence Lab',
      issueDate: issueDateStr,
      templateId: activeTemplate?.id || event.templateId || 'tpl-custom',
      orientation: activeTemplate?.orientation || 'landscape',
      verificationHash: generateCertificateHash(certNumber, participant.fullName, event.date),
      verificationUrl: targetUrl,
      status: 'AKTIF',
      downloadCount: 0,
      signer1: {
        name: settings.defaultSigner1.name,
        title: settings.defaultSigner1.title,
      },
      signer2: {
        name: settings.defaultSigner2.name,
        title: settings.defaultSigner2.title,
      },
      isDemo: participant.isDemo || false,
    };

    certs.unshift(newCert);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));

    // Update participant
    participants[pIndex].certificateIssued = true;
    participants[pIndex].certificateId = newCert.id;
    participants[pIndex].certificateNumber = newCert.certificateNumber;
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));

    // SYNC TO SUPABASE REAL-TIME DATABASE
    supabaseService.saveCertificate(newCert).catch((e) => {
      console.warn('[Supabase] Background sync warning:', e);
    });

    // SYNC TO BACKEND DATABASE (Ensures QR Code verification on backend is 100% matched)
    const token = authService.getAuthToken();
    if (token) {
      fetch('/api/v1/admin/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCert),
      }).catch(() => {});
    }

    this.updateEventCounts(event.id);
    this.notify();
    return newCert;
  }

  public issueBatchCertificates(eventId: string): CertificateItem[] {
    const participants = this.getParticipants(eventId);
    const eligible = participants.filter((p) => p.attendanceStatus === 'HADIR' && !p.certificateIssued);
    const issued: CertificateItem[] = [];

    for (const p of eligible) {
      const res = this.issueCertificate(p.id);
      if (res) issued.push(res);
    }
    return issued;
  }

  public revokeCertificate(id: string, reason: string): boolean {
    const certs = this.getCertificates();
    const cert = certs.find((c) => c.id === id || c.certificateNumber === id);
    if (!cert) return false;
    cert.status = 'DICABUT';
    cert.revokeReason = reason;
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));

    // Sync status change to Supabase
    supabaseService.updateStatus(cert.certificateNumber, 'DICABUT', reason).catch(() => {});

    this.notify();
    return true;
  }

  public activateCertificate(id: string): boolean {
    const certs = this.getCertificates();
    const cert = certs.find((c) => c.id === id || c.certificateNumber === id);
    if (!cert) return false;
    cert.status = 'AKTIF';
    cert.revokeReason = undefined;
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));

    // Sync status change to Supabase
    supabaseService.updateStatus(cert.certificateNumber, 'AKTIF', '').catch(() => {});

    this.notify();
    return true;
  }

  public incrementDownload(id: string) {
    const certs = this.getCertificates();
    const cert = certs.find((c) => c.id === id || c.certificateNumber === id);
    if (cert) {
      cert.downloadCount = (cert.downloadCount || 0) + 1;
      cert.lastDownloadedAt = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
      this.notify();
    }
  }

  // TEMPLATES
  public getTemplates(): CertificateTemplate[] {
    // Only return admin-uploaded templates from persistent database (IndexedDB / backend sync)
    // No built-in presets (Prestige Gold Royal, Modern Executive Blue, Classic Academic Ivory, etc.)
    return this.customTemplates;
  }

  public getTemplateById(id?: string): CertificateTemplate | undefined {
    const list = this.getTemplates();
    if (!id) {
      return list.find((t) => t.isDefault) || list[0];
    }
    return list.find((t) => t.id === id) || list.find((t) => t.isDefault) || list[0];
  }

  public async saveTemplate(tpl: CertificateTemplate): Promise<void> {
    const token = authService.getAuthToken();

    // If marked as default, clear isDefault from all other templates
    if (tpl.isDefault) {
      this.customTemplates = this.customTemplates.map((c) => ({
        ...c,
        isDefault: c.id === tpl.id,
      }));
    } else {
      // If no other template is default and this is the only one, make it default
      const hasOtherDefault = this.customTemplates.some((c) => c.isDefault && c.id !== tpl.id);
      if (!hasOtherDefault && this.customTemplates.length === 0) {
        tpl.isDefault = true;
      }
    }

    // Save full template (with high-res background image) to persistent IndexedDB
    await templateStorage.saveTemplate(tpl);

    const idx = this.customTemplates.findIndex((t) => t.id === tpl.id);
    if (idx !== -1) {
      this.customTemplates[idx] = tpl;
    } else {
      this.customTemplates.unshift(tpl);
    }

    // Sync with backend API
    if (token) {
      fetch('/api/v1/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tpl),
      }).catch(() => {});
    }

    this.notify();
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    const target = this.customTemplates.find((t) => t.id === id);
    if (!target) return false;

    // Remove from IndexedDB
    await templateStorage.deleteTemplate(id);
    this.customTemplates = this.customTemplates.filter((t) => t.id !== id);

    // Sync deletion with backend API
    const token = authService.getAuthToken();
    if (token) {
      fetch(`/api/v1/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    // If deleted template was default and remaining templates exist, make the first one default
    if (target.isDefault && this.customTemplates.length > 0) {
      this.customTemplates[0].isDefault = true;
      await templateStorage.saveTemplate(this.customTemplates[0]);
      if (token) {
        fetch(`/api/v1/admin/templates/${this.customTemplates[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.customTemplates[0]),
        }).catch(() => {});
      }
    }

    this.notify();
    return true;
  }

  // SETTINGS
  public getSettings(): SystemSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return INITIAL_SETTINGS;
    try {
      const parsed = JSON.parse(raw);
      const merged: SystemSettings = {
        ...INITIAL_SETTINGS,
        ...parsed,
      };

      // Ensure official brand identity & contact info are applied seamlessly
      if (!merged.address || merged.address.includes('Innovation Tower')) {
        merged.address = INITIAL_SETTINGS.address;
      }
      if (!merged.contactEmail || merged.contactEmail.includes('artakarya02')) {
        merged.contactEmail = INITIAL_SETTINGS.contactEmail;
      }
      if (!merged.whatsappNumber || merged.whatsappNumber.includes('5088') || merged.whatsappNumber.includes('21')) {
        merged.whatsappNumber = INITIAL_SETTINGS.whatsappNumber;
        merged.whatsappUrl = INITIAL_SETTINGS.whatsappUrl;
        merged.contactPhone = INITIAL_SETTINGS.contactPhone;
      }
      if (!merged.instagramHandle) {
        merged.instagramHandle = INITIAL_SETTINGS.instagramHandle;
        merged.instagramUrl = INITIAL_SETTINGS.instagramUrl;
      }
      if (!merged.profileDescription) {
        merged.profileDescription = INITIAL_SETTINGS.profileDescription;
      }
      if (!merged.organizationName || merged.organizationName === 'ARTAKARYA') {
        merged.organizationName = INITIAL_SETTINGS.organizationName;
      }
      if (!merged.brandName) {
        merged.brandName = INITIAL_SETTINGS.brandName;
      }
      if (!merged.productName || !merged.productName.includes('EDU')) {
        merged.productName = INITIAL_SETTINGS.productName;
      }

      return merged;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public saveSettings(settings: SystemSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    const token = authService.getAuthToken();
    if (token) {
      fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      }).catch(() => {});
    }
    this.notify();
  }

  public async saveOfficialLogo(logoDataUrl: string): Promise<{ success: boolean; error?: string }> {
    const session = authService.getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Akses Ditolak: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang mengubah logo resmi lembaga.',
      };
    }

    const token = authService.getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Sesi otorisasi administrator tidak ditemukan. Silakan masuk kembali sebagai SUPER_ADMIN.',
      };
    }

    try {
      const res = await fetch('/api/v1/admin/settings/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ logoUrl: logoDataUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Gagal menyimpan logo ke server penyimpanan permanen.',
        };
      }

      // Update local storage only after backend confirms successful save
      const current = this.getSettings();
      current.logoUrl = logoDataUrl;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
      this.notify();

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Terjadi kesalahan jaringan saat menyimpan logo ke server.',
      };
    }
  }

  public async deleteOfficialLogo(): Promise<{ success: boolean; error?: string }> {
    const session = authService.getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Akses Ditolak: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang menghapus logo resmi lembaga.',
      };
    }

    const token = authService.getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Sesi otorisasi administrator tidak ditemukan. Silakan masuk kembali sebagai SUPER_ADMIN.',
      };
    }

    try {
      const res = await fetch('/api/v1/admin/settings/logo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Gagal menghapus logo dari server penyimpanan permanen.',
        };
      }

      const current = this.getSettings();
      current.logoUrl = '';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
      this.notify();

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Terjadi kesalahan jaringan saat menghapus logo dari server.',
      };
    }
  }

  // STATS
  public getStats(): DashboardStats {
    const events = this.getEvents();
    const participants = this.getParticipants();
    const certs = this.getCertificates();

    const pending = participants.filter((p) => p.attendanceStatus === 'MENUNGGU_VALIDASI').length;
    const totalDownloaded = certs.reduce((acc, c) => acc + (c.downloadCount || 0), 0);
    const activeEvents = events.filter((e) => e.status === 'BERLANGSUNG' || e.status === 'SELESAI').length;

    return {
      totalEvents: events.length,
      totalParticipants: participants.length,
      totalCertificatesIssued: certs.length,
      pendingValidation: pending,
      activeEvents: activeEvents,
      totalDownloaded: totalDownloaded,
    };
  }

  private updateEventCounts(eventId: string) {
    const events = this.getEvents();
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    const participants = this.getParticipants(eventId);
    const certs = this.getCertificates().filter((c) => c.eventId === eventId);

    ev.participantCount = participants.length;
    ev.issuedCount = certs.length;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }
}

export const storage = new StorageManager();
