/**
 * ARTAKARYA Asia/Jakarta (WIB) Date Utility
 * Formats dates consistently according to Indonesian convention with Asia/Jakarta timezone.
 */

export function formatJakartaDate(dateInput: string | Date | number): string {
  if (!dateInput) return '';

  let date: Date;
  if (typeof dateInput === 'string') {
    // If string is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return formatter.format(date);
}

export function formatJakartaDateTime(dateInput: string | Date | number = new Date()): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date) + ' WIB';
}
