/**
 * Centralized Backend Date & Time Utilities
 * Canonical Timezone: Asia/Kolkata (IST)
 */

export const SCHOOL_TIMEZONE = 'Asia/Kolkata';

export function getSchoolTimezone(): string {
  return process.env.SCHOOL_TIMEZONE || SCHOOL_TIMEZONE;
}

export function formatInSchoolTimezone(
  dateInput: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = 'en-IN'
): string {
  if (!dateInput) return '';

  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    date = new Date(year, month - 1, day, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return '';

  const timeZone = getSchoolTimezone();
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    ...options,
  }).format(date);
}

export function getCurrentAcademicYear(dateInput?: Date | string | number | null): string {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) date = new Date();

  const monthStr = formatInSchoolTimezone(date, { month: 'numeric' });
  const yearStr = formatInSchoolTimezone(date, { year: 'numeric' });

  const month = parseInt(monthStr, 10) || (date.getMonth() + 1);
  const year = parseInt(yearStr, 10) || date.getFullYear();

  // June 1 to May 31 session
  if (month >= 6) {
    return `${year}–${year + 1}`;
  } else {
    return `${year - 1}–${year}`;
  }
}

export function getCurrentAcademicYearFormatted(dateInput?: Date | string | number | null): string {
  return `AY ${getCurrentAcademicYear(dateInput)}`;
}

export function getCurrentTerm(dateInput?: Date | string | number | null): { termId: string; termName: string } {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) date = new Date();

  const monthStr = formatInSchoolTimezone(date, { month: 'numeric' });
  const month = parseInt(monthStr, 10) || (date.getMonth() + 1);

  if (month >= 6 && month <= 8) {
    return { termId: 'TERM-1', termName: 'Term 1' };
  } else if (month >= 9 && month <= 12) {
    return { termId: 'TERM-2', termName: 'Term 2' };
  } else {
    return { termId: 'TERM-3', termName: 'Term 3' };
  }
}

export function formatMediumDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  return formatInSchoolTimezone(dateInput, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  return formatInSchoolTimezone(dateInput, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const datePart = formatMediumDate(dateInput);
  const timePart = formatInSchoolTimezone(dateInput, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

export function toSchoolISODate(dateInput?: Date | string | number | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

  const timeZone = getSchoolTimezone();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}
