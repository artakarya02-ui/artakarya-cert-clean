/**
 * ARTAKARYA CERTIFICATE SYSTEM
 * Persistent IndexedDB Storage for Custom Certificate Templates & High-Res Background Images
 */

import { CertificateTemplate, CustomTemplateElementsConfig } from '../types';

const DB_NAME = 'ArtakaryaCertificateDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_templates';

export const DEFAULT_CUSTOM_ELEMENTS_CONFIG: CustomTemplateElementsConfig = {
  certificateTitle: {
    xPercent: 50,
    yPercent: 24,
    fontSizePt: 22,
    fontFamily: 'Plus Jakarta Sans',
    color: '#050B2E',
    align: 'center',
    isBold: true,
    show: true,
    customText: 'SERTIFIKAT PENGHARGAAN',
  },
  recipientName: {
    xPercent: 50,
    yPercent: 44,
    fontSizePt: 28,
    fontFamily: 'Plus Jakarta Sans',
    color: '#050B2E',
    align: 'center',
    isBold: true,
    show: true,
  },
  eventTitle: {
    xPercent: 50,
    yPercent: 62,
    fontSizePt: 17,
    fontFamily: 'Plus Jakarta Sans',
    color: '#087BFF',
    align: 'center',
    isBold: true,
    show: true,
  },
  certificateNumber: {
    xPercent: 50,
    yPercent: 30,
    fontSizePt: 10,
    fontFamily: 'Space Grotesk',
    color: '#64748B',
    align: 'center',
    show: true,
  },
  issueDate: {
    xPercent: 50,
    yPercent: 82,
    fontSizePt: 10,
    fontFamily: 'Space Grotesk',
    color: '#64748B',
    align: 'center',
    show: true,
  },
  qrCode: {
    xPercent: 88,
    yPercent: 86,
    sizePercent: 12,
    show: true,
  },
  signatures: {
    xPercent: 50,
    yPercent: 88,
    show: true,
  },
  logo: {
    xPercent: 50,
    yPercent: 14,
    sizePercent: 10,
    show: false,
  },
};

class TemplateStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public async saveTemplate(template: CertificateTemplate): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(template);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB, fallback to memory/localStorage:', err);
      // Fallback: If IndexedDB fails, store in localStorage if small enough
      try {
        const key = `ak_tpl_${template.id}`;
        localStorage.setItem(key, JSON.stringify(template));
      } catch (e) {
        console.error('LocalStorage quota exceeded for template image:', e);
      }
    }
  }

  public async getAllCustomTemplates(): Promise<CertificateTemplate[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to read from IndexedDB, checking localStorage fallbacks:', err);
      const list: CertificateTemplate[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ak_tpl_')) {
            const raw = localStorage.getItem(key);
            if (raw) list.push(JSON.parse(raw));
          }
        }
      } catch (e) {
        console.error('Error reading localStorage templates:', e);
      }
      return list;
    }
  }

  public async getTemplateById(id: string): Promise<CertificateTemplate | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      try {
        const raw = localStorage.getItem(`ak_tpl_${id}`);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  }

  public async deleteTemplate(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Error deleting from IndexedDB:', err);
    }
    try {
      localStorage.removeItem(`ak_tpl_${id}`);
    } catch {}
  }
}

export const templateStorage = new TemplateStorageManager();
