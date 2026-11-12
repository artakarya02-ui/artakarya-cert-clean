# ARTAKARYA EDU CERTIFICATE SYSTEM
**Digital Certification & Verification Platform**  
*Organisasi Induk: ARTAKARYA Creative Intelligence Lab*

---

## Tentang Aplikasi
ARTAKARYA EDU CERTIFICATE SYSTEM adalah platform digital mandiri (*standalone enterprise-grade web application*) yang dirancang khusus untuk mengelola kegiatan, memvalidasi presensi peserta, menerbitkan sertifikat digital beresolusi tinggi (A4 Landscape & Portrait), serta memverifikasi keabsahan sertifikat secara instan menggunakan QR Code dan tanda tangan kriptografis SHA-256.

Aplikasi ini dibangun tanpa ketergantungan pada Gemini API atau kredit AI eksternal, sehingga siap dipasang langsung di server VPS, Cloud Hosting, atau shared Node.js environment seperti Hostinger.

---

## Fitur Utama

1. **Autentikasi & Otorisasi Administrator Terproteksi:**
   * Pembagian peran `SUPER_ADMIN` (`artakarya03@gmail.com`) dan `ADMIN` (`artakarya02@gmail.com`).
   * Password hashing SHA-256 ber-garam, proteksi brute-force login, dan session sliding expiration.
   * Kunci keamanan otorisasi tindakan sensitif.

2. **Manajemen Identitas & Upload Logo Resmi Lembaga:**
   * Pengaturan terpusat nama organisasi, nama brand, kontak resmi, alamat Bandung, WhatsApp, dan Instagram.
   * Slot upload logo resmi format PNG (transparan), SVG vektor, dan JPG dengan penyimpanan server permanen.
   * Integrasi logo otomatis ke Navbar, Halaman Verifikasi, Template Sertifikat, dan Berkas PDF.

3. **Manajemen Kegiatan & Data Peserta:**
   * Pengelolaan seminar, workshop, webinar, dan masterclass.
   * Sinkronisasi tanggal dan zona waktu Asia/Jakarta (WIB).
   * Validasi presensi peserta (HADIR, MENUNGGU VALIDASI, TIDAK HADIR).
   * Kolom "Masukkan Nama Peserta" dengan instansi bersifat opsional (tidak otomatis "Umum").

4. **Manajemen Template Sertifikat Kustom:**
   * Fitur unggah desain template sertifikat sendiri (PNG/JPG).
   * Galeri template, pratinjau ukuran besar, status template aktif/default, dan hapus template dengan konfirmasi.

5. **Sistem QR Code & Verifikasi Kriptografis Mandiri:**
   * Menghasilkan QR Code dinamis menggunakan pustaka `qrcode` standar industri (bukan AI).
   * QR Code terhubung langsung ke URL verifikasi pada domain resmi ARTAKARYA (`https://sertifikat.artakarya.id`).
   * Terproteksi dari URL pengembangan sementara (Google AI Studio URL tidak pernah ditanamkan pada sertifikat).
   * Validasi sidik jari hash SHA-256 100% cocok dengan basis data.
   * Status sertifikat: **VALID** atau **DIBATALKAN**.

6. **Generator & Ekspor PDF Vektor Siap Cetak:**
   * Menggunakan pustaka `jspdf` untuk ekspor dokumen resolusi tinggi format A4 standar cetak.
   * Menghasilkan barcode QR Code tajam, segel resmi ARTAKARYA, tanda tangan digital ganda, dan logo resmi terintegrasi.

---

## Panduan Instalasi Lokal & Development

1. **Kebutuhan Sistem:**
   * Node.js v20.x atau v22.x
   * npm v10+

2. **Langkah Instalasi:**
   ```bash
   # Clone repositori
   git clone <URL_REPOSITORI_ANDA>
   cd artakarya-certificate-system

   # Pasang dependensi
   npm install

   # Konfigurasi environment
   cp .env.example .env

   # Jalankan server development
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Build untuk Produksi:**
   ```bash
   npm run build
   npm start
   ```

---

## Panduan Deployment ke Hostinger
Silakan baca panduan lengkap pada berkas:
👉 **[DEPLOYMENT_HOSTINGER.md](./DEPLOYMENT_HOSTINGER.md)**

---

## Struktur Direktori
```text
├── database/
│   └── schema.sql              # Skema MySQL Production untuk phpMyAdmin Hostinger
├── src/
│   ├── components/             # Komponen UI React (Navbar, Footer, CertificateRenderer, Carousel)
│   ├── views/
│   │   ├── admin/              # Dashboard, Settings, Peserta, Kegiatan, Template, Riwayat
│   │   └── public/             # Landing Page, Cari Sertifikat, Verifikasi, Detail Dokumen, Kontak
│   ├── services/               # Storage Manager, Auth Service, Template Storage IndexedDB
│   ├── utils/                  # PDF Export Engine, QR Verification URL Helper, Date Formatter
│   └── types/                  # TypeScript Data Contracts
├── server.ts                   # Backend Full-Stack Server Express.js
├── DEPLOYMENT_HOSTINGER.md     # Panduan Lengkap Deployment Hostinger
├── .env.example                # Template Environment Variables
├── package.json                # Dependensi & Script Node.js
└── vite.config.ts              # Konfigurasi Vite SPA
```

---

## Hak Cipta
© 2026 **ARTAKARYA Creative Intelligence Lab**. All Rights Reserved.  
*Jl. A.H. Nasution No. 86, Bandung* • *Email: artakarya01@gmail.com* • *WhatsApp: 087821008929*
