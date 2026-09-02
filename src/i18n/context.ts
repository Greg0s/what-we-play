import { createContext } from "react";
import type { Language } from "./config";
import type { Translation } from "./locales";

export type LanguageContextValue = {
  /** Language currently displayed. */
  language: Language;
  /** Switches the language and remembers the choice for the next visits. */
  setLanguage: (language: Language) => void;
  /** Strings of the current language. */
  t: Translation;
  /** Description of a game, falling back to English when untranslated. */
  gameDescription: (gameId: string) => string;
  /** "player"/"players", using the plural rules of the current language. */
  playersLabel: (count: number) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
