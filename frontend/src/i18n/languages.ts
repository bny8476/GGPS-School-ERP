export type LanguageCode =
  | 'en'
  | 'ta'
  | 'hi'
  | 'ml'
  | 'te'
  | 'kn'
  | 'bn'
  | 'mr'
  | 'ar'
  | 'es'
  | 'fr'
  | 'de';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  active?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr', active: true },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', active: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', active: true },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', active: false },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', active: false },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', active: false },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', active: false },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', dir: 'ltr', active: false },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', dir: 'rtl', active: true },
  { code: 'es', label: 'Español', nativeName: 'Español', dir: 'ltr', active: true },
  { code: 'fr', label: 'Français', nativeName: 'Français', dir: 'ltr', active: true },
  { code: 'de', label: 'Deutsch', nativeName: 'Deutsch', dir: 'ltr', active: true },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANG_CODES: LanguageCode[] = LANGUAGES.map((l) => l.code);
