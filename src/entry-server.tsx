import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { DEFAULT_LANGUAGE, type Language } from "./i18n";
import { DEFAULT_PLAYERS, gamesForPlayerCount } from "./games";
import { translations } from "./i18n/locales";

/**
 * Renders the app to HTML at build time. `renderToString` rather than
 * `renderToStaticMarkup`: only the former emits markup the client can hydrate.
 */
export function render(language: Language = DEFAULT_LANGUAGE) {
  const html = renderToString(
    <LanguageProvider initialLanguage={language}>
      <App />
    </LanguageProvider>
  );

  return {
    html,
    language,
    meta: translations[language].meta,
    /** What the page is expected to contain, for the build to check against. */
    gameNames: gamesForPlayerCount(DEFAULT_PLAYERS).map((game) => game.name),
  };
}
