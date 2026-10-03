import { formatInSchoolTimezone } from "./timezone";

export interface AcademicTerm {
  termId: string;
  termName: string;
  termLabel: string;
  startMonth: number; // 1-12
  endMonth: number; // 1-12
}

export const DEFAULT_ACADEMIC_TERMS: AcademicTerm[] = [
  {
    termId: "TERM-1",
    termName: "Term 1",
    termLabel: "Term 1 (Jun – Aug)",
    startMonth: 6,
    endMonth: 8,
  },
  {
    termId: "TERM-2",
    termName: "Term 2",
    termLabel: "Term 2 (Sep – Dec)",
    startMonth: 9,
    endMonth: 12,
  },
  {
    termId: "TERM-3",
    termName: "Term 3",
    termLabel: "Term 3 (Jan – May)",
    startMonth: 1,
    endMonth: 5,
  },
];

/**
 * Calculates current Academic Year string dynamically based on the school cycle (June 1 - May 31).
 * Example: October 2026 -> "2026–2027"
 *          February 2027 -> "2026–2027"
 *          June 2027 -> "2027–2028"
 */
export function getCurrentAcademicYear(dateInput?: Date | string | number | null): string {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) date = new Date();

  // Extract month (1-12) and year in school timezone
  const monthStr = formatInSchoolTimezone(date, { month: "numeric" });
  const yearStr = formatInSchoolTimezone(date, { year: "numeric" });

  const month = parseInt(monthStr, 10) || (date.getMonth() + 1);
  const year = parseInt(yearStr, 10) || date.getFullYear();

  // Session starts in June (month 6)
  if (month >= 6) {
    return `${year}–${year + 1}`;
  } else {
    return `${year - 1}–${year}`;
  }
}

/**
 * Returns formatted Academic Year with prefix (e.g. "AY 2026–2027").
 */
export function getCurrentAcademicYearFormatted(dateInput?: Date | string | number | null): string {
  return `AY ${getCurrentAcademicYear(dateInput)}`;
}

/**
 * Determines current active Term (Term 1, Term 2, or Term 3) based on configured date boundaries.
 */
export function getCurrentTerm(dateInput?: Date | string | number | null): AcademicTerm {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) date = new Date();

  const monthStr = formatInSchoolTimezone(date, { month: "numeric" });
  const month = parseInt(monthStr, 10) || (date.getMonth() + 1);

  if (month >= 6 && month <= 8) {
    return DEFAULT_ACADEMIC_TERMS[0]; // Term 1
  } else if (month >= 9 && month <= 12) {
    return DEFAULT_ACADEMIC_TERMS[1]; // Term 2
  } else {
    return DEFAULT_ACADEMIC_TERMS[2]; // Term 3 (Jan - May)
  }
}

/**
 * Generates dynamic academic year dropdown choices centered around the current academic session.
 */
export function getAcademicYearOptions(pastYears = 2, futureYears = 2): string[] {
  const currentAY = getCurrentAcademicYear();
  const startYear = parseInt(currentAY.split("–")[0], 10);

  const years: string[] = [];
  for (let i = -pastYears; i <= futureYears; i++) {
    const y = startYear + i;
    years.push(`${y}–${y + 1}`);
  }
  return years;
}

/**
 * Generates options with prefix: ["AY 2024–2025", "AY 2025–2026", "AY 2026–2027", "AY 2027–2028"]
 */
export function getAcademicYearDisplayOptions(pastYears = 2, futureYears = 2): string[] {
  return getAcademicYearOptions(pastYears, futureYears).map((ay) => `AY ${ay}`);
}
