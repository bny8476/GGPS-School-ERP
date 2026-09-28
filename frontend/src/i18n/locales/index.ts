import { en } from './en';
import { ta } from './ta';
import { hi } from './hi';
import type { LanguageCode } from '../languages';

// Base dictionary index with complete support for primary languages (en, ta, hi)
export const LOCALES: Record<LanguageCode, Record<string, string>> = {
  en,
  ta,
  hi,
  // Future language stubs automatically fall back to en if specific keys not present
  ml: { ...en },
  te: { ...en },
  kn: { ...en },
  bn: { ...en },
  mr: { ...en },
  ar: { ...en },
  es: { ...en },
  fr: { ...en },
  de: { ...en },
};

export { en, ta, hi };
