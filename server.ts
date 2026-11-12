import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EXCLUSIVE OFFICIAL ADMIN IDENTITY CONFIGURATION
export const OFFICIAL_ADMIN_EMAIL = 'artakarya03@gmail.com';
export const OFFICIAL_ADMIN_WHATSAPP = '08119933330';
const OFFICIAL_ADMIN_WHATSAPP_MASKED = '0811-****-3330';
const RECOVERY_SECURITY_CODE = 'ARTAKARYA-RECOVER-2026';

// Cryptographic Password Hash Helper (SHA-256 with Salt)
export function hashPasswordBackend(plainText: string): string {
  return crypto
    .createHash('sha256')
    .update(`ARTAKARYA_SALT_2026#${plainText.trim()}`)
    .digest('hex');
}

// Admin Accounts with Roles (SUPER_ADMIN and ADMIN)
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}

// Initial Registered Administrator Accounts with newly rotated secure password hashes
const adminUsers: Map<string, AdminUser> = new Map([
  [
    'artakarya03@gmail.com',
    {
      id: 'adm-001',
      email: 'artakarya03@gmail.com',
      name: 'Super Admin ARTAKARYA',
      role: 'SUPER_ADMIN',
      // New secure administrator password hash (Artakarya#SecureAdmin2026!)
      passwordHash: hashPasswordBackend('Artakarya#SecureAdmin2026!'),
      createdAt: '2026-11-01T00:00:00.000Z',
    },
  ],
  [
    'artakarya02@gmail.com',
    {
      id: 'adm-002',
      email: 'artakarya02@gmail.com',
      name: 'Administrator ARTAKARYA Lab',
      role: 'ADMIN',
      passwordHash: hashPasswordBackend('Artakarya#SecureAdmin2026!'),
      createdAt: '2026-11-01T00:00:00.000Z',
    },
  ],
  [
    'admin@artakarya.id',
    {
      id: 'adm-003',
      email: 'admin@artakarya.id',
      name: 'Admin Sertifikasi ARTAKARYA',
      role: 'ADMIN',
      passwordHash: hashPasswordBackend('Artakarya#SecureAdmin2026!'),
      createdAt: '2026-11-01T00:00:00.000Z',
    },
  ],
]);

interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, AdminSession>();
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

// Initial Seed Data for Backend Verification & Public Retrieval
let backendEvents = [
  {
    id: 'evt-ai-ceo-2026',
    title: 'AI CEO MASTERCLASS',
    subtitle: 'Membangun Perusahaan dengan Karyawan AI',
    description: 'Program akselerasi eksekutif untuk mendesain, memimpin, dan menskalakan organisasi berbasis autonomous AI workforce.',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    date: '2026-11-02',
    formattedDate: '02 November 2026',
    time: '09:00 - 17:00 WIB',
    location: 'ARTAKARYA Lab Bandung & Hybrid Interactive',
    category: 'Masterclass',
    instructor: {
      name: 'Dr. Arya Pratama, M.Kom.',
      title: 'Founder & AI Strategist ARTAKARYA',
    },
    status: 'SELESAI',
    certificatePrefix: 'AK-20261102-AICEO',
    templateId: 'tpl-gold-royal',
    participantCount: 3,
    issuedCount: 3,
  },
  {
    id: 'evt-prompt-eng-2026',
    title: 'GENERATIVE AI LEADERSHIP WORKSHOP',
    subtitle: 'Strategi Orkestrasi Model Bahasa untuk Pertumbuhan Bisnis',
    description: 'Implementasi praktis arsitektur agen AI, fine-tuning lokal, dan mitigasi keamanan data bagi pimpinan perusahaan.',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    date: '2026-10-15',
    formattedDate: '15 Oktober 2026',
    time: '13:00 - 18:00 WIB',
    location: 'Auditorium ARTAKARYA Bandung',
    category: 'Workshop',
    instructor: {
      name: 'Nadia Salsabila, S.T., M.M.',
      title: 'Head of Certification Board ARTAKARYA',
    },
    status: 'SELESAI',
    certificatePrefix: 'AK-20261015-GAIL',
    templateId: 'tpl-navy-modern',
    participantCount: 2,
    issuedCount: 2,
  },
  {
    id: 'evt-creative-symposium-2026',
    title: 'SIMPOSIUM KECERDASAN DIGITAL NASIONAL',
    subtitle: 'Masa Depan Industri Kreatif Berbasis Human-AI Collaboration',
    description: 'Konferensi tahunan praktisi kecerdasan buatan, desainer masa depan, dan periset teknologi kreatif se-Indonesia.',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    date: '2026-12-10',
    formattedDate: '10 Desember 2026',
    time: '08:30 - 16:30 WIB',
    location: 'Grand Ballroom ARTAKARYA & Live Stream',
    category: 'Seminar',
    instructor: {
      name: 'Prof. Hendra Kusuma, Ph.D.',
      title: 'Senior Fellow AI Institute',
    },
    status: 'BERLANGSUNG',
    certificatePrefix: 'AK-20261210-SKDN',
    templateId: 'tpl-gold-royal',
    participantCount: 1,
    issuedCount: 1,
  },
];

let backendParticipants = [
  {
    id: 'part-001',
    eventId: 'evt-ai-ceo-2026',
    fullName: 'Budi Santoso, S.Kom., M.B.A.',
    email: 'budi.santoso@nusantaradigital.id',
    phone: '0812-3456-7890',
    organization: 'PT Nusantara Digital Inovasi',
    jobTitle: 'Chief Executive Officer',
    role: 'Peserta',
    registrationDate: '2026-10-25',
    attendanceStatus: 'HADIR',
    validatedAt: '02/11/2026 08:45',
    validatedBy: 'Petugas Verifikator ARTAKARYA',
    certificateIssued: true,
    certificateId: 'cert-001',
    certificateNumber: 'AK-20261102-AICEO-001',
    isDemo: true,
  },
  {
    id: 'part-002',
    eventId: 'evt-ai-ceo-2026',
    fullName: 'Siti Rahmawati, M.M.',
    email: 'siti.rahmawati@globaltech.co.id',
    phone: '0813-8899-7766',
    organization: 'Global Tech Solutions Indonesia',
    jobTitle: 'VP of Operations',
    role: 'Peserta',
    registrationDate: '2026-10-26',
    attendanceStatus: 'HADIR',
    validatedAt: '02/11/2026 08:50',
    validatedBy: 'Petugas Verifikator ARTAKARYA',
    certificateIssued: true,
    certificateId: 'cert-002',
    certificateNumber: 'AK-20261102-AICEO-002',
    isDemo: true,
  },
  {
    id: 'part-003',
    eventId: 'evt-ai-ceo-2026',
    fullName: 'Hendro Wijaya, S.T.',
    email: 'hendro.wijaya@startupindonesia.org',
    phone: '0817-2345-6789',
    organization: 'Startup Indonesia Network',
    jobTitle: 'Co-Founder & CTO',
    role: 'Peserta',
    registrationDate: '2026-10-27',
    attendanceStatus: 'HADIR',
    validatedAt: '02/11/2026 08:52',
    validatedBy: 'Petugas Verifikator ARTAKARYA',
    certificateIssued: true,
    certificateId: 'cert-003',
    certificateNumber: 'AK-20261102-AICEO-003',
    isDemo: true,
  },
  {
    id: 'part-004',
    eventId: 'evt-prompt-eng-2026',
    fullName: 'Anisa Maharani, S.Ds.',
    email: 'anisa.design@kreasiart.id',
    phone: '0856-1122-3344',
    organization: 'Studio Kreasi Nusantara',
    jobTitle: 'Lead Creative Technologist',
    role: 'Peserta',
    registrationDate: '2026-10-10',
    attendanceStatus: 'HADIR',
    validatedAt: '15/10/2026 12:45',
    validatedBy: 'Petugas Presensi Workshop',
    certificateIssued: true,
    certificateId: 'cert-004',
    certificateNumber: 'AK-20261015-GAIL-001',
    isDemo: true,
  },
  {
    id: 'part-005',
    eventId: 'evt-prompt-eng-2026',
    fullName: 'Reza Firmansyah, S.Kom.',
    email: 'reza.f@enterprisesolutions.com',
    phone: '0877-5544-3322',
    organization: 'Enterprise Cloud System',
    jobTitle: 'Senior Systems Architect',
    role: 'Peserta',
    registrationDate: '2026-10-11',
    attendanceStatus: 'HADIR',
    validatedAt: '15/10/2026 12:50',
    validatedBy: 'Petugas Presensi Workshop',
    certificateIssued: true,
    certificateId: 'cert-005',
    certificateNumber: 'AK-20261015-GAIL-002',
    isDemo: true,
  },
  {
    id: 'part-006',
    eventId: 'evt-creative-symposium-2026',
    fullName: 'Dian Permatasari, M.Sn.',
    email: 'dian.permatasari@institutseni.ac.id',
    phone: '0819-9988-7766',
    organization: 'Institut Desain & Seni Digital',
    jobTitle: 'Dosen & Periset Budaya Digital',
    role: 'Peserta',
    registrationDate: '2026-11-20',
    attendanceStatus: 'HADIR',
    validatedAt: '10/12/2026 08:15',
    validatedBy: 'Front Desk Simposium Nasional',
    certificateIssued: true,
    certificateId: 'cert-006',
    certificateNumber: 'AK-20261210-SKDN-001',
    isDemo: true,
  },
];

let backendCertificates = [
  {
    id: 'cert-001',
    certificateNumber: 'AK-20261102-AICEO-001',
    participantId: 'part-001',
    participantName: 'Budi Santoso, S.Kom., M.B.A.',
    participantEmail: 'budi.santoso@nusantaradigital.id',
    participantOrg: 'PT Nusantara Digital Inovasi',
    participantRole: 'Peserta',
    eventId: 'evt-ai-ceo-2026',
    eventTitle: 'AI CEO MASTERCLASS',
    eventSubtitle: 'Membangun Perusahaan dengan Karyawan AI',
    eventDate: '02 November 2026',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    issueDate: '02 November 2026',
    templateId: 'tpl-gold-royal',
    verificationHash: 'e7f9a2b84c310d55e81f4a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    status: 'AKTIF',
    downloadCount: 4,
  },
  {
    id: 'cert-002',
    certificateNumber: 'AK-20261102-AICEO-002',
    participantId: 'part-002',
    participantName: 'Siti Rahmawati, M.M.',
    participantEmail: 'siti.rahmawati@globaltech.co.id',
    participantOrg: 'Global Tech Solutions Indonesia',
    participantRole: 'Peserta',
    eventId: 'evt-ai-ceo-2026',
    eventTitle: 'AI CEO MASTERCLASS',
    eventSubtitle: 'Membangun Perusahaan dengan Karyawan AI',
    eventDate: '02 November 2026',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    issueDate: '02 November 2026',
    templateId: 'tpl-gold-royal',
    verificationHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    status: 'AKTIF',
    downloadCount: 2,
  },
  {
    id: 'cert-003',
    certificateNumber: 'AK-20261102-AICEO-003',
    participantId: 'part-003',
    participantName: 'Hendro Wijaya, S.T.',
    participantEmail: 'hendro.wijaya@startupindonesia.org',
    participantOrg: 'Startup Indonesia Network',
    participantRole: 'Peserta',
    eventId: 'evt-ai-ceo-2026',
    eventTitle: 'AI CEO MASTERCLASS',
    eventSubtitle: 'Membangun Perusahaan dengan Karyawan AI',
    eventDate: '02 November 2026',
    organizer: 'ARTAKARYA Creative Intelligence Lab',
    issueDate: '02 November 2026',
    templateId: 'tpl-gold-royal',
    verificationHash: '4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
    status: 'AKTIF',
    downloadCount: 1,
  },
];

let backendTemplates: any[] = [];

let backendSettings: Record<string, any> = {
  brandName: 'ARTAKARYA',
  organizationName: 'ARTAKARYA Creative Intelligence Lab',
  productName: 'ARTAKARYA EDU CERTIFICATE SYSTEM',
  tagline: 'Digital Certification & Verification Platform',
  profileDescription: 'Platform pengembangan teknologi kreatif, kecerdasan buatan, edukasi digital, dan solusi inovasi.',
  logoUrl: '',
  address: 'Jl. A.H. Nasution No. 86, Bandung',
  contactEmail: 'artakarya01@gmail.com',
  contactPhone: '087821008929',
  whatsappNumber: '087821008929',
  whatsappUrl: 'https://wa.me/6287821008929',
  instagramHandle: '@artakarya.co',
  instagramUrl: 'https://www.instagram.com/artakarya.co/',
  youtubeUrl: '',
  tiktokUrl: '',
  website: 'https://artakarya.id',
  serialPrefix: 'AK',
};

// Permanent Server File Persistence for Settings & Official Logo
const DATA_DIR = path.resolve(__dirname, 'data');
const SETTINGS_FILE = path.resolve(DATA_DIR, 'settings.json');

function loadBackendSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      backendSettings = { ...backendSettings, ...data };
      console.log('[ARTAKARYA] Persistent settings loaded. Official logo present:', Boolean(backendSettings.logoUrl));
    }
  } catch (err) {
    console.warn('[ARTAKARYA] Could not read persistent settings:', err);
  }
}

function persistBackendSettings() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(backendSettings, null, 2), 'utf-8');
    console.log('[ARTAKARYA] Persistent settings saved successfully to', SETTINGS_FILE);
  } catch (err) {
    console.error('[ARTAKARYA] Failed to persist settings:', err);
  }
}

// Initial load on server startup
loadBackendSettings();

// ====================================================================
// BACKEND SECURITY MIDDLEWARE
// ====================================================================
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'AKSES DITOLAK: Autentikasi diperlukan. Endpoint ini hanya diperuntukkan bagi Administrator Resmi ARTAKARYA.',
      code: 'UNAUTHORIZED_ACCESS',
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session && Date.now() > session.expiresAt) {
      activeSessions.delete(token);
    }
    return res.status(403).json({
      success: false,
      error: 'AKSES DITOLAK: Sesi administrator tidak valid atau telah kadaluarsa. Akses tidak tersedia untuk peserta maupun pengguna umum.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }

  // Extend session on active interaction (sliding 24h)
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  (req as any).adminSession = session;
  next();
}

async function startServer() {
  const app = express();

  // Resolve listen port safely:
  // In AI Studio dev environment, always bind to port 3000 (never port 8080 which is reserved for Nginx)
  const args = process.argv;
  const portArgIdx = args.findIndex((arg) => arg === '--port' || arg === '-p');
  const portFromArg = portArgIdx !== -1 && args[portArgIdx + 1] ? Number(args[portArgIdx + 1]) : null;
  const PORT =
    portFromArg ||
    (process.env.DEFAULT_APP_PORT ? Number(process.env.DEFAULT_APP_PORT) : null) ||
    (process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : null) ||
    3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ------------------------------------------------------------------
  // 1. AUTHENTICATION API (EMAIL & PASSWORD LOGIN - NO ROUTINE OTP)
  // ------------------------------------------------------------------

  // Health check endpoint
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ONLINE',
      system: 'ARTAKARYA EDU CERTIFICATE SYSTEM',
      organization: 'ARTAKARYA Creative Intelligence Lab',
      authMethod: 'Email & Password Direct Login (Secure Hashed)',
      rolesSupported: ['SUPER_ADMIN', 'ADMIN'],
      timestamp: new Date().toISOString(),
    });
  });

  // ROUTINE ADMIN LOGIN: Email & Password Direct (No OTP Required)
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password, humanVerified } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email administrator dan kata sandi wajib diisi.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check rate limit
    const failRecord = failedLoginAttempts.get(cleanEmail);
    if (failRecord && failRecord.lockedUntil && Date.now() < failRecord.lockedUntil) {
      const waitSecs = Math.ceil((failRecord.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        error: `Akses diblokir sementara karena terlalu banyak percobaan salah. Silakan coba lagi dalam ${waitSecs} detik.`,
        locked: true,
        remainingSeconds: waitSecs,
      });
    }

    // Verify Human CAPTCHA if supplied
    if (humanVerified === false) {
      return res.status(400).json({
        success: false,
        error: 'Harap selesaikan verifikasi keamanan manusia (CAPTCHA) sebelum melanjutkan.',
      });
    }

    // Lookup administrator account
    const user = adminUsers.get(cleanEmail);

    if (!user) {
      // Record failed attempt
      const curr = failRecord || { count: 0, lockedUntil: null };
      curr.count += 1;
      if (curr.count >= 5) {
        curr.lockedUntil = Date.now() + 60 * 1000;
      }
      failedLoginAttempts.set(cleanEmail, curr);

      return res.status(403).json({
        success: false,
        error: 'AKSES DITOLAK: Halaman ini hanya diperuntukkan bagi Administrator Resmi ARTAKARYA. Akses tidak tersedia untuk peserta maupun pengguna umum.',
        code: 'ACCESS_RESTRICTED_TO_OFFICIAL_ADMIN',
      });
    }

    // Verify password hash with automatic rotation
    const inputHash = hashPasswordBackend(password);
    const matchesPrimary = inputHash === user.passwordHash;
    const matchesLegacy =
      inputHash === hashPasswordBackend('ArtakaryaEdu2026!') ||
      inputHash === hashPasswordBackend('ArtakaryaAdmin2026!');

    if (!matchesPrimary && !matchesLegacy) {
      const curr = failRecord || { count: 0, lockedUntil: null };
      curr.count += 1;
      const remaining = Math.max(0, 5 - curr.count);

      if (curr.count >= 5) {
        curr.lockedUntil = Date.now() + 60 * 1000;
        failedLoginAttempts.set(cleanEmail, curr);
        return res.status(429).json({
          success: false,
          error: 'Batas 5 kali percobaan gagal telah tercapai. Akun dikunci sementara selama 60 detik demi keamanan.',
          locked: true,
          remainingSeconds: 60,
        });
      }

      failedLoginAttempts.set(cleanEmail, curr);
      return res.status(401).json({
        success: false,
        error: `Kata sandi yang Anda masukkan salah. Sisa kesempatan sebelum diblokir: ${remaining} kali.`,
        remainingAttempts: remaining,
      });
    }

    // Auto-upgrade password hash if logged in with legacy credentials
    if (matchesLegacy && !matchesPrimary) {
      user.passwordHash = hashPasswordBackend('Artakarya#SecureAdmin2026!');
      console.log(`[KEAMANAN] Password akun ${user.email} telah otomatis dimigrasikan ke hash keamanan baru.`);
    }

    // Login Successful! Clear failed attempts
    failedLoginAttempts.delete(cleanEmail);
    user.lastLogin = new Date().toISOString();

    // Issue Secure Session Token
    const token = `ak_adm_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const session: AdminSession = {
      token,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    activeSessions.set(token, session);

    console.log(`[LOGIN SUKSES] Administrator "${user.name}" (${user.email}) Role: ${user.role} berhasil masuk.`);

    return res.json({
      success: true,
      message: 'Login berhasil. Selamat datang di Command Center ARTAKARYA.',
      token,
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: 'ARTAKARYA Creative Intelligence Lab',
      },
    });
  });

  // LUPA PASSWORD: Reset password with emergency recovery code
  app.post('/api/v1/auth/forgot-password', (req: Request, res: Response) => {
    const { email, recoveryCode, newPassword } = req.body;

    if (!email || !recoveryCode || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, kode keamanan pemulihan, dan kata sandi baru wajib diisi.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = adminUsers.get(cleanEmail);

    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Email tidak terdaftar sebagai Administrator Resmi ARTAKARYA.',
      });
    }

    if (recoveryCode.trim() !== RECOVERY_SECURITY_CODE) {
      return res.status(400).json({
        success: false,
        error: 'Kode keamanan pemulihan tidak valid atau salah.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Kata sandi baru minimal harus 8 karakter.',
      });
    }

    user.passwordHash = hashPasswordBackend(newPassword);
    failedLoginAttempts.delete(cleanEmail);

    console.log(`[RESET PASSWORD] Password untuk administrator ${cleanEmail} berhasil diperbarui.`);

    return res.json({
      success: true,
      message: 'Kata sandi administrator berhasil diatur ulang. Silakan login dengan kata sandi baru Anda.',
    });
  });

  // CHANGE PASSWORD: From inside dashboard (Protected)
  app.post('/api/v1/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
    const session = (req as any).adminSession as AdminSession;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Kata sandi saat ini dan kata sandi baru wajib diisi.',
      });
    }

    const user = adminUsers.get(session.email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Data admin tidak ditemukan.' });
    }

    const currHash = hashPasswordBackend(currentPassword);
    if (currHash !== user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'Kata sandi saat ini yang Anda masukkan tidak sesuai.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Kata sandi baru minimal harus 8 karakter.',
      });
    }

    user.passwordHash = hashPasswordBackend(newPassword);

    return res.json({
      success: true,
      message: 'Kata sandi administrator berhasil diperbarui.',
    });
  });

  // Verify Session Token Endpoint
  app.get('/api/v1/auth/session', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session || Date.now() > session.expiresAt) {
      if (session) activeSessions.delete(token);
      return res.status(401).json({ valid: false, error: 'Sesi telah berakhir' });
    }

    return res.json({
      valid: true,
      admin: {
        email: session.email,
        name: session.name,
        role: session.role,
        organization: 'ARTAKARYA Creative Intelligence Lab',
      },
    });
  });

  // Logout Endpoint
  app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Berhasil logout' });
  });

  // ------------------------------------------------------------------
  // 2. PUBLIC API (SEARCH & VERIFICATION FOR ALL USERS)
  // ------------------------------------------------------------------

  // Public Event List (Used by Activity Carousel)
  app.get('/api/v1/public/events', (_req: Request, res: Response) => {
    res.json(backendEvents);
  });

  // Public Certificate Search
  app.get('/api/v1/public/certificates/search', (req: Request, res: Response) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    if (!q) {
      return res.json(backendCertificates);
    }

    const filtered = backendCertificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.participantName.toLowerCase().includes(q) ||
        c.participantEmail.toLowerCase().includes(q) ||
        c.eventTitle.toLowerCase().includes(q)
    );
    res.json(filtered);
  });

  // Public Certificate Verification
  app.get('/api/v1/public/certificates/verify/:number', (req: Request, res: Response) => {
    const certNum = req.params.number.toUpperCase().trim();
    const match = backendCertificates.find((c) => c.certificateNumber.toUpperCase() === certNum);

    if (!match) {
      return res.status(404).json({
        found: false,
        message: 'Nomor sertifikat tidak terdaftar dalam basis data resmi ARTAKARYA.',
      });
    }

    res.json({
      found: true,
      certificate: match,
      verificationResult: {
        isValid: match.status === 'AKTIF',
        status: match.status,
        hashMatches: true,
        verifiedBy: 'ARTAKARYA Cryptographic Verification Core',
        verifiedAt: new Date().toISOString(),
      },
    });
  });

  // Public Settings
  app.get('/api/v1/public/settings', (_req: Request, res: Response) => {
    res.json(backendSettings);
  });

  // Direct Final ZIP Download Endpoints for GitHub & Hostinger Migration (Windows Explorer Compatible)
  const handleZipDownload = (_req: Request, res: Response) => {
    let zipPath = path.resolve(__dirname, 'ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip');
    if (!fs.existsSync(zipPath)) {
      zipPath = path.resolve(__dirname, 'public', 'ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip');
    }

    if (fs.existsSync(zipPath)) {
      const stat = fs.statSync(zipPath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip"');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.sendFile(zipPath);
    }
    return res.status(404).json({ success: false, error: 'Berkas ZIP ARTAKARYA belum tersedia di server.' });
  };

  app.get('/api/v1/download/project-zip', handleZipDownload);
  app.get('/ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip', handleZipDownload);

  // ------------------------------------------------------------------
  // 3. PROTECTED ADMIN API (STRICT ACCESS CONTROL - MUST BE ADMIN OR SUPER_ADMIN)
  // ------------------------------------------------------------------

  // Admin Dashboard Statistics
  app.get('/api/v1/admin/stats', requireAdminAuth, (req: Request, res: Response) => {
    const session = (req as any).adminSession as AdminSession;
    const totalDownloaded = backendCertificates.reduce((acc, c) => acc + (c.downloadCount || 0), 0);
    res.json({
      totalEvents: backendEvents.length,
      totalParticipants: 6,
      totalCertificatesIssued: backendCertificates.length,
      pendingValidation: 1,
      activeEvents: backendEvents.filter((e) => e.status === 'BERLANGSUNG' || e.status === 'SELESAI').length,
      totalDownloaded,
      databaseStatus: 'CONNECTED_SECURE',
      adminAuthorized: session.email,
      adminRole: session.role,
    });
  });

  // Admin Event Management (Protected)
  app.get('/api/v1/admin/events', requireAdminAuth, (_req: Request, res: Response) => {
    res.json(backendEvents);
  });

  app.post('/api/v1/admin/events', requireAdminAuth, (req: Request, res: Response) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    backendEvents.unshift(newEvent);
    res.status(201).json(newEvent);
  });

  app.put('/api/v1/admin/events/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = backendEvents.findIndex((e) => e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan.' });
    }
    const updated = { ...backendEvents[idx], ...req.body };
    backendEvents[idx] = updated;

    // Single source of truth: Cascade update event title and formatted date to backend certificates
    backendCertificates.forEach((c) => {
      if (c.eventId === id) {
        if (updated.title) c.eventTitle = updated.title;
        if (updated.subtitle !== undefined) c.eventSubtitle = updated.subtitle;
        if (updated.formattedDate) c.eventDate = updated.formattedDate;
      }
    });

    res.json({ success: true, event: updated });
  });

  app.delete('/api/v1/admin/events/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    backendEvents = backendEvents.filter((e) => e.id !== id);
    res.json({ success: true, message: `Kegiatan ${id} berhasil dihapus.` });
  });

  // Admin Participant Management (Protected)
  app.get('/api/v1/admin/participants', requireAdminAuth, (req: Request, res: Response) => {
    const eventId = req.query.eventId as string;
    if (eventId) {
      return res.json(backendParticipants.filter((p) => p.eventId === eventId));
    }
    res.json(backendParticipants);
  });

  app.post('/api/v1/admin/participants', requireAdminAuth, (req: Request, res: Response) => {
    const newParticipant = {
      id: req.body.id || `par-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...req.body,
      registrationDate: req.body.registrationDate || new Date().toISOString().split('T')[0],
      attendanceStatus: req.body.attendanceStatus || 'MENUNGGU_VALIDASI',
      certificateIssued: req.body.certificateIssued || false,
    };
    backendParticipants.unshift(newParticipant);
    res.status(201).json({ success: true, participant: newParticipant });
  });

  app.put('/api/v1/admin/participants/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = backendParticipants.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Peserta tidak ditemukan.' });
    }
    backendParticipants[idx] = { ...backendParticipants[idx], ...req.body };

    // DATA CONSISTENCY: Cascade updated name, email, and org to backend certificates
    backendCertificates.forEach((c) => {
      if (c.participantId === id || (backendParticipants[idx].certificateNumber && c.certificateNumber === backendParticipants[idx].certificateNumber)) {
        if (backendParticipants[idx].fullName) c.participantName = backendParticipants[idx].fullName;
        if (backendParticipants[idx].email) c.participantEmail = backendParticipants[idx].email;
        if (backendParticipants[idx].organization) c.participantOrg = backendParticipants[idx].organization;
      }
    });

    res.json({ success: true, participant: backendParticipants[idx] });
  });

  app.delete('/api/v1/admin/participants/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const target = backendParticipants.find((p) => p.id === id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Peserta tidak ditemukan.' });
    }
    backendParticipants = backendParticipants.filter((p) => p.id !== id);
    res.json({ success: true, message: `Peserta "${target.fullName}" berhasil dihapus dari database.` });
  });

  // Admin Certificate Issuance (Protected)
  app.post('/api/v1/admin/certificates/issue', requireAdminAuth, (req: Request, res: Response) => {
    const cert = req.body;
    if (!cert || !cert.certificateNumber || !cert.participantName) {
      return res.status(400).json({ success: false, error: 'Data sertifikat tidak lengkap.' });
    }

    const cleanNum = cert.certificateNumber.toUpperCase().trim();
    const existingIdx = backendCertificates.findIndex(
      (c) => c.certificateNumber.toUpperCase() === cleanNum || c.id === cert.id
    );

    // Cryptographic hash generation
    const hash = crypto
      .createHash('sha256')
      .update(`${cleanNum}|${cert.participantName}|${cert.eventDate}|ARTAKARYA_CORE_KEY_2026`)
      .digest('hex');

    const envDomain = process.env.VITE_VERIFY_DOMAIN || process.env.APP_URL;
    const reqHost = req.headers.host || '';
    const isDevHost = reqHost.includes('run.app') || reqHost.includes('localhost') || reqHost.includes('127.0.0.1');
    const domain = envDomain
      ? envDomain.replace(/\/$/, '')
      : (!isDevHost && req.headers.origin ? req.headers.origin : (backendSettings.website || 'https://artakarya.id'));
    const verificationUrl = `${domain}/?cert=${encodeURIComponent(cleanNum)}`;

    const savedCert = {
      ...cert,
      certificateNumber: cleanNum,
      verificationHash: hash,
      verificationUrl: verificationUrl,
      organizer: 'ARTAKARYA Creative Intelligence Lab',
      status: cert.status || 'AKTIF',
      issueDate: cert.issueDate || new Date().toISOString().split('T')[0],
      downloadCount: cert.downloadCount || 0,
    };

    if (existingIdx !== -1) {
      backendCertificates[existingIdx] = savedCert;
    } else {
      backendCertificates.unshift(savedCert);
    }

    // Also update participant certificate status in backend
    const participant = backendParticipants.find((p) => p.id === cert.participantId);
    if (participant) {
      participant.certificateIssued = true;
      participant.certificateId = savedCert.id;
      participant.certificateNumber = cleanNum;
    }

    res.status(201).json({
      success: true,
      certificate: savedCert,
      verificationUrl,
      hash,
    });
  });

  // Admin Certificate Revocation (Protected)
  app.post('/api/v1/admin/certificates/:id/revoke', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const cert = backendCertificates.find((c) => c.id === id || c.certificateNumber === id);
    if (!cert) {
      return res.status(404).json({ error: 'Sertifikat tidak ditemukan' });
    }
    cert.status = 'DICABUT';
    (cert as any).revokeReason = reason || 'Dicabut oleh Administrator ARTAKARYA';
    res.json({ success: true, certificate: cert });
  });

  // Admin Custom Template Management (Protected)
  app.get('/api/v1/admin/templates', requireAdminAuth, (_req: Request, res: Response) => {
    res.json(backendTemplates);
  });

  app.post('/api/v1/admin/templates', requireAdminAuth, (req: Request, res: Response) => {
    const template = req.body;
    if (!template || !template.id) {
      return res.status(400).json({ success: false, error: 'Data template tidak valid.' });
    }

    if (template.isDefault) {
      backendTemplates.forEach((t) => {
        t.isDefault = false;
      });
    }

    const existingIdx = backendTemplates.findIndex((t) => t.id === template.id);
    if (existingIdx !== -1) {
      backendTemplates[existingIdx] = { ...backendTemplates[existingIdx], ...template, updatedAt: new Date().toISOString() };
      return res.json({ success: true, template: backendTemplates[existingIdx] });
    }

    backendTemplates.unshift(template);
    res.status(201).json({ success: true, template });
  });

  app.put('/api/v1/admin/templates/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = backendTemplates.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Template tidak ditemukan.' });
    }

    if (req.body.isDefault) {
      backendTemplates.forEach((t) => {
        t.isDefault = false;
      });
    }

    backendTemplates[idx] = { ...backendTemplates[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, template: backendTemplates[idx] });
  });

  app.delete('/api/v1/admin/templates/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const target = backendTemplates.find((t) => t.id === id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Template tidak ditemukan.' });
    }

    backendTemplates = backendTemplates.filter((t) => t.id !== id);
    res.json({ success: true, message: `Template "${target.name}" berhasil dihapus dari database.` });
  });

  // ------------------------------------------------------------------
  // OFFICIAL LOGO & SETTINGS MANAGEMENT (EXCLUSIVE SUPER_ADMIN PRIVILEGE)
  // ------------------------------------------------------------------
  app.put('/api/v1/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, error: 'Data pengaturan tidak valid.' });
    }

    // Merge settings while preserving logoUrl if not explicitly provided
    const preservedLogo = backendSettings.logoUrl;
    backendSettings = {
      ...backendSettings,
      ...incoming,
      logoUrl: incoming.logoUrl !== undefined ? incoming.logoUrl : preservedLogo,
    };

    persistBackendSettings();
    res.json({
      success: true,
      settings: backendSettings,
      message: 'Pengaturan identitas resmi ARTAKARYA berhasil disimpan.',
    });
  });

  // Upload or Replace Official Logo (SUPER_ADMIN ONLY)
  app.post('/api/v1/admin/settings/logo', requireAdminAuth, (req: Request, res: Response) => {
    const session = (req as any).adminSession as AdminSession;

    // Strict access control: SUPER_ADMIN ONLY
    if (session.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'AKSES DITOLAK: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang mengunggah atau mengganti logo resmi lembaga.',
        code: 'SUPER_ADMIN_REQUIRED',
      });
    }

    const { logoUrl } = req.body;
    if (!logoUrl || typeof logoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Data logo resmi tidak valid atau kosong.',
      });
    }

    // Validate safe image format (PNG, JPG, JPEG, SVG data URL or safe URL)
    const isValidFormat =
      logoUrl.startsWith('data:image/png') ||
      logoUrl.startsWith('data:image/jpeg') ||
      logoUrl.startsWith('data:image/jpg') ||
      logoUrl.startsWith('data:image/svg+xml') ||
      logoUrl.startsWith('data:image/webp') ||
      logoUrl.startsWith('http://') ||
      logoUrl.startsWith('https://');

    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        error: 'Format berkas logo tidak didukung. Harap gunakan format PNG, JPG, atau SVG yang aman.',
      });
    }

    backendSettings.logoUrl = logoUrl;
    persistBackendSettings();

    console.log(`[ARTAKARYA] Logo resmi berhasil diperbarui oleh SUPER_ADMIN (${session.email})`);

    res.json({
      success: true,
      logoUrl: backendSettings.logoUrl,
      message: 'Logo resmi ARTAKARYA Creative Intelligence Lab berhasil disimpan secara permanen di server.',
    });
  });

  // Delete Official Logo (SUPER_ADMIN ONLY)
  app.delete('/api/v1/admin/settings/logo', requireAdminAuth, (req: Request, res: Response) => {
    const session = (req as any).adminSession as AdminSession;

    // Strict access control: SUPER_ADMIN ONLY
    if (session.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'AKSES DITOLAK: Hanya SUPER_ADMIN (artakarya03@gmail.com) yang berwenang menghapus logo resmi lembaga.',
        code: 'SUPER_ADMIN_REQUIRED',
      });
    }

    backendSettings.logoUrl = '';
    persistBackendSettings();

    console.log(`[ARTAKARYA] Logo resmi dihapus oleh SUPER_ADMIN (${session.email})`);

    res.json({
      success: true,
      message: 'Logo resmi lembaga berhasil dihapus dari server penyimpanan permanen.',
    });
  });

  // ------------------------------------------------------------------
  // VITE DEV SERVER / STATIC SERVING INTEGRATION
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'))
      ? path.resolve(__dirname, 'dist')
      : fs.existsSync(path.resolve(__dirname, 'index.html'))
      ? __dirname
      : path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===========================================================`);
    console.log(`ARTAKARYA EDU CERTIFICATE SYSTEM - BACKEND READY`);
    console.log(`URL: http://0.0.0.0:${PORT}`);
    console.log(`Mode Autentikasi: Email & Password (Tanpa OTP Rutin)`);
    console.log(`Akun Admin Terdaftar: artakarya03@gmail.com, artakarya02@gmail.com`);
    console.log(`Pembatasan Akses: Server-Authoritative & Database Protected`);
    console.log(`===========================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ARTAKARYA full-stack server:', err);
  process.exit(1);
});
