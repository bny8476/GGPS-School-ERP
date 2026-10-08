"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, type LanguageCode } from "@/context/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "compact" | "transparent";
  align?: "left" | "right";
}

export default function LanguageSwitcher({
  className = "",
  variant = "pill",
  align = "right",
}: LanguageSwitcherProps) {
  const { language, currentLanguage, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation: Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Primary languages to display first (en, ta, hi), followed by other supported languages
  const sortedLanguages = [...languages].sort((a, b) => {
    const priority = ["en", "ta", "hi"];
    const aIdx = priority.indexOf(a.code);
    const bIdx = priority.indexOf(b.code);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0050CB]/40 select-none ${
          variant === "pill"
            ? "h-9 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 shadow-2xs text-xs font-semibold"
            : variant === "compact"
            ? "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 text-xs font-semibold px-2.5 py-1 shadow-xs"
            : "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
        }`}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0050CB] dark:text-[#38BDF8] shrink-0" strokeWidth={2.2} />
        <span className="truncate max-w-[90px]">{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#0050CB]" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-52 bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
        >
          <div className="px-3.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800/80 pb-1 mb-1">
            {t("nav.selectLanguage", "Select Language")}
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {sortedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#E5EEFF] dark:bg-[#0050CB]/25 text-[#0050CB] dark:text-blue-300 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0050CB] dark:hover:text-blue-300"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{lang.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0050CB] dark:text-blue-400 shrink-0 ml-2" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
