export function formatIQD(amount, lang = 'en') {
  const n = Number(amount || 0);
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-IQ' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(n);
  const suffix = lang === 'ar' ? 'د.ع' : 'IQD';
  return `${formatted} ${suffix}`;
}

export function formatDate(iso, lang = 'en') {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(iso, lang = 'en') {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(lang === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function addMonths(isoDate, months) {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  const day = d.getDate();
  d.setMonth(d.getMonth() + Number(months || 0));
  // Handle month length overflow
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d.toISOString().slice(0, 10);
}

export function daysBetween(isoA, isoB) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
