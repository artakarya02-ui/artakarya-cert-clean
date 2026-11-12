/**
 * ARTAKARYA EDU CERTIFICATE SYSTEM
 * SISTEM AUTENTIKASI ADMIN RESMI (100% CLIENT-SIDE / OFFLINE-FIRST / STATIC HOSTING VITE)
 * 
 * Ketentuan Pakem:
 * 1. Akun Super Admin Tunggal:
 *    - Email: artakarya03@gmail.com
 *    - Kata Sandi Resmi: Artakarya#SecureAdmin2026!
 *    - Kode Pemulihan Resmi: ARTAKARYA-RECOVER-2026
 *    - Role: SUPER_ADMIN
 *    - Nama: Super Admin ARTAKARYA
 * 2. Login:
 *    - 100% Client-Side di browser (tanpa memanggil endpoint server/fetch).
 *    - Tidak ada error network saat dideploy ke Hostinger / static hosting.
 *    - Sesi disimpan aman di sessionStorage dan localStorage.
 * 3. Pemulihan & Ubah Kata Sandi:
 *    - Validasi kode pemulihan langsung secara client-side.
 *    - Kata sandi hasil reset/ubah disimpan di localStorage.
 */

const STORAGE_KEY_CUSTOM_PASSWORD = 'artakarya_superadmin_password_v5';
const STORAGE_KEY_RATE_LIMIT = 'artakarya_admin_ratelimit_v5';
const SESSION_KEY = 'artakarya_admin_session_v5';

// Kredensial Resmi Super Admin ARTAKARYA
export const AUTHORIZED_ADMIN_EMAIL = 'artakarya03@gmail.com';
export const OFFICIAL_ADMIN_PASSWORD = 'Artakarya#SecureAdmin2026!';
export const RECOVERY_SECURITY_CODE = 'ARTAKARYA-RECOVER-2026';
export const OFFICIAL_ADMIN_NAME = 'Super Admin ARTAKARYA';

// Rate limiting dinonaktifkan: Bebas mencoba login tanpa batas cooldown / lockout
export interface RateLimitState {
  failedAttempts: number;
  lockedUntil: null;
}

export interface AdminSessionData {
  loggedIn: boolean;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  token: string;
  loginTime: string;
}

// Client-side SHA-256 helper untuk kompatibilitas hash jika diperlukan
export async function hashPasswordClient(plainText: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`ARTAKARYA_SALT_2026#${plainText.trim()}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  const str = `ARTAKARYA_SALT_2026#${plainText.trim()}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

class AuthService {
  /**
   * Mengambil kata sandi aktif saat ini:
   * Mengutamakan kata sandi kustom dari localStorage jika pernah diubah/direset,
   * jika belum pernah diubah maka menggunakan kata sandi resmi default.
   */
  public getActivePassword(): string {
    if (typeof window === 'undefined') return OFFICIAL_ADMIN_PASSWORD;
    try {
      const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_PASSWORD);
      if (custom && custom.trim().length >= 8) {
        return custom.trim();
      }
    } catch {
      // Fallback ke default
    }
    return OFFICIAL_ADMIN_PASSWORD;
  }

  /**
   * Menyimpan kata sandi baru ke localStorage
   */
  public setActivePassword(newPass: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PASSWORD, newPass.trim());
    } catch {
      // Ignore storage quota
    }
  }

  /**
   * Rate limiting / Lockout sepenuhnya dinonaktifkan (selalu 0 / no lock)
   */
  public getRateLimitState(): RateLimitState {
    return { failedAttempts: 0, lockedUntil: null };
  }

  public resetRateLimit() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_RATE_LIMIT);
    } catch {
      // Ignore
    }
  }

  public getRemainingLockSeconds(): number {
    return 0; // Selalu 0: Tidak ada lockout atau cooldown timer
  }

  public isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const parsed: AdminSessionData = JSON.parse(raw);
      return Boolean(
        parsed.loggedIn &&
        (parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN') &&
        parsed.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  public isSuperAdmin(): boolean {
    const session = this.getSession();
    return Boolean(session?.loggedIn && session?.role === 'SUPER_ADMIN');
  }

  public getAuthToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  public getSession(): AdminSessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * LOGIN ADMIN (100% Client-Side / Tanpa fetch API / Bebas Error Jaringan)
   * Sistem pembatasan login (lockout / rate limit) telah dinonaktifkan:
   * Admin bebas mencoba tanpa batasan dan tanpa cooldown timer.
   */
  public async login(
    email: string,
    password: string,
    humanVerified: boolean = true
  ): Promise<{
    success: boolean;
    message: string;
    admin?: AdminSessionData;
    locked?: boolean;
    remainingSeconds?: number;
  }> {
    // 1. Cek verifikasi manusia
    if (!humanVerified) {
      return {
        success: false,
        message: 'Harap selesaikan verifikasi keamanan manusia terlebih dahulu.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 2. Verifikasi email Super Admin
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'Email atau kata sandi salah',
      };
    }

    // 3. Verifikasi kata sandi (cocokkan dengan password aktif di localStorage atau password resmi default)
    const activePassword = this.getActivePassword();
    const isPasswordMatch = cleanPass === activePassword || cleanPass === OFFICIAL_ADMIN_PASSWORD;

    if (!isPasswordMatch) {
      return {
        success: false,
        message: 'Email atau kata sandi salah',
      };
    }

    // 4. Login Sukses: Buat sesi dan simpan di sessionStorage & localStorage
    this.resetRateLimit();

    const sessionData: AdminSessionData = {
      loggedIn: true,
      email: AUTHORIZED_ADMIN_EMAIL,
      name: OFFICIAL_ADMIN_NAME,
      role: 'SUPER_ADMIN',
      token: `ak-superadmin-token-${Date.now()}`,
      loginTime: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch {
      // Ignore storage error
    }

    return {
      success: true,
      message: 'Autentikasi Super Admin berhasil. Selamat datang di Command Center ARTAKARYA.',
      admin: sessionData,
    };
  }

  /**
   * LUPA PASSWORD (100% Client-Side / Tanpa fetch API server)
   * Verifikasi langsung kode pemulihan dengan ARTAKARYA-RECOVER-2026
   */
  public async forgotPassword(
    email: string,
    recoveryCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = recoveryCode.trim();

    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'Email tidak terdaftar sebagai Super Admin ARTAKARYA.',
      };
    }

    if (cleanCode !== RECOVERY_SECURITY_CODE) {
      return {
        success: false,
        message: 'Kode keamanan pemulihan tidak valid. Masukkan kode pemulihan resmi ARTAKARYA.',
      };
    }

    if (newPassword.trim().length < 8) {
      return {
        success: false,
        message: 'Kata sandi baru minimal harus 8 karakter.',
      };
    }

    // Simpan kata sandi baru ke localStorage
    this.setActivePassword(newPassword.trim());
    this.resetRateLimit();

    return {
      success: true,
      message: 'Kata sandi Super Admin berhasil diatur ulang. Silakan login menggunakan kata sandi baru Anda.',
    };
  }

  /**
   * UBAH KATA SANDI (100% Client-Side dari dalam Dashboard Admin)
   */
  public async changePassword(
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    const activePassword = this.getActivePassword();
    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (cleanCurrent !== activePassword && cleanCurrent !== OFFICIAL_ADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Kata sandi saat ini tidak sesuai.',
      };
    }

    if (cleanNew.length < 8) {
      return {
        success: false,
        message: 'Kata sandi baru minimal harus 8 karakter.',
      };
    }

    this.setActivePassword(cleanNew);

    return {
      success: true,
      message: 'Kata sandi Super Admin berhasil diperbarui.',
    };
  }

  /**
   * LOGOUT (100% Client-Side)
   */
  public logout() {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }
}

export const authService = new AuthService();
