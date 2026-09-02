import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, storeLanguage, type Language } from "./config";
import { LanguageContext, type LanguageContextValue } from "./context";
import { translations, type GameId } from "./locales";
import { en } from "./locales/en";

type LanguageProviderProps = {
  children: ReactNode;
  /**
   * Language the markup was rendered in — for a prerendered page, the one its
   * URL names. The browser starts from that same value so the first client
   * render matches the server's HTML exactly.
   */
  initialLanguage?: Language;
};

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

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
