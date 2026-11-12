/**
 * ARTAKARYA CERTIFICATE SYSTEM
 * Data types & definitions
 */

export type AttendanceStatus = 'HADIR' | 'TIDAK_HADIR' | 'MENUNGGU_VALIDASI';
export type CertificateStatus = 'AKTIF' | 'DICABUT' | 'KADALUARSA';
export type EventStatus = 'DRAFT' | 'BERLANGSUNG' | 'SELESAI' | 'ARSIP';

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  organizer: string;
  date: string;
  formattedDate: string;
  time?: string;
  location: string;
  category: 'Masterclass' | 'Workshop' | 'Seminar' | 'Executive Program';
  instructor: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  status: EventStatus;
  certificatePrefix: string;
  templateId: string;
  participantCount: number;
  issuedCount: number;
  isDemo?: boolean;
}

export interface ParticipantItem {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  organization: string;
  jobTitle?: string;
  role: 'Peserta' | 'Pembicara' | 'VIP' | 'Moderator' | 'Panitia';
  registrationDate: string;
  attendanceStatus: AttendanceStatus;
  validatedAt?: string;
  validatedBy?: string;
  certificateIssued: boolean;
  certificateId?: string;
  certificateNumber?: string;
  isDemo?: boolean;
}

export interface CertificateItem {
  id: string;
  certificateNumber: string; // e.g. AK-20261102-AICEO-001
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantOrg?: string;
  participantRole: string;
  eventId: string;
  eventTitle: string;
  eventSubtitle: string;
  eventDate: string;
  organizer: string;
  issueDate: string;
  expiryDate?: string;
  templateId: string;
  orientation?: 'landscape' | 'portrait';
  verificationHash: string; // SHA-256 simulation
  verificationUrl: string;
  status: CertificateStatus;
  revokeReason?: string;
  downloadCount: number;
  lastDownloadedAt?: string;
  signer1: {
    name: string;
    title: string;
    signatureUrl?: string;
  };
  signer2: {
    name: string;
    title: string;
    signatureUrl?: string;
  };
  isDemo?: boolean;
}

export interface TemplateElementStyle {
  xPercent: number; // 0 to 100% of certificate width
  yPercent: number; // 0 to 100% of certificate height
  fontSizePt: number;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Space Grotesk' | 'Times' | 'Courier';
  color: string;
  align: 'center' | 'left' | 'right';
  isBold?: boolean;
  show?: boolean;
  customText?: string;
}

export interface CustomTemplateElementsConfig {
  recipientName: TemplateElementStyle;
  eventTitle: TemplateElementStyle;
  certificateTitle: TemplateElementStyle;
  certificateNumber: TemplateElementStyle;
  issueDate: TemplateElementStyle;
  organizerText?: TemplateElementStyle;
  qrCode: {
    xPercent: number;
    yPercent: number;
    sizePercent: number;
    show: boolean;
  };
  signatures?: {
    xPercent: number;
    yPercent: number;
    show: boolean;
    signer1Name?: string;
    signer1Title?: string;
    signer2Name?: string;
    signer2Title?: string;
  };
  logo?: {
    xPercent: number;
    yPercent: number;
    sizePercent: number;
    show: boolean;
  };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  theme: 'gold_royal' | 'navy_modern' | 'ivory_classic' | 'custom_uploaded';
  borderStyle: 'ornate_double' | 'minimal_gold' | 'modern_geometric' | 'custom_image';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeLabel: string;
  description: string;
  isDefault: boolean;
  orientation?: 'landscape' | 'portrait';
  isCustom?: boolean;
  backgroundImageUrl?: string; // High-res image data URL or storage URL
  imageFileName?: string;
  imageFormat?: 'png' | 'jpg' | 'jpeg' | 'webp';
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: number;
  elementsConfig?: CustomTemplateElementsConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettings {
  brandName: string; // "ARTAKARYA"
  organizationName: string; // "ARTAKARYA Creative Intelligence Lab"
  productName: string; // "ARTAKARYA EDU CERTIFICATE SYSTEM"
  tagline: string; // "Digital Certification & Verification Platform"
  profileDescription: string; // "Platform pengembangan teknologi kreatif, kecerdasan buatan, edukasi digital, dan solusi inovasi."
  logoUrl?: string;
  address: string; // "Jl. A.H. Nasution No. 86, Bandung"
  contactEmail: string; // "artakarya01@gmail.com"
  contactPhone: string; // "087821008929"
  whatsappNumber: string; // "087821008929"
  whatsappUrl: string; // "https://wa.me/6287821008929"
  instagramHandle: string; // "@artakarya.co"
  instagramUrl: string; // "https://www.instagram.com/artakarya.co/"
  youtubeUrl?: string; // Optional (hidden when empty)
  tiktokUrl?: string; // Optional (hidden when empty)
  website: string; // "https://artakarya.id"
  serialPrefix: string;
  defaultSigner1: {
    name: string;
    title: string;
  };
  defaultSigner2: {
    name: string;
    title: string;
  };
  allowPublicSearch: boolean;
  requireAttendanceForIssue: boolean;
  isDemoMode: boolean;
}

export interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalCertificatesIssued: number;
  pendingValidation: number;
  activeEvents: number;
  totalDownloaded: number;
}
