import { formatInSchoolTimezone, toSchoolISODate, getSchoolTimezone } from "./timezone";

/**
 * Returns current date formatted as e.g. "03 October 2026".
 */
export function getCurrentDate(dateInput?: Date | string | number | null): string {
  return formatMediumDate(dateInput || new Date());
}

/**
 * Returns the current calendar day number (1-31).
 * Example: 3
 */
export function getCurrentDay(dateInput?: Date | string | number | null): number {
  const d = dateInput ? new Date(dateInput) : new Date();
  const dayStr = formatInSchoolTimezone(d, { day: "numeric" });
  return parseInt(dayStr, 10) || d.getDate();
}

/**
 * Returns current month number (1-12).
 * Example: 10 for October
 */
export function getCurrentMonth(dateInput?: Date | string | number | null): number {
  const d = dateInput ? new Date(dateInput) : new Date();
  const monthStr = formatInSchoolTimezone(d, { month: "numeric" });
  return parseInt(monthStr, 10) || (d.getMonth() + 1);
}

/**
 * Returns the localized month name.
 * Example: "October" or "Oct"
 */
export function getCurrentMonthName(
  dateInput?: Date | string | number | null,
  format: "long" | "short" = "long"
): string {
  return formatInSchoolTimezone(dateInput || new Date(), { month: format });
}

/**
 * Returns current 4-digit year.
 * Example: 2026
 */
export function getCurrentYear(dateInput?: Date | string | number | null): number {
  const d = dateInput ? new Date(dateInput) : new Date();
  const yearStr = formatInSchoolTimezone(d, { year: "numeric" });
  return parseInt(yearStr, 10) || d.getFullYear();
}

/**
 * Returns weekday name.
 * Example: "Saturday" or "Sat"
 */
export function getCurrentWeekday(
  dateInput?: Date | string | number | null,
  format: "long" | "short" = "long"
): string {
  return formatInSchoolTimezone(dateInput || new Date(), { weekday: format });
}

/**
 * Returns current time formatted as e.g. "11:49 AM".
 */
export function getCurrentTime(
  dateInput?: Date | string | number | null,
  withSeconds = false
): string {
  return formatInSchoolTimezone(dateInput || new Date(), {
    hour: "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

/**
 * Returns ISO timestamp string.
 */
export function getCurrentTimestamp(dateInput?: Date | string | number | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Short Date Format: "03 Oct 2026"
 */
export function formatShortDate(dateInput?: Date | string | number | null): string {
  const d = dateInput ?? new Date();
  return formatInSchoolTimezone(d, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Medium Date Format: "03 October 2026"
 */
export function formatMediumDate(dateInput?: Date | string | number | null): string {
  const d = dateInput ?? new Date();
  return formatInSchoolTimezone(d, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Long Date Format: "Saturday, 03 October 2026"
 */
export function formatLongDate(dateInput?: Date | string | number | null): string {
  const d = dateInput ?? new Date();
  return formatInSchoolTimezone(d, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Header Date Format: "Sat, Oct 3, 2026" or "Saturday, October 3, 2026"
 */
export function formatHeaderDate(
  dateInput?: Date | string | number | null,
  style: "compact" | "full" = "compact"
): string {
  const d = dateInput || new Date();
  if (style === "full") {
    return formatInSchoolTimezone(d, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return formatInSchoolTimezone(d, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Date + Time: "03 October 2026, 11:49 AM"
 */
export function formatDateTime(dateInput?: Date | string | number | null): string {
  const d = dateInput ?? new Date();
  const datePart = formatMediumDate(d);
  const timePart = formatTimeOnly(d);
  return `${datePart}, ${timePart}`;
}

/**
 * Time Only: "11:49 AM"
 */
export function formatTimeOnly(
  dateInput?: Date | string | number | null,
  withSeconds = false
): string {
  const d = dateInput ?? new Date();
  return formatInSchoolTimezone(d, {
    hour: "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

/**
 * Time Greeting based on current hour in school timezone.
 * "Good Morning" (before 12 PM), "Good Afternoon" (12 PM - 5 PM), "Good Evening" (after 5 PM)
 */
export function getGreeting(dateInput?: Date | string | number | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const hourStr = formatInSchoolTimezone(d, { hour: "numeric", hour12: false });
  const hour = parseInt(hourStr, 10);

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Checks if a date corresponds to Today in the school timezone.
 */
export function isToday(dateInput: Date | string | number | null | undefined): boolean {
  if (!dateInput) return false;
  return toSchoolISODate(dateInput) === toSchoolISODate();
}

/**
 * Checks if a date is strictly in the past (before today).
 */
export function isPast(dateInput: Date | string | number | null | undefined): boolean {
  if (!dateInput) return false;
  return toSchoolISODate(dateInput) < toSchoolISODate();
}

/**
 * Checks if a date is in the future (after today).
 */
export function isFuture(dateInput: Date | string | number | null | undefined): boolean {
  if (!dateInput) return false;
  return toSchoolISODate(dateInput) > toSchoolISODate();
}

/**
 * Relative date description: "Today", "Yesterday", "Tomorrow", "X days ago", "Due in X days".
 */
export function formatRelativeTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const dateIso = toSchoolISODate(dateInput);
  const todayIso = toSchoolISODate();

  if (dateIso === todayIso) return "Today";

  const targetDate = new Date(dateIso + "T00:00:00");
  const todayDate = new Date(todayIso + "T00:00:00");
  const diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1) return `In ${diffDays} days`;

  return formatShortDate(dateInput);
}
