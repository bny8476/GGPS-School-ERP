"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  LANGUAGES, 
  DEFAULT_LANGUAGE, 
  type Language, 
  type LanguageCode 
} from "@/i18n/languages";
import { LOCALES } from "@/i18n/locales";

export { LANGUAGES, type Language, type LanguageCode };

export interface LanguageContextType {
  language: LanguageCode;
  currentLanguage: Language;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  languages: Language[];
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Map app language code to BCP-47 locale tag for Intl formatting
const INTL_LOCALE_MAP: Record<LanguageCode, string> = {
  en: "en-IN",
  ta: "ta-IN",
  hi: "hi-IN",
  ml: "ml-IN",
  te: "te-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ar: "ar-SA",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

// Aliases for backwards compatibility with earlier components
const KEY_ALIASES: Record<string, string> = {
  "features.badge": "features.eyebrow",
  "features.c1_tag": "features.smartAuto",
  "features.c1_title": "features.intelOps",
  "features.c1_desc": "features.intelOpsDesc",
  "features.c1_link": "features.exploreMore",
  "features.c2_tag": "features.betterInsights",
  "features.c2_title": "features.perfRubrics",
  "features.c2_desc": "features.perfRubricsDesc",
  "features.c3_tag": "features.safeConnected",
  "features.c3_title": "features.secureConnected",
  "features.c3_desc": "features.secureConnectedDesc",
  "cta.badge": "cta.eyebrow",
  "footer.openAdmissions": "footer.admissionsOpen",
  "footer.location": "footer.campusAddress",
  "footer.contact": "footer.contactSupport",
  "login.welcome": "login.welcomeBack",
  "login.title": "login.signInTitle",
  "login.subtitle": "login.signInSubtitle",
  "login.signIn": "login.signInBtn",
  "login.apply": "login.applyAdmission",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Apply language attributes to the <html> document root
  const applyLanguageToDOM = useCallback((code: LanguageCode) => {
    if (typeof document === "undefined") return;
    const langObj = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
    document.documentElement.lang = code;
    document.documentElement.dir = langObj.dir || "ltr";
  }, []);

  // Update backend user preference if authenticated
  const syncPreferenceWithBackend = useCallback(async (code: LanguageCode) => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiBase}/api/v1/users/me/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredLanguage: code }),
      });
    } catch (e) {
      // Fire-and-forget; preference remains active in local storage & cookie
    }
  }, []);

  // Set Language Handler (instant, no page refresh, persistent across cookie, localStorage & tabs)
  const setLanguage = useCallback((code: LanguageCode, skipBroadcast = false) => {
    const validLanguage = LANGUAGES.find((l) => l.code === code);
    if (!validLanguage) return;

    setLanguageState(code);
    applyLanguageToDOM(code);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", code);
        // Also persist as a cookie for server/edge routing & guest visits
        document.cookie = `locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Storage access might be restricted
      }

      // Broadcast to other open tabs via BroadcastChannel
      if (!skipBroadcast && channelRef.current) {
        try {
          channelRef.current.postMessage({ type: "GGPS_LANGUAGE_CHANGE", language: code });
        } catch {
          // Channel error fallback
        }
      }

      // Asynchronously sync with backend if user is logged in
      syncPreferenceWithBackend(code);
    }
  }, [applyLanguageToDOM, syncPreferenceWithBackend]);

  // Initial load & Cross-tab broadcast listener setup
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const broadcast = new BroadcastChannel("ggps_language_channel");
        broadcast.onmessage = (event) => {
          if (event?.data?.type === "GGPS_LANGUAGE_CHANGE" && event.data.language) {
            const newLang = event.data.language as LanguageCode;
            if (LANGUAGES.some((l) => l.code === newLang)) {
              setLanguageState(newLang);
              applyLanguageToDOM(newLang);
            }
          }
        };
        channelRef.current = broadcast;
      } catch {
        // Fallback to storage event
      }
    }

    // Storage event fallback for older browsers
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && e.newValue) {
        const newCode = e.newValue as LanguageCode;
        if (LANGUAGES.some((l) => l.code === newCode)) {
          setLanguageState(newCode);
          applyLanguageToDOM(newCode);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Determine initial language preference on mount
    let initialLang: LanguageCode = DEFAULT_LANGUAGE;
    try {
      const stored = localStorage.getItem("language") as LanguageCode | null;
      if (stored && LANGUAGES.some((l) => l.code === stored)) {
        initialLang = stored;
      } else {
        // Check user object in localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.preferredLanguage && LANGUAGES.some((l) => l.code === user.preferredLanguage)) {
            initialLang = user.preferredLanguage;
          }
        } else {
          // Check browser language
          const browserLang = navigator.language?.split("-")[0] as LanguageCode;
          if (browserLang && LANGUAGES.some((l) => l.code === browserLang)) {
            initialLang = browserLang;
          }
        }
      }
    } catch {
      initialLang = DEFAULT_LANGUAGE;
    }

    setLanguageState(initialLang);
    applyLanguageToDOM(initialLang);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [applyLanguageToDOM]);

  // Translation function with instant reactive lookup & fallback cascade
  const t = useCallback((key: string, fallback?: string): string => {
    const resolvedKey = KEY_ALIASES[key] || key;
    const currentDict = LOCALES[language];

    if (currentDict && currentDict[resolvedKey] !== undefined) {
      return currentDict[resolvedKey];
    }

    // Fallback to English dictionary
    const enDict = LOCALES.en;
    if (enDict && enDict[resolvedKey] !== undefined) {
      return enDict[resolvedKey];
    }

    return fallback || key;
  }, [language]);

  // Locale-aware Date Formatter
  const formatDate = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "";
      const locale = INTL_LOCALE_MAP[language] || "en-IN";
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
    } catch {
      return String(date);
    }
  }, [language]);

  // Locale-aware Currency Formatter (INR ₹)
  const formatCurrency = useCallback((amount: number): string => {
    try {
      const locale = INTL_LOCALE_MAP[language] || "en-IN";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  }, [language]);

  // Locale-aware Number Formatter
  const formatNumber = useCallback((num: number): string => {
    try {
      const locale = INTL_LOCALE_MAP[language] || "en-IN";
      return new Intl.NumberFormat(locale).format(num);
    } catch {
      return num.toLocaleString();
    }
  }, [language]);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    currentLanguage,
    setLanguage,
    t,
    languages: LANGUAGES,
    formatDate,
    formatCurrency,
    formatNumber,
  }), [language, currentLanguage, setLanguage, t, formatDate, formatCurrency, formatNumber]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
