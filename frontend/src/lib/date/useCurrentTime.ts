"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCurrentTime,
  formatMediumDate,
  formatShortDate,
  formatLongDate,
  formatHeaderDate,
  getCurrentDay,
  getCurrentMonth,
  getCurrentMonthName,
  getCurrentYear,
  getCurrentWeekday,
  getGreeting,
} from "./date-utils";
import { toSchoolISODate } from "./timezone";
import {
  getCurrentAcademicYear,
  getCurrentAcademicYearFormatted,
  getCurrentTerm,
  AcademicTerm,
} from "./academic-year";

export interface CurrentTimeState {
  now: Date;
  timeStr: string;
  timeWithSecondsStr: string;
  dateShortStr: string;
  dateMediumStr: string;
  dateLongStr: string;
  dateHeaderStr: string;
  day: number;
  weekday: string;
  month: number;
  monthName: string;
  year: number;
  academicYear: string;
  academicYearFormatted: string;
  term: AcademicTerm;
  termName: string;
  greeting: string;
  isoDate: string;
}

function calculateCurrentTimeState(now = new Date()): CurrentTimeState {
  const currentTermObj = getCurrentTerm(now);
  return {
    now,
    timeStr: getCurrentTime(now, false),
    timeWithSecondsStr: getCurrentTime(now, true),
    dateShortStr: formatShortDate(now),
    dateMediumStr: formatMediumDate(now),
    dateLongStr: formatLongDate(now),
    dateHeaderStr: formatHeaderDate(now, "compact"),
    day: getCurrentDay(now),
    weekday: getCurrentWeekday(now, "long"),
    month: getCurrentMonth(now),
    monthName: getCurrentMonthName(now, "long"),
    year: getCurrentYear(now),
    academicYear: getCurrentAcademicYear(now),
    academicYearFormatted: getCurrentAcademicYearFormatted(now),
    term: currentTermObj,
    termName: currentTermObj.termName,
    greeting: getGreeting(now),
    isoDate: toSchoolISODate(now),
  };
}

export interface UseCurrentTimeOptions {
  withSeconds?: boolean;
  intervalMs?: number;
}

/**
 * Universal React hook for live real-time clock, date, month, year, and academic calendar.
 * Supports auto-updating, interval cleanup, browser tab visibility sync, and midnight rollover.
 */
export function useCurrentTime(options: UseCurrentTimeOptions = {}): CurrentTimeState {
  const { withSeconds = false, intervalMs = withSeconds ? 1000 : 15000 } = options;

  // Initialize with real time
  const [state, setState] = useState<CurrentTimeState>(() => calculateCurrentTimeState());
  const lastIsoDateRef = useRef<string>(state.isoDate);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentIso = toSchoolISODate(now);

      // Check if midnight rolled over to trigger instant deep recalculation
      const isNewDay = currentIso !== lastIsoDateRef.current;
      if (isNewDay) {
        lastIsoDateRef.current = currentIso;
      }

      setState(calculateCurrentTimeState(now));
    };

    // Immediate sync
    updateTime();

    // Set interval with auto-cleanup
    const timerId = setInterval(updateTime, intervalMs);

    // Visibility Listener: re-sync immediately when user switches back to this browser tab
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        updateTime();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      clearInterval(timerId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [withSeconds, intervalMs]);

  return state;
}
