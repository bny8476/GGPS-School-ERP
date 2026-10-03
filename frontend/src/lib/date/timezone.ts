/**
 * School Timezone Configuration & Safe Date Operations
 * Default: Asia/Kolkata (Indian Standard Time - IST)
 */

export const SCHOOL_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the currently active school timezone.
 */
export function getSchoolTimezone(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ggps_school_timezone");
    if (saved && typeof saved === "string") return saved;
  }
  return process.env.NEXT_PUBLIC_SCHOOL_TIMEZONE || SCHOOL_TIMEZONE;
}

/**
 * Gets current date and time evaluated in the school's configured timezone.
 */
export function getNowInSchoolTimezone(): Date {
  const now = new Date();
  return now;
}

/**
 * Formats a Date or timestamp string strictly within the school's timezone.
 */
export function formatInSchoolTimezone(
  dateInput: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-IN"
): string {
  if (!dateInput) return "";

  let date: Date;
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    // Avoid UTC midnight shift for date-only strings (e.g. "2026-10-03")
    const [year, month, day] = dateInput.split("-").map(Number);
    date = new Date(year, month - 1, day, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "";

  const timeZone = getSchoolTimezone();
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    ...options,
  }).format(date);
}

/**
 * Parses calendar dates ("YYYY-MM-DD" or ISO) safely as noon in local time
 * to prevent one-day shifting backwards or forwards across timezones.
 */
export function parseCalendarDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Returns a normalized ISO date string (YYYY-MM-DD) evaluated in the school timezone.
 */
export function toSchoolISODate(dateInput?: Date | string | number | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];

  const timeZone = getSchoolTimezone();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}
