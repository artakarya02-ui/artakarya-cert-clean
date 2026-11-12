/**
 * ARTAKARYA CERTIFICATE SYSTEM
 * Backend Architecture & MySQL Schema Definition for Phase 2 Integration
 * 
 * Note: Database is NOT connected in Phase 1 (Frontend Target).
 * This file specifies the exact SQL tables, Express API endpoints,
 * and environment contracts for the upcoming Node.js/MySQL deployment.
 */

export const MYSQL_SCHEMA_SQL = `-- ==============================================================
-- ARTAKARYA CERTIFICATE SYSTEM - PRODUCTION MYSQL SCHEMA (v1.0)
-- Database Engine: MySQL 8.0+ / InnoDB
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==============================================================

CREATE DATABASE IF NOT EXISTS \`artakarya_certificate_db\` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`artakarya_certificate_db\`;

-- 1. Table: events (Kegiatan ARTAKARYA)
CREATE TABLE IF NOT EXISTS \`events\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`subtitle\` VARCHAR(255) DEFAULT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`organizer\` VARCHAR(150) NOT NULL DEFAULT 'ARTAKARYA',
  \`date\` DATE NOT NULL,
  \`time\` VARCHAR(100) DEFAULT NULL,
  \`location\` VARCHAR(255) DEFAULT NULL,
  \`category\` ENUM('Masterclass', 'Workshop', 'Seminar', 'Executive Program') NOT NULL DEFAULT 'Masterclass',
  \`instructor_name\` VARCHAR(150) NOT NULL,
  \`instructor_title\` VARCHAR(255) NOT NULL,
  \`status\` ENUM('DRAFT', 'BERLANGSUNG', 'SELESAI', 'ARSIP') NOT NULL DEFAULT 'BERLANGSUNG',
  \`certificate_prefix\` VARCHAR(50) NOT NULL,
  \`template_id\` VARCHAR(64) NOT NULL DEFAULT 'tpl-gold-royal',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_event_date\` (\`date\`),
  INDEX \`idx_event_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: participants (Data Peserta Kegiatan)
CREATE TABLE IF NOT EXISTS \`participants\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`event_id\` VARCHAR(64) NOT NULL,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`organization\` VARCHAR(255) DEFAULT NULL,
  \`job_title\` VARCHAR(150) DEFAULT NULL,
  \`role\` ENUM('Peserta', 'Pembicara', 'VIP', 'Moderator', 'Panitia') NOT NULL DEFAULT 'Peserta',
  \`registration_date\` DATE NOT NULL,
  \`attendance_status\` ENUM('HADIR', 'TIDAK_HADIR', 'MENUNGGU_VALIDASI') NOT NULL DEFAULT 'MENUNGGU_VALIDASI',
  \`validated_at\` DATETIME DEFAULT NULL,
  \`validated_by\` VARCHAR(100) DEFAULT NULL,
  \`certificate_issued\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_participant_email\` (\`email\`),
  INDEX \`idx_participant_event\` (\`event_id\`),
  INDEX \`idx_participant_attendance\` (\`attendance_status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: certificates (Penerbitan Sertifikat Digital)
CREATE TABLE IF NOT EXISTS \`certificates\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`certificate_number\` VARCHAR(100) NOT NULL UNIQUE,
  \`participant_id\` VARCHAR(64) NOT NULL,
  \`event_id\` VARCHAR(64) NOT NULL,
  \`participant_name\` VARCHAR(255) NOT NULL,
  \`participant_email\` VARCHAR(150) NOT NULL,
  \`participant_org\` VARCHAR(255) DEFAULT NULL,
  \`participant_role\` VARCHAR(150) NOT NULL,
  \`event_title\` VARCHAR(255) NOT NULL,
  \`event_subtitle\` VARCHAR(255) DEFAULT NULL,
  \`event_date\` VARCHAR(100) NOT NULL,
  \`organizer\` VARCHAR(150) NOT NULL DEFAULT 'ARTAKARYA',
  \`issue_date\` DATE NOT NULL,
  \`template_id\` VARCHAR(64) NOT NULL DEFAULT 'tpl-gold-royal',
  \`verification_hash\` VARCHAR(128) NOT NULL,
  \`status\` ENUM('AKTIF', 'DICABUT', 'KADALUARSA') NOT NULL DEFAULT 'AKTIF',
  \`revoke_reason\` TEXT DEFAULT NULL,
  \`download_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`last_downloaded_at\` DATETIME DEFAULT NULL,
  \`signer1_name\` VARCHAR(150) NOT NULL,
  \`signer1_title\` VARCHAR(255) NOT NULL,
  \`signer2_name\` VARCHAR(150) NOT NULL,
  \`signer2_title\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\`(\`id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON DELETE RESTRICT,
  INDEX \`idx_cert_number\` (\`certificate_number\`),
  INDEX \`idx_cert_status\` (\`status\`),
  INDEX \`idx_cert_hash\` (\`verification_hash\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: verification_logs (Audit Trail Pemindaian / Verifikasi)
CREATE TABLE IF NOT EXISTS \`verification_logs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`certificate_number\` VARCHAR(100) NOT NULL,
  \`ip_address\` VARCHAR(45) DEFAULT NULL,
  \`user_agent\` TEXT DEFAULT NULL,
  \`is_valid\` TINYINT(1) NOT NULL,
  \`verification_method\` ENUM('QR_SCAN', 'CODE_INPUT', 'API_QUERY') NOT NULL DEFAULT 'CODE_INPUT',
  \`verified_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_log_cert\` (\`certificate_number\`),
  INDEX \`idx_log_timestamp\` (\`verified_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: system_settings (Konfigurasi Platform)
CREATE TABLE IF NOT EXISTS \`system_settings\` (
  \`setting_key\` VARCHAR(100) NOT NULL PRIMARY KEY,
  \`setting_value\` JSON NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export const EXPRESS_BACKEND_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/health', desc: 'Health check dan status koneksi database MySQL' },
  { method: 'GET', path: '/api/v1/events', desc: 'Mendapatkan daftar semua kegiatan aktif dan arsip' },
  { method: 'POST', path: '/api/v1/events', desc: 'Menambahkan kegiatan baru ARTAKARYA' },
  { method: 'GET', path: '/api/v1/events/:id/participants', desc: 'Mendapatkan data peserta berdasarkan ID kegiatan' },
  { method: 'POST', path: '/api/v1/participants/import', desc: 'Import batch peserta kegiatan dari CSV / JSON' },
  { method: 'PUT', path: '/api/v1/attendance/:id', desc: 'Validasi status kehadiran peserta (Hadir / Menunggu)' },
  { method: 'POST', path: '/api/v1/attendance/batch-validate', desc: 'Validasi massal kehadiran peserta kegiatan' },
  { method: 'POST', path: '/api/v1/certificates/issue', desc: 'Menerbitkan sertifikat tunggal peserta tervalidasi' },
  { method: 'POST', path: '/api/v1/certificates/batch-issue', desc: 'Menerbitkan sertifikat massal berdasarkan ID kegiatan' },
  { method: 'GET', path: '/api/v1/certificates/search', desc: 'Pencarian sertifikat publik berdasarkan nomor/nama/email' },
  { method: 'GET', path: '/api/v1/certificates/verify/:number', desc: 'Verifikasi otentikasi keabsahan sertifikat dan hash kriptografis' },
  { method: 'POST', path: '/api/v1/certificates/:id/revoke', desc: 'Mencabut / menonaktifkan sertifikat dengan alasan resmi' },
  { method: 'POST', path: '/api/v1/certificates/:id/track-download', desc: 'Mencatat riwayat pengunduhan sertifikat PDF/PNG' },
];

export const BACKEND_ARCHITECTURE_INFO = {
  framework: 'Node.js (v20+) with Express 4.x',
  database: 'MySQL 8.0+ (InnoDB Engine, utf8mb4)',
  ormOrDriver: 'mysql2 / pool connection with prepared statements',
  authentication: 'JWT (JSON Web Token) for Admin Dashboard, Public routes for Verification & Search',
  hashAlgorithm: 'SHA-256 HMAC for Certificate Integrity Signature',
  phaseStatus: 'FASE 1: Frontend UI/UX, Local Engine, Ready for API Attachment',
};
