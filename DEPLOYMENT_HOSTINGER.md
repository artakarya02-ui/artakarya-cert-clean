# PANDUAN DEPLOYMENT ARTAKARYA EDU CERTIFICATE SYSTEM KE HOSTINGER

Dokumen ini memandu proses pemindahan dan deployment aplikasi **ARTAKARYA EDU CERTIFICATE SYSTEM** ke platform hosting **Hostinger** (Hostinger VPS atau Hostinger Cloud/Business Web Hosting with Node.js).

---

## 1. SPESIFIKASI TEKNIS & KEBUTUHAN SISTEM

* **Runtime:** Node.js versi 20.x atau 22.x LTS
* **Database:** MySQL 8.0+ / MariaDB 10.5+ (atau mode File JSON Storage default yang sudah aktif)
* **Web Server:** Nginx / Apache Reverse Proxy ke port Node.js (Port `3000`)
* **Arsitektur:** Full-Stack Express.js + React SPA (Vite)
* **Kemandirian AI:** Aplikasi ini berjalan 100% mandiri tanpa ketergantungan pada Gemini API atau kredit AI eksternal.

---

## 2. METODE DEPLOYMENT A: HOSTINGER CLOUD / WEB HOSTING (NODE.JS APP MANAGER)

Jika Anda menggunakan paket **Hostinger Business Web Hosting** atau **Hostinger Cloud Hosting**:

### Langkah 1: Ekstraksi Berkas
1. Masuk ke panel kontrol Hostinger (**hPanel**).
2. Buka menu **File Manager** pada domain yang dituju (misal: `sertifikat.artakarya.id`).
3. Unggah file `ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip` ke folder aplikasi Anda (biasanya `public_html` atau subfolder aplikasi Node.js).
4. Ekstrak seluruh isi file ZIP.

### Langkah 2: Konfigurasi Node.js Application di hPanel
1. Buka menu **Node.js** di hPanel.
2. Klik **Create Application**:
   * **Node.js version:** Pilih `22.x` atau `20.x`.
   * **Application root:** `public_html` (atau lokasi folder ekstraksi).
   * **Application startup file:** `dist/server.js` (atau jalankan dengan `npm start`).
3. Klik **Create**.

### Langkah 3: Pengaturan Environment Variables
1. Di tab **Environment Variables**, tambahkan:
   * `NODE_ENV` = `production`
   * `PORT` = `3000`
   * `VITE_VERIFY_DOMAIN` = `https://sertifikat.artakarya.id` (Ganti dengan domain resmi Anda)
   * `APP_URL` = `https://sertifikat.artakarya.id`
   * `ADMIN_SESSION_SECRET` = `KunciRahasiaKeamananSesiAnda2026!`

### Langkah 4: Install Dependencies & Build
1. Buka tab **NPM / Terminal** di hPanel atau jalankan melalui SSH:
   ```bash
   npm install --production=false
   npm run build
   ```
2. Klik tombol **Restart Application** di hPanel.

---

## 3. METODE DEPLOYMENT B: HOSTINGER VPS (UBUNTU 22.04 / 24.04 LTS)

Metode ini paling direkomendasikan untuk stabilitas maksimal dengan PM2 dan Nginx.

### Langkah 1: Persiapan Server VPS
1. Hubungkan ke VPS via SSH:
   ```bash
   ssh root@ip-vps-anda
   ```
2. Pastikan Node.js 22 terpasang:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   sudo npm install -g pm2
   ```

### Langkah 2: Deploy Source Code
1. Clone repositori GitHub Anda atau ekstrak file ZIP:
   ```bash
   mkdir -p /var/www/artakarya-certificate
   cd /var/www/artakarya-certificate
   # Unggah & unzip ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip di sini
   unzip ARTAKARYA-CERTIFICATE-SYSTEM-FINAL.zip
   ```
2. Buat file `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Sesuaikan `VITE_VERIFY_DOMAIN` dan `APP_URL` dengan domain resmi Anda.
3. Pasang dependensi dan build aplikasi:
   ```bash
   npm install
   npm run build
   ```

### Langkah 3: Menjalankan Aplikasi dengan PM2
```bash
pm2 start dist/server.js --name "artakarya-certificate"
pm2 save
pm2 startup
```

### Langkah 4: Konfigurasi Nginx Reverse Proxy
Buat file konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/sertifikat.artakarya.id
```

Isi konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name sertifikat.artakarya.id;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan pasang SSL gratis (Let's Encrypt):
```bash
sudo ln -s /etc/nginx/sites-available/sertifikat.artakarya.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sertifikat.artakarya.id
```

---

## 4. INTEGRASI DATABASE MYSQL (OPSIONAL)

Jika ingin memindahkan data penyimpanan ke MySQL Hostinger:
1. Buka menu **Databases** di hPanel Hostinger.
2. Buat database baru (misal: `artakarya_certificate_db`) dan buat user database.
3. Buka **phpMyAdmin**, pilih database tersebut, lalu klik tab **Import**.
4. Pilih file `database/schema.sql` dari paket aplikasi dan klik **Go / Kirim**.
5. Isi konfigurasi database pada file `.env` di server.

---

## 5. INFORMASI AKUN ADMINISTRATOR DEFAULT

* **SUPER_ADMIN:**
  * Email: `artakarya03@gmail.com`
  * Wewenang Khusus: Mengunggah, mengganti, dan menghapus Logo Resmi Lembaga, manajemen template sertifikat, dan otorisasi tingkat tinggi.
* **ADMIN:**
  * Email: `artakarya02@gmail.com`
  * Wewenang: Pengelolaan kegiatan, data peserta, validasi kehadiran, dan penerbitan sertifikat.
* **Kunci Keamanan Administrator:** `2026` atau `ARTAKARYA-ADMIN`

*Penting:* Segera perbarui kata sandi admin melalui menu "Ubah Kata Sandi" di dashboard setelah aplikasi aktif di domain resmi.
