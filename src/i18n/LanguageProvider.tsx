import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLanguage, storeLanguage, type Language } from "./config";
import { LanguageContext, type LanguageContextValue } from "./context";
import { translations, type GameId } from "./locales";
import { en } from "./locales/en";

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

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
