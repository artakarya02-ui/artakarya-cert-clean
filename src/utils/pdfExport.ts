import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { CertificateItem } from '../types';
import { storage } from '../services/storage';
import { DEFAULT_CUSTOM_ELEMENTS_CONFIG } from '../services/templateStorage';
import { getOfficialVerificationUrl } from './verificationUrl';

function hexToRgb(hex: string): [number, number, number] {
  let c = (hex || '#050B2E').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return [5, 11, 46];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    return 'JPEG';
  }
  return 'PNG';
}

async function prepareLogoForPdf(logoUrl: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!logoUrl) return null;
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(null);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width || 200;
        const h = img.naturalHeight || img.height || 200;

        // If SVG or data URL, render to canvas to ensure crisp PNG embedding in jsPDF
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(w * 2, 400);
        canvas.height = Math.max(h * 2, 400);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
          return;
        }
        resolve({ dataUrl: logoUrl, width: w, height: h });
      } catch (err) {
        console.warn('Canvas conversion warning for PDF logo:', err);
        resolve({ dataUrl: logoUrl, width: 200, height: 200 });
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = logoUrl;
  });
}

export async function downloadCertificatePDF(cert: CertificateItem): Promise<void> {
  const settings = storage.getSettings();
  const logoInfo = settings.logoUrl ? await prepareLogoForPdf(settings.logoUrl) : null;
  const tpl = storage.getTemplateById(cert.templateId);
  const isPortrait = tpl?.orientation === 'portrait' || cert.orientation === 'portrait';

  // A4 Landscape: 297mm x 210mm
  // A4 Portrait: 210mm x 297mm
  const pageWidth = isPortrait ? 210 : 297;
  const pageHeight = isPortrait ? 297 : 210;

  const doc = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Generate High-Resolution Scannable QR Code Data URL (Protected against dev URLs)
  const verificationTargetUrl = getOfficialVerificationUrl(cert.certificateNumber, settings.website);

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verificationTargetUrl, {
      width: 512,
      margin: 1,
      color: {
        dark: '#050B2EFF',
        light: '#FFFFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.warn('QR Code generation for PDF fallback:', err);
  }

  // Check if certificate uses a template with uploaded background image
  if (tpl?.backgroundImageUrl) {
    const cfg = tpl.elementsConfig || DEFAULT_CUSTOM_ELEMENTS_CONFIG;

    try {
      doc.addImage(tpl.backgroundImageUrl, 'PNG', 0, 0, pageWidth, pageHeight);
    } catch (e) {
      console.warn('PDF addImage warning:', e);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // 1. Certificate Title
    if (cfg.certificateTitle?.show !== false) {
      const [r, g, b] = hexToRgb(cfg.certificateTitle.color);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', cfg.certificateTitle.isBold !== false ? 'bold' : 'normal');
      doc.setFontSize(cfg.certificateTitle.fontSizePt || 22);
      const x = (cfg.certificateTitle.xPercent / 100) * pageWidth;
      const y = (cfg.certificateTitle.yPercent / 100) * pageHeight;
      doc.text(cfg.certificateTitle.customText || 'SERTIFIKAT PENGHARGAAN', x, y, {
        align: cfg.certificateTitle.align || 'center',
      });
    }

    // 2. Recipient Name
    if (cfg.recipientName?.show !== false) {
      const [r, g, b] = hexToRgb(cfg.recipientName.color);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', cfg.recipientName.isBold !== false ? 'bold' : 'normal');
      doc.setFontSize(cfg.recipientName.fontSizePt || 28);
      const x = (cfg.recipientName.xPercent / 100) * pageWidth;
      const y = (cfg.recipientName.yPercent / 100) * pageHeight;
      doc.text(cert.participantName, x, y, { align: cfg.recipientName.align || 'center' });

      if (cert.participantOrg) {
        doc.setFontSize((cfg.recipientName.fontSizePt || 28) * 0.45);
        doc.setTextColor(8, 123, 255);
        doc.text(cert.participantOrg, x, y + 6, { align: cfg.recipientName.align || 'center' });
      }
    }

    // 3. Event Title
    if (cfg.eventTitle?.show !== false) {
      const [r, g, b] = hexToRgb(cfg.eventTitle.color);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', cfg.eventTitle.isBold !== false ? 'bold' : 'normal');
      doc.setFontSize(cfg.eventTitle.fontSizePt || 17);
      const x = (cfg.eventTitle.xPercent / 100) * pageWidth;
      const y = (cfg.eventTitle.yPercent / 100) * pageHeight;
      doc.text(cert.eventTitle, x, y, { align: cfg.eventTitle.align || 'center' });

      if (cert.eventSubtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize((cfg.eventTitle.fontSizePt || 17) * 0.65);
        doc.setTextColor(100, 116, 139);
        doc.text(`"${cert.eventSubtitle}"`, x, y + 5.5, { align: cfg.eventTitle.align || 'center' });
      }
    }

    // 4. Certificate Number
    if (cfg.certificateNumber?.show !== false) {
      const [r, g, b] = hexToRgb(cfg.certificateNumber.color);
      doc.setTextColor(r, g, b);
      doc.setFont('courier', 'bold');
      doc.setFontSize(cfg.certificateNumber.fontSizePt || 10);
      const x = (cfg.certificateNumber.xPercent / 100) * pageWidth;
      const y = (cfg.certificateNumber.yPercent / 100) * pageHeight;
      doc.text(`NO: ${cert.certificateNumber}`, x, y, { align: cfg.certificateNumber.align || 'center' });
    }

    // 5. Issue Date
    if (cfg.issueDate?.show !== false) {
      const [r, g, b] = hexToRgb(cfg.issueDate.color);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(cfg.issueDate.fontSizePt || 10);
      const x = (cfg.issueDate.xPercent / 100) * pageWidth;
      const y = (cfg.issueDate.yPercent / 100) * pageHeight;
      doc.text(cert.issueDate, x, y, { align: cfg.issueDate.align || 'center' });
    }

    // 6. Signatures (if enabled)
    if (cfg.signatures?.show !== false) {
      const y = ((cfg.signatures?.yPercent || 88) / 100) * pageHeight;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(5, 11, 46);
      doc.text(cfg.signatures?.signer1Name || cert.signer1.name, 55, y, { align: 'center' });
      doc.text(cfg.signatures?.signer2Name || cert.signer2.name, pageWidth - 55, y, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(cfg.signatures?.signer1Title || cert.signer1.title, 55, y + 4.5, { align: 'center' });
      doc.text(cfg.signatures?.signer2Title || cert.signer2.title, pageWidth - 55, y + 4.5, { align: 'center' });
    }

    // 7. High-Res Scannable QR Code (if enabled)
    if (cfg.qrCode?.show !== false && qrDataUrl) {
      const qrSizeMm = Math.max(16, ((cfg.qrCode.sizePercent || 12) / 100) * pageWidth);
      const qrX = (cfg.qrCode.xPercent / 100) * pageWidth - qrSizeMm / 2;
      const qrY = (cfg.qrCode.yPercent / 100) * pageHeight - qrSizeMm / 2;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(qrX - 1, qrY - 1, qrSizeMm + 2, qrSizeMm + 2, 1, 1, 'F');
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizeMm, qrSizeMm);
    }

    // 8. Official Brand Logo (if enabled and present)
    if (cfg.logo?.show !== false && logoInfo) {
      const aspect = logoInfo.width / logoInfo.height;
      const maxDimMm = Math.max(14, ((cfg.logo?.sizePercent || 14) / 100) * pageWidth);
      let logoW = maxDimMm;
      let logoH = maxDimMm / aspect;
      if (logoH > maxDimMm) {
        logoH = maxDimMm;
        logoW = maxDimMm * aspect;
      }
      const logoX = ((cfg.logo?.xPercent || 50) / 100) * pageWidth - logoW / 2;
      const logoY = ((cfg.logo?.yPercent || 15) / 100) * pageHeight - logoH / 2;
      doc.addImage(logoInfo.dataUrl, getImageFormat(logoInfo.dataUrl), logoX, logoY, logoW, logoH);
    }

    const safeFilename = `SERTIFIKAT-ARTAKARYA-${cert.certificateNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    doc.save(safeFilename);
    return;
  }

  // ====================================================================
  // DEFAULT A4 VECTOR PRESTIGE TEMPLATE (PORTRAIT OR LANDSCAPE)
  // ====================================================================
  doc.setFillColor(255, 253, 249); // #FFFDF9
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Modern Electric Blue Border
  doc.setDrawColor(8, 123, 255); // #087BFF
  doc.setLineWidth(0.8);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 2, 2, 'S');

  // Inner Thin Precision Border
  doc.setDrawColor(5, 11, 46); // #050B2E
  doc.setLineWidth(0.3);
  doc.roundedRect(13, 13, pageWidth - 26, pageHeight - 26, 1.5, 1.5, 'S');

  // Corner Accents (Electric Blue)
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    doc.setDrawColor(8, 123, 255);
    doc.setLineWidth(1.2);
    doc.line(x, y, x + dx * 10, y);
    doc.line(x, y, x, y + dy * 10);
  };
  drawCorner(13, 13, 1, 1);
  drawCorner(pageWidth - 13, 13, -1, 1);
  drawCorner(13, pageHeight - 13, 1, -1);
  drawCorner(pageWidth - 13, pageHeight - 13, -1, -1);

  // Dynamic Vertical Offsets for Portrait vs Landscape
  const topY = isPortrait ? 30 : 24;
  const titleY = isPortrait ? 60 : 46;
  const recipientY = isPortrait ? 105 : 80;
  const eventY = isPortrait ? 150 : 114;
  const sealY = isPortrait ? 205 : 153;
  const sigY = isPortrait ? 245 : 172;
  const footY = isPortrait ? 282 : 195;

  // ARTAKARYA Official Logo in Header (Embedded cleanly without distortion)
  if (logoInfo) {
    const aspect = logoInfo.width / logoInfo.height;
    const maxH = isPortrait ? 11 : 9;
    let logoH = maxH;
    let logoW = maxH * aspect;
    if (logoW > 28) {
      logoW = 28;
      logoH = 28 / aspect;
    }
    const logoX = (pageWidth / 2) - (logoW / 2);
    const logoY = topY - logoH - 1.5;
    doc.addImage(logoInfo.dataUrl, getImageFormat(logoInfo.dataUrl), logoX, logoY, logoW, logoH);
  }

  // ARTAKARYA Creative Intelligence Lab Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 11, 46);
  doc.text('ARTAKARYA', pageWidth / 2, topY, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(8, 123, 255);
  doc.text('CREATIVE INTELLIGENCE LAB', pageWidth / 2, topY + 5, { align: 'center' });

  // Certificate Serial Number
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`NO. SERI: ${cert.certificateNumber}`, pageWidth / 2, topY + 11, { align: 'center' });

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(5, 11, 46);
  doc.text('SERTIFIKAT PENGHARGAAN', pageWidth / 2, titleY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CERTIFICATE OF ACCOMPLISHMENT & PARTICIPATION', pageWidth / 2, titleY + 7, { align: 'center' });

  // Presented To
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Diberikan dengan hormat dan apresiasi tertinggi kepada:', pageWidth / 2, recipientY - 12, { align: 'center' });

  // Recipient Name (Prominent)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(5, 11, 46);
  doc.text(cert.participantName, pageWidth / 2, recipientY, { align: 'center' });

  // Organization
  if (cert.participantOrg) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(8, 123, 255);
    doc.text(cert.participantOrg, pageWidth / 2, recipientY + 7, { align: 'center' });
  }

  // Divider Line
  doc.setDrawColor(8, 123, 255);
  doc.setLineWidth(0.6);
  const divMargin = isPortrait ? 40 : 75;
  doc.line(divMargin, recipientY + 12, pageWidth - divMargin, recipientY + 12);

  // Description Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Atas partisipasi aktif, dedikasi, dan kelulusan penuh dalam program pelatihan:', pageWidth / 2, eventY - 12, { align: 'center' });

  // Event Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 27, 85);
  doc.text(cert.eventTitle, pageWidth / 2, eventY, { align: 'center' });

  if (cert.eventSubtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`"${cert.eventSubtitle}"`, pageWidth / 2, eventY + 7, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Diselenggarakan oleh ${cert.organizer} pada tanggal ${cert.eventDate}`, pageWidth / 2, eventY + 14, { align: 'center' });

  // Central Seal
  doc.setDrawColor(8, 123, 255);
  doc.setFillColor(16, 27, 85);
  doc.circle(pageWidth / 2, sealY, 13, 'FD');
  doc.setDrawColor(0, 229, 255);
  doc.circle(pageWidth / 2, sealY, 11.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('ARTAKARYA', pageWidth / 2, sealY - 2, { align: 'center' });
  doc.setFontSize(5);
  doc.setTextColor(0, 229, 255);
  doc.text('SEAL OF EXCELLENCE', pageWidth / 2, sealY + 2, { align: 'center' });
  doc.setTextColor(200, 220, 255);
  doc.text(cert.issueDate, pageWidth / 2, sealY + 6, { align: 'center' });

  // Signatures
  const sigLeftX = isPortrait ? 45 : 55;
  const sigRightX = isPortrait ? pageWidth - 45 : pageWidth - 55;

  // Left Signer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(5, 11, 46);
  doc.text(cert.signer1.name, sigLeftX, sigY, { align: 'center' });
  doc.setLineWidth(0.3);
  doc.setDrawColor(180, 195, 215);
  doc.line(sigLeftX - 25, sigY - 6, sigLeftX + 25, sigY - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(cert.signer1.title, sigLeftX, sigY + 5, { align: 'center' });

  // Right Signer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(5, 11, 46);
  doc.text(cert.signer2.name, sigRightX, sigY, { align: 'center' });
  doc.line(sigRightX - 25, sigY - 6, sigRightX + 25, sigY - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(cert.signer2.title, sigRightX, sigY + 5, { align: 'center' });

  // Scannable High-Res QR Code embedded in Vector Layout
  if (qrDataUrl) {
    const qrSize = 18;
    const qrX = pageWidth - 36;
    const qrY = footY - 14;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 0.5, 0.5, 'F');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  // Bottom Hash & Verification URL Bar
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`VERIFIKASI RESMI: ${verificationTargetUrl}`, 18, footY);
  doc.text(`HASH SHA-256: ${cert.verificationHash}`, 18, footY + 4);

  // Save PDF
  const safeFilename = `SERTIFIKAT-ARTAKARYA-${cert.certificateNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}

export function printCertificate(): void {
  window.print();
}
