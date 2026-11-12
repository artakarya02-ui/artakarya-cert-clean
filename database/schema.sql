-- ==============================================================
-- ARTAKARYA EDU CERTIFICATE SYSTEM - PRODUCTION DATABASE SCHEMA
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- Hostinger Compatibility: cPanel / hPanel phpMyAdmin / MySQL CLI
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `artakarya_certificate_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `artakarya_certificate_db`;

-- 1. Table: system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_name` VARCHAR(100) NOT NULL DEFAULT 'ARTAKARYA',
  `organization_name` VARCHAR(255) NOT NULL DEFAULT 'ARTAKARYA Creative Intelligence Lab',
  `product_name` VARCHAR(255) NOT NULL DEFAULT 'ARTAKARYA EDU CERTIFICATE SYSTEM',
  `tagline` VARCHAR(255) NOT NULL DEFAULT 'Digital Certification & Verification Platform',
  `profile_description` TEXT,
  `logo_url` LONGTEXT,
  `address` VARCHAR(255) NOT NULL DEFAULT 'Jl. A.H. Nasution No. 86, Bandung',
  `contact_email` VARCHAR(150) NOT NULL DEFAULT 'artakarya01@gmail.com',
  `contact_phone` VARCHAR(50) NOT NULL DEFAULT '087821008929',
  `whatsapp_number` VARCHAR(50) NOT NULL DEFAULT '087821008929',
  `whatsapp_url` VARCHAR(255) NOT NULL DEFAULT 'https://wa.me/6287821008929',
  `instagram_handle` VARCHAR(100) NOT NULL DEFAULT '@artakarya.co',
  `instagram_url` VARCHAR(255) NOT NULL DEFAULT 'https://www.instagram.com/artakarya.co/',
  `youtube_url` VARCHAR(255) DEFAULT '',
  `tiktok_url` VARCHAR(255) DEFAULT '',
  `website` VARCHAR(255) NOT NULL DEFAULT 'https://artakarya.id',
  `serial_prefix` VARCHAR(20) NOT NULL DEFAULT 'AK',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: admin_users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: events (Kegiatan / Program Edukasi)
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `organizer` VARCHAR(150) NOT NULL DEFAULT 'ARTAKARYA Creative Intelligence Lab',
  `date` DATE NOT NULL,
  `formatted_date` VARCHAR(100) NOT NULL,
  `time` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `category` ENUM('Masterclass', 'Workshop', 'Seminar', 'Executive Program') NOT NULL DEFAULT 'Masterclass',
  `instructor_name` VARCHAR(150) NOT NULL,
  `instructor_title` VARCHAR(255) NOT NULL,
  `status` ENUM('DRAFT', 'BERLANGSUNG', 'SELESAI', 'ARSIP') NOT NULL DEFAULT 'BERLANGSUNG',
  `certificate_prefix` VARCHAR(50) NOT NULL DEFAULT 'AK',
  `template_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_event_date` (`date`),
  INDEX `idx_event_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: participants (Data Peserta Kegiatan)
CREATE TABLE IF NOT EXISTS `participants` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `event_id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `organization` VARCHAR(255) DEFAULT '', -- Instansi opsional (tidak otomatis 'Umum')
  `job_title` VARCHAR(150) DEFAULT 'Peserta',
  `role` ENUM('Peserta', 'Pembicara', 'VIP', 'Moderator', 'Panitia') NOT NULL DEFAULT 'Peserta',
  `registration_date` DATE NOT NULL,
  `attendance_status` ENUM('HADIR', 'TIDAK_HADIR', 'MENUNGGU_VALIDASI') NOT NULL DEFAULT 'MENUNGGU_VALIDASI',
  `validated_at` DATETIME DEFAULT NULL,
  `validated_by` VARCHAR(100) DEFAULT NULL,
  `certificate_issued` TINYINT(1) NOT NULL DEFAULT 0,
  `certificate_id` VARCHAR(64) DEFAULT NULL,
  `certificate_number` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  INDEX `idx_participant_email` (`email`),
  INDEX `idx_participant_event` (`event_id`),
  INDEX `idx_participant_attendance` (`attendance_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: certificate_templates (Manajemen Template Desain Kustom)
CREATE TABLE IF NOT EXISTS `certificate_templates` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `theme` VARCHAR(50) NOT NULL DEFAULT 'custom_uploaded',
  `border_style` VARCHAR(50) NOT NULL DEFAULT 'custom_image',
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#050B2E',
  `secondary_color` VARCHAR(20) NOT NULL DEFAULT '#087BFF',
  `accent_color` VARCHAR(20) NOT NULL DEFAULT '#00E5FF',
  `badge_label` VARCHAR(100) DEFAULT 'OFFICIAL DIGITAL CERTIFICATE',
  `description` TEXT,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `orientation` ENUM('landscape', 'portrait') NOT NULL DEFAULT 'landscape',
  `is_custom` TINYINT(1) NOT NULL DEFAULT 1,
  `background_image_url` LONGTEXT NOT NULL,
  `image_file_name` VARCHAR(255) DEFAULT NULL,
  `image_format` VARCHAR(10) DEFAULT 'png',
  `elements_config` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_template_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table: certificates (Data Kredensial & Validasi Kriptografis)
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `certificate_number` VARCHAR(100) NOT NULL UNIQUE,
  `participant_id` VARCHAR(64) NOT NULL,
  `participant_name` VARCHAR(255) NOT NULL,
  `participant_email` VARCHAR(150) NOT NULL,
  `participant_org` VARCHAR(255) DEFAULT '',
  `participant_role` VARCHAR(150) NOT NULL,
  `event_id` VARCHAR(64) NOT NULL,
  `event_title` VARCHAR(255) NOT NULL,
  `event_subtitle` VARCHAR(255) DEFAULT NULL,
  `event_date` VARCHAR(100) NOT NULL,
  `organizer` VARCHAR(150) NOT NULL DEFAULT 'ARTAKARYA Creative Intelligence Lab',
  `issue_date` VARCHAR(100) NOT NULL,
  `template_id` VARCHAR(64) NOT NULL,
  `orientation` ENUM('landscape', 'portrait') NOT NULL DEFAULT 'landscape',
  `verification_hash` VARCHAR(64) NOT NULL, -- SHA-256 Digest
  `verification_url` VARCHAR(255) NOT NULL, -- Permanent Domain Verification Target
  `status` ENUM('AKTIF', 'DICABUT', 'MENUNGGU') NOT NULL DEFAULT 'AKTIF',
  `revoke_reason` TEXT DEFAULT NULL,
  `download_count` INT NOT NULL DEFAULT 0,
  `last_downloaded_at` VARCHAR(50) DEFAULT NULL,
  `signer1_name` VARCHAR(150) NOT NULL,
  `signer1_title` VARCHAR(255) NOT NULL,
  `signer2_name` VARCHAR(150) NOT NULL,
  `signer2_title` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cert_number` (`certificate_number`),
  INDEX `idx_cert_hash` (`verification_hash`),
  INDEX `idx_cert_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
