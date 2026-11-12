/**
 * ARTAKARYA CERTIFICATE SYSTEM - SUPABASE CLIENT & REPOSITORY SERVICE
 * 
 * Online Database Integration for https://artakaryacertificates.site
 * Supabase Config:
 *   URL: https://zpipiupnjusqhxihdbl.supabase.co
 *   ANON_KEY: sb_publishable_io2Q4YyD3S6FH_5mI37_Rw_oSzou9Yq
 * 
 * Features:
 * 1. Client-side '@supabase/supabase-js' integration
 * 2. Persistent storage for "certificates" table
 * 3. Real-time synchronisation & public search query support
 * 4. Resilient Auto Table & Error Fallback (graceful offline / network failure handling without crashing the app)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CertificateItem, ParticipantItem } from '../types';

export const SUPABASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://zpipiupnjusqhxihdbl.supabase.co';

export const SUPABASE_ANON_KEY: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_io2Q4YyD3S6FH_5mI37_Rw_oSzou9Yq';

export interface SupabaseCertificateRow {
  id: string;
  certificate_number: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_org?: string | null;
  participant_role: string;
  event_id: string;
  event_title: string;
  event_subtitle?: string | null;
  event_date: string;
  organizer: string;
  issue_date: string;
  expiry_date?: string | null;
  template_id: string;
  orientation?: string | null;
  verification_hash: string;
  verification_url: string;
  status: 'AKTIF' | 'DICABUT' | 'KADALUARSA';
  revoke_reason?: string | null;
  download_count: number;
  last_downloaded_at?: string | null;
  signer1_name?: string | null;
  signer1_title?: string | null;
  signer2_name?: string | null;
  signer2_title?: string | null;
  is_demo?: boolean | null;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  tableExists: boolean;
  lastCheck: string | null;
  errorMessage: string | null;
  certificateCount: number;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private connectionStatus: SupabaseConnectionStatus = {
    isConfigured: true,
    isConnected: false,
    tableExists: false,
    lastCheck: null,
    errorMessage: null,
    certificateCount: 0,
  };
  private statusListeners: ((status: SupabaseConnectionStatus) => void)[] = [];

  constructor() {
    this.initClient();
  }

  private initClient() {
    try {
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (e: any) {
      console.warn('[Supabase] Init client warning:', e?.message || e);
    }
  }

  public getClient(): SupabaseClient | null {
    if (!this.client) {
      this.initClient();
    }
    return this.client;
  }

  public getStatus(): SupabaseConnectionStatus {
    return { ...this.connectionStatus };
  }

  public subscribeStatus(listener: (status: SupabaseConnectionStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus() {
    const s = this.getStatus();
    this.statusListeners.forEach((l) => l(s));
  }

  /**
   * Convert CertificateItem to Supabase row format
   */
  public toRow(c: CertificateItem): SupabaseCertificateRow {
    return {
      id: c.id,
      certificate_number: c.certificateNumber,
      participant_id: c.participantId,
      participant_name: c.participantName,
      participant_email: c.participantEmail,
      participant_org: c.participantOrg || null,
      participant_role: c.participantRole || 'Peserta',
      event_id: c.eventId,
      event_title: c.eventTitle,
      event_subtitle: c.eventSubtitle || null,
      event_date: c.eventDate,
      organizer: c.organizer || 'ARTAKARYA Creative Intelligence Lab',
      issue_date: c.issueDate,
      expiry_date: c.expiryDate || null,
      template_id: c.templateId,
      orientation: c.orientation || 'landscape',
      verification_hash: c.verificationHash,
      verification_url: c.verificationUrl,
      status: c.status,
      revoke_reason: c.revokeReason || null,
      download_count: c.downloadCount || 0,
      last_downloaded_at: c.lastDownloadedAt || null,
      signer1_name: c.signer1?.name || null,
      signer1_title: c.signer1?.title || null,
      signer2_name: c.signer2?.name || null,
      signer2_title: c.signer2?.title || null,
      is_demo: Boolean(c.isDemo),
      raw_data: c,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Convert Supabase row back to domain CertificateItem
   */
  public toItem(row: any): CertificateItem {
    if (row.raw_data && typeof row.raw_data === 'object' && row.raw_data.certificateNumber) {
      return {
        ...row.raw_data,
        id: row.id || row.raw_data.id,
        certificateNumber: row.certificate_number || row.raw_data.certificateNumber,
        participantName: row.participant_name || row.raw_data.participantName,
        participantEmail: row.participant_email || row.raw_data.participantEmail,
        participantOrg: row.participant_org ?? row.raw_data.participantOrg,
        eventTitle: row.event_title || row.raw_data.eventTitle,
        eventDate: row.event_date || row.raw_data.eventDate,
        status: (row.status as any) || row.raw_data.status || 'AKTIF',
        verificationHash: row.verification_hash || row.raw_data.verificationHash,
        verificationUrl: row.verification_url || row.raw_data.verificationUrl,
      };
    }

    return {
      id: row.id,
      certificateNumber: row.certificate_number,
      participantId: row.participant_id || '',
      participantName: row.participant_name,
      participantEmail: row.participant_email,
      participantOrg: row.participant_org || '',
      participantRole: row.participant_role || 'Peserta',
      eventId: row.event_id || '',
      eventTitle: row.event_title,
      eventSubtitle: row.event_subtitle || '',
      eventDate: row.event_date,
      organizer: row.organizer || 'ARTAKARYA Creative Intelligence Lab',
      issueDate: row.issue_date,
      expiryDate: row.expiry_date || undefined,
      templateId: row.template_id || 'tpl-custom',
      orientation: (row.orientation as any) || 'landscape',
      verificationHash: row.verification_hash,
      verificationUrl: row.verification_url,
      status: (row.status as any) || 'AKTIF',
      revokeReason: row.revoke_reason || undefined,
      downloadCount: row.download_count || 0,
      lastDownloadedAt: row.last_downloaded_at || undefined,
      signer1: {
        name: row.signer1_name || 'Dr. Arya Pratama, M.Kom.',
        title: row.signer1_title || 'Lead Research & Director',
      },
      signer2: {
        name: row.signer2_name || 'Prof. Dr. Ir. H. Sudirman, M.Sc.',
        title: row.signer2_title || 'Chief of Certification Board',
      },
      isDemo: Boolean(row.is_demo),
    };
  }

  /**
   * Test database connectivity and verify table "certificates"
   */
  public async testConnection(): Promise<SupabaseConnectionStatus> {
    const client = this.getClient();
    if (!client) {
      this.connectionStatus = {
        isConfigured: true,
        isConnected: false,
        tableExists: false,
        lastCheck: new Date().toLocaleTimeString('id-ID'),
        errorMessage: 'Client Supabase gagal diinisialisasi.',
        certificateCount: 0,
      };
      this.notifyStatus();
      return this.getStatus();
    }

    try {
      // Query certificates table count
      const { data, error, count } = await client
        .from('certificates')
        .select('id', { count: 'exact', head: true });

      if (error) {
        // Table does not exist (PGRST205 / 42P01) or permissions error
        const isTableMissing =
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.toLowerCase().includes('relation') ||
          error.message?.toLowerCase().includes('does not exist');

        this.connectionStatus = {
          isConfigured: true,
          isConnected: !isTableMissing,
          tableExists: !isTableMissing,
          lastCheck: new Date().toLocaleTimeString('id-ID'),
          errorMessage: isTableMissing
            ? 'Tabel "certificates" belum ditemukan di Supabase. Harap jalankan SQL migration.'
            : error.message || 'Error saat mengakses tabel certificates di Supabase.',
          certificateCount: 0,
        };
      } else {
        this.connectionStatus = {
          isConfigured: true,
          isConnected: true,
          tableExists: true,
          lastCheck: new Date().toLocaleTimeString('id-ID'),
          errorMessage: null,
          certificateCount: typeof count === 'number' ? count : (data ? data.length : 0),
        };
      }
    } catch (e: any) {
      this.connectionStatus = {
        isConfigured: true,
        isConnected: false,
        tableExists: false,
        lastCheck: new Date().toLocaleTimeString('id-ID'),
        errorMessage: e?.message || 'Gagal terhubung ke host Supabase online.',
        certificateCount: 0,
      };
    }

    this.notifyStatus();
    return this.getStatus();
  }

  /**
   * Save / Upsert a single certificate to Supabase
   */
  public async saveCertificate(cert: CertificateItem): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client unavailable' };

    try {
      const row = this.toRow(cert);
      const { error } = await client.from('certificates').upsert(row, {
        onConflict: 'certificate_number',
      });

      if (error) {
        console.warn('[Supabase] Upsert error:', error.message);
        return { success: false, error: error.message };
      }

      this.connectionStatus.isConnected = true;
      this.connectionStatus.tableExists = true;
      this.connectionStatus.errorMessage = null;
      this.notifyStatus();
      return { success: true };
    } catch (e: any) {
      console.warn('[Supabase] Save exception:', e?.message || e);
      return { success: false, error: e?.message || 'Network exception' };
    }
  }

  /**
   * Batch upsert certificates to Supabase
   */
  public async batchSaveCertificates(certs: CertificateItem[]): Promise<{ count: number; error?: string }> {
    if (!certs.length) return { count: 0 };
    const client = this.getClient();
    if (!client) return { count: 0, error: 'Supabase client unavailable' };

    try {
      const rows = certs.map((c) => this.toRow(c));
      const { error } = await client.from('certificates').upsert(rows, {
        onConflict: 'certificate_number',
      });

      if (error) {
        return { count: 0, error: error.message };
      }

      this.connectionStatus.isConnected = true;
      this.connectionStatus.tableExists = true;
      this.connectionStatus.errorMessage = null;
      this.notifyStatus();
      return { count: rows.length };
    } catch (e: any) {
      return { count: 0, error: e?.message || 'Network exception' };
    }
  }

  /**
   * Fetch all certificates from Supabase
   */
  public async fetchAllCertificates(): Promise<CertificateItem[] | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] fetchAll error:', error.message);
        return null;
      }

      if (Array.isArray(data)) {
        this.connectionStatus.isConnected = true;
        this.connectionStatus.tableExists = true;
        this.connectionStatus.certificateCount = data.length;
        this.connectionStatus.errorMessage = null;
        this.notifyStatus();
        return data.map((r) => this.toItem(r));
      }
      return [];
    } catch (e: any) {
      console.warn('[Supabase] fetchAll exception:', e?.message || e);
      return null;
    }
  }

  /**
   * Query certificate by exact certificate number (for verification page)
   */
  public async getByNumber(certNumber: string): Promise<CertificateItem | null> {
    const client = this.getClient();
    if (!client) return null;

    const clean = certNumber.trim();
    try {
      const { data, error } = await client
        .from('certificates')
        .select('*')
        .ilike('certificate_number', clean)
        .limit(1);

      if (error) {
        console.warn('[Supabase] getByNumber error:', error.message);
        return null;
      }

      if (data && data.length > 0) {
        return this.toItem(data[0]);
      }
      return null;
    } catch (e: any) {
      console.warn('[Supabase] getByNumber exception:', e?.message || e);
      return null;
    }
  }

  /**
   * Search certificates online by keyword (cert number, participant name, email, event title)
   * This enables real-time public lookup from mobile devices!
   */
  public async searchOnline(keyword: string, eventId?: string): Promise<CertificateItem[] | null> {
    const client = this.getClient();
    if (!client) return null;

    const q = keyword.trim();
    try {
      let query = client.from('certificates').select('*');

      if (q) {
        // Search across certificate_number, participant_name, participant_email, event_title
        query = query.or(
          `certificate_number.ilike.%${q}%,participant_name.ilike.%${q}%,participant_email.ilike.%${q}%,event_title.ilike.%${q}%`
        );
      }

      if (eventId && eventId !== 'ALL') {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error) {
        console.warn('[Supabase] searchOnline error:', error.message);
        return null;
      }

      if (Array.isArray(data)) {
        return data.map((r) => this.toItem(r));
      }
      return [];
    } catch (e: any) {
      console.warn('[Supabase] searchOnline exception:', e?.message || e);
      return null;
    }
  }

  /**
   * Update certificate status (Revoke / Activate)
   */
  public async updateStatus(
    certNumber: string,
    status: 'AKTIF' | 'DICABUT' | 'KADALUARSA',
    revokeReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client unavailable' };

    try {
      const payload: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (revokeReason !== undefined) {
        payload.revoke_reason = revokeReason;
      }

      const { error } = await client
        .from('certificates')
        .update(payload)
        .ilike('certificate_number', certNumber.trim());

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network exception' };
    }
  }

  /**
   * Delete single certificate from Supabase by certificate_number or id
   */
  public async deleteCertificate(certNumberOrId: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client unavailable' };

    const target = certNumberOrId.trim();
    try {
      const { error } = await client
        .from('certificates')
        .delete()
        .or(`certificate_number.eq.${target},id.eq.${target}`);

      if (error) {
        console.warn('[Supabase] deleteCertificate error:', error.message);
        return { success: false, error: error.message };
      }

      this.connectionStatus.isConnected = true;
      this.connectionStatus.tableExists = true;
      this.notifyStatus();
      return { success: true };
    } catch (e: any) {
      console.warn('[Supabase] deleteCertificate exception:', e?.message || e);
      return { success: false, error: e?.message || 'Network exception' };
    }
  }

  /**
   * Delete batch certificates from Supabase by list of certificate numbers
   */
  public async batchDeleteCertificates(certNumbers: string[]): Promise<{ count: number; error?: string }> {
    if (!certNumbers.length) return { count: 0 };
    const client = this.getClient();
    if (!client) return { count: 0, error: 'Supabase client unavailable' };

    try {
      const { error } = await client
        .from('certificates')
        .delete()
        .in('certificate_number', certNumbers);

      if (error) {
        console.warn('[Supabase] batchDelete error:', error.message);
        return { count: 0, error: error.message };
      }

      this.connectionStatus.isConnected = true;
      this.connectionStatus.tableExists = true;
      this.notifyStatus();
      return { count: certNumbers.length };
    } catch (e: any) {
      console.warn('[Supabase] batchDelete exception:', e?.message || e);
      return { count: 0, error: e?.message || 'Network exception' };
    }
  }

  /**
   * SQL Schema snippet for user copy-paste into Supabase SQL Editor if needed
   */
  public getSqlMigrationScript(): string {
    return `-- ==========================================================
-- ARTAKARYA CERTIFICATE SYSTEM - SUPABASE SQL SCHEMA
-- Jalankan di SQL Editor Supabase: https://supabase.com/dashboard/project/zpipiupnjusqhxihdbl/sql
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    certificate_number TEXT NOT NULL UNIQUE,
    participant_id TEXT,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    participant_org TEXT,
    participant_role TEXT DEFAULT 'Peserta',
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_subtitle TEXT,
    event_date TEXT NOT NULL,
    organizer TEXT DEFAULT 'ARTAKARYA Creative Intelligence Lab',
    issue_date TEXT NOT NULL,
    expiry_date TEXT,
    template_id TEXT DEFAULT 'tpl-custom',
    orientation TEXT DEFAULT 'landscape',
    verification_hash TEXT NOT NULL,
    verification_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AKTIF', -- 'AKTIF', 'DICABUT', 'KADALUARSA'
    revoke_reason TEXT,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TEXT,
    signer1_name TEXT,
    signer1_title TEXT,
    signer2_name TEXT,
    signer2_title TEXT,
    is_demo BOOLEAN DEFAULT false,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk percepat pencarian publik real-time
CREATE INDEX IF NOT EXISTS idx_cert_number ON public.certificates (certificate_number);
CREATE INDEX IF NOT EXISTS idx_cert_name ON public.certificates (participant_name);
CREATE INDEX IF NOT EXISTS idx_cert_email ON public.certificates (participant_email);
CREATE INDEX IF NOT EXISTS idx_cert_event ON public.certificates (event_id);

-- Enable RLS (Row Level Security) dengan policy akses publik
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 1. Siapa saja (pengunjung/peserta publik) boleh membaca data sertifikat
DROP POLICY IF EXISTS "Public can view certificates" ON public.certificates;
CREATE POLICY "Public can view certificates" 
ON public.certificates FOR SELECT 
USING (true);

-- 2. Mengizinkan insert/update melalui anon key dari aplikasi ARTAKARYA
DROP POLICY IF EXISTS "Anon can insert and update certificates" ON public.certificates;
CREATE POLICY "Anon can insert and update certificates" 
ON public.certificates FOR ALL 
USING (true)
WITH CHECK (true);
`;
  }
}

export const supabaseService = new SupabaseService();
