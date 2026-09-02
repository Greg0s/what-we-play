import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LANGUAGE,
  detectLanguage,
  storeLanguage,
  type Language,
} from "./config";
import { LanguageContext, type LanguageContextValue } from "./context";
import { translations, type GameId } from "./locales";
import { en } from "./locales/en";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

function updateDocumentMeta(language: Language) {
  const { meta } = translations[language];

  document.documentElement.lang = language;
  document.title = meta.title;

  const selectors = [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
  ];
  for (const selector of selectors) {
    document.querySelector(selector)?.setAttribute("content", meta.title);
  }

  const descriptionSelectors = [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ];
  for (const selector of descriptionSelectors) {
    document.querySelector(selector)?.setAttribute("content", meta.description);
  }
}

type LanguageProviderProps = {
  children: ReactNode;
  /**
   * Language the markup was rendered in. The prerender passes the locale it
   * built the page with; in the browser we start from that same value so the
   * first client render matches the server's HTML exactly.
   */
  initialLanguage?: Language;
};

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Detection reads `navigator` and `localStorage`, neither of which exists at
  // build time — and reading them during render would make the client disagree
  // with the prerendered markup and blow up hydration. So it happens after
  // hydration instead, before the first paint.
  useIsomorphicLayoutEffect(() => {
    const detected = detectLanguage();
    if (detected !== initialLanguage) setLanguageState(detected);
  }, [initialLanguage]);

  useEffect(() => {
    updateDocumentMeta(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const t = translations[language];
    const pluralRules = new Intl.PluralRules(language);

    return {
      language,
      setLanguage,
      t,
      gameDescription: (gameId) =>
        t.gameDescriptions[gameId as GameId] ??
        en.gameDescriptions[gameId as GameId] ??
        "",
      playersLabel: (count) =>
        pluralRules.select(count) === "one"
          ? t.header.players.one
          : t.header.players.other,
    };
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
