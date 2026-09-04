import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { ThemeProvider } from "./theme";
import { LANGUAGES, OG_LOCALES } from "./i18n/config";
import { games, gamesForPlayerCount } from "./games";
import { en } from "./i18n/locales/en";
import { pageMeta } from "./pageMeta";
import { allRoutes, alternates, buildPath, buildUrl, type Route } from "./routes";
import { structuredData } from "./structuredData";

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * JSON-LD, as script tags. `</` is escaped because a closing tag inside a JSON
 * string would otherwise end the script element early.
 */
function renderJsonLd(route: Route, dateModified?: string): string {
  return structuredData(route, { dateModified })
    .map(
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(
          /</g,
          "\\u003c"
        )}</script>`
    )
    .join("\n    ");
}

/** The part of the `<head>` that differs from one page to the next. */
function renderHead(route: Route, dateModified?: string): string {
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
    renderJsonLd(route, dateModified),
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

export type RenderOptions = { dateModified?: string };

export function renderPage(route: Route, options: RenderOptions = {}): RenderedPage {
  const html = renderToString(
    <ThemeProvider>
      <LanguageProvider initialLanguage={route.language}>
        <App route={route} />
      </LanguageProvider>
    </ThemeProvider>
  );

  return {
    path: buildPath(route),
    language: route.language,
    head: renderHead(route, options.dateModified),
    html,
    gameNames: gamesForPlayerCount(route.players).map((game) => game.name),
  };
}

export function renderAllPages(options: RenderOptions = {}): RenderedPage[] {
  return allRoutes().map((route) => renderPage(route, options));
}

/**
 * A Markdown index of the site, served at /llms.txt. An emerging convention for
 * handing a language model the shape of a site without making it parse the HTML.
 */
export function buildLlmsTxt(): string {
  const rows = games
    .map((game) => {
      const range =
        game.maxPlayers === -1
          ? `${game.minPlayers}+ players`
          : game.minPlayers === game.maxPlayers
            ? en.content.playerRange(game.minPlayers, game.maxPlayers)
            : `${game.minPlayers}-${game.maxPlayers} players`;
      const description = en.gameDescriptions[game.id as keyof typeof en.gameDescriptions];
      return `- [${game.name}](${game.link}) — ${range}. ${description}`;
    })
    .join("\n");

  const pages = allRoutes()
    .map((route) => `- [${pageMeta(route).title}](${buildUrl(route)})`)
    .join("\n");

  return `# What we play?

> A directory of ${games.length} browser games, filterable by how many people are playing. Every game is free and runs in a web browser, with nothing to install. Available in English, French and Spanish.

## Games

${rows}

## Pages

${pages}
`;
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
