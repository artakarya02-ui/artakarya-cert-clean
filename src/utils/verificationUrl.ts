/**
 * ARTAKARYA EDU CERTIFICATE SYSTEM
 * Centralized Production-Ready Certificate Verification URL Generator
 *
 * Rules:
 * - Emits permanent official verification URL (https://artakarya.id/?cert=...)
 * - Supports VITE_VERIFY_DOMAIN from environment variables for Hostinger deployment
 * - Automatically falls back to live custom production domain if accessed from a real website
 * - NEVER embeds temporary development URLs (e.g. Google AI Studio *.run.app) into generated QR codes
 */

export function getOfficialVerificationUrl(certificateNumber: string, fallbackDomain?: string): string {
  const cleanNumber = (certificateNumber || '').trim().toUpperCase();

  // 1. Environment Variable Override (for Hostinger production deployment)
  const envDomain = typeof import.meta !== 'undefined' && import.meta.env?.VITE_VERIFY_DOMAIN;
  if (envDomain && typeof envDomain === 'string' && envDomain.trim()) {
    const base = envDomain.trim().replace(/\/$/, '');
    return `${base}/?cert=${encodeURIComponent(cleanNumber)}`;
  }

  // 2. Browser context: Use real production custom domain (if not localhost or temporary cloud run)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const isDevelopmentHost =
      host.includes('run.app') ||
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.includes('aistudio') ||
      host.includes('webcontainer') ||
      host.includes('google');

    if (!isDevelopmentHost && window.location.origin) {
      return `${window.location.origin}/?cert=${encodeURIComponent(cleanNumber)}`;
    }
  }

  // 3. Official Organization Domain Fallback
  const defaultDomain = (fallbackDomain || 'https://artakarya.id').replace(/\/$/, '');
  return `${defaultDomain}/?cert=${encodeURIComponent(cleanNumber)}`;
}
