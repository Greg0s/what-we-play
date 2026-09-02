export const LANGUAGES = ["en", "fr", "es"] as const;

export type Language = (typeof LANGUAGES)[number];

/** Language used when the browser language is not one we support. */
export const DEFAULT_LANGUAGE: Language = "en";

/** Endonyms: every language is always displayed in its own language. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export const STORAGE_KEY = "what-we-play:language";

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** Reads the language previously chosen by the user, if any. */
export function getStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== null && isLanguage(stored) ? stored : null;
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
    return null;
  }
}

export function storeLanguage(language: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not being able to remember the choice is not a reason to fail.
  }
}

/**
 * Picks the language to start with: the one the user explicitly chose before,
 * otherwise the first browser language we support, otherwise English.
 */
export function detectLanguage(): Language {
  const stored = getStoredLanguage();
  if (stored) return stored;

  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;

  const preferred =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const tag of preferred) {
    // "fr-CA" and "fr" both mean French to us.
    const base = tag.toLowerCase().split("-")[0];
    if (isLanguage(base)) return base;
  }

  return DEFAULT_LANGUAGE;
}
