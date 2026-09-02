import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { LANGUAGES, OG_LOCALES } from "./i18n/config";
import { gamesForPlayerCount } from "./games";
import { pageMeta } from "./pageMeta";
import { allRoutes, alternates, buildPath, buildUrl, type Route } from "./routes";

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The part of the `<head>` that differs from one page to the next. */
function renderHead(route: Route): string {
  const { title, description } = pageMeta(route);
  const url = buildUrl(route);

  return [
    `<title>${escapeAttribute(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...alternates(route).map(
      ({ hreflang, url: href }) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`
    ),
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:locale" content="${OG_LOCALES[route.language]}" />`,
    ...LANGUAGES.filter((code) => code !== route.language).map(
      (code) => `<meta property="og:locale:alternate" content="${OG_LOCALES[code]}" />`
    ),
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
  ].join("\n    ");
}

export type RenderedPage = {
  /** Site path, e.g. `/fr/jeux-a-4-joueurs/`. */
  path: string;
  language: string;
  head: string;
  html: string;
  /** Games this page is expected to list, for the build to verify. */
  gameNames: string[];
};

export function renderPage(route: Route): RenderedPage {
  const html = renderToString(
    <LanguageProvider initialLanguage={route.language}>
      <App route={route} />
    </LanguageProvider>
  );

  return {
    path: buildPath(route),
    language: route.language,
    head: renderHead(route),
    html,
    gameNames: gamesForPlayerCount(route.players).map((game) => game.name),
  };
}

export function renderAllPages(): RenderedPage[] {
  return allRoutes().map(renderPage);
}

export function buildSitemap(): string {
  const entries = allRoutes()
    .map((route) => {
      const links = alternates(route)
        .map(
          ({ hreflang, url }) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${url}" />`
        )
        .join("\n");

      return `  <url>\n    <loc>${buildUrl(route)}</loc>\n${links}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}
