"use client";

import { useServerInsertedHTML } from "next/navigation";

export default function ThemeInitializer() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-initializer"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var stored = localStorage.getItem('theme') || localStorage.getItem('gi_theme');
              var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.style.colorScheme = 'light';
              }
              var storedLang = localStorage.getItem('language');
              if (storedLang) {
                document.documentElement.lang = storedLang;
                if (storedLang === 'ar') {
                  document.documentElement.dir = 'rtl';
                }
              }
            } catch (_) {}
          `,
        }}
      />
    );
  });

  return null;
}
