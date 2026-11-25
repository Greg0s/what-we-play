import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { ReliefProvider } from "./relief";
import { ThemeProvider } from "./theme";
import { DEFAULT_LANGUAGE, LANGUAGES, OG_LOCALES, STORAGE_KEY } from "./i18n/config";
import { games, gamesForPlayerCount } from "./games";
import { en } from "./i18n/locales/en";
import { pageMeta, previewImage } from "./pageMeta";
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

/**
 * Sends a visitor who lands on an unprefixed (English) page to their own
 * language's version of it, with a real navigation, before anything paints.
 *
 * The app used to swap the language after hydration and `replaceState` the
 * URL, but by then the browser had already read an English page: Chrome
 * (notably the installed app, whose `start_url` is `/`) kept offering to
 * translate "from English" a page it was showing in French. Loading the
 * prefixed page instead gives it `lang`, markup and URL that agree.
 *
 * Same lookup as `detectLanguage` in src/i18n/config.ts (a stored choice, then
 * the browser's languages), inlined because it must run before any bundle.
 * The target comes from the page's own `hreflang` links, which sit above it,
 * and only its path is kept so it stays on whatever host served the page.
 * Crawlers that run no JavaScript, or browse in English, stay put.
 */
function renderLanguageRedirect(): string {
  const script = `(function () {
      try {
        var languages = ${JSON.stringify(LANGUAGES)};
        var language = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        if (languages.indexOf(language) < 0) {
          language = null;
          var preferred = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
          for (var i = 0; i < preferred.length && !language; i++) {
            var base = String(preferred[i]).toLowerCase().split("-")[0];
            if (languages.indexOf(base) >= 0) language = base;
          }
        }
        if (!language || language === ${JSON.stringify(DEFAULT_LANGUAGE)}) return;
        var link = document.querySelector('link[rel="alternate"][hreflang="' + language + '"]');
        if (link) location.replace(new URL(link.href).pathname + location.search + location.hash);
      } catch (e) {
        // No storage or no URL support: the app still switches after hydration.
      }
    })();`;
  return `<script>${script}</script>`;
}

/** The part of the `<head>` that differs from one page to the next. */
function renderHead(route: Route, dateModified?: string): string {
  const { title, description } = pageMeta(route);
  const url = buildUrl(route);
  const image = previewImage(route.language);

  return [
    `<title>${escapeAttribute(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...alternates(route).map(
      ({ hreflang, url: href }) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`
    ),
    ...(route.language === DEFAULT_LANGUAGE ? [renderLanguageRedirect()] : []),
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:locale" content="${OG_LOCALES[route.language]}" />`,
    ...LANGUAGES.filter((code) => code !== route.language).map(
      (code) => `<meta property="og:locale:alternate" content="${OG_LOCALES[code]}" />`
    ),
    `<meta property="og:image" content="${image.url}" />`,
    `<meta property="og:image:width" content="${image.width}" />`,
    `<meta property="og:image:height" content="${image.height}" />`,
    `<meta property="og:image:alt" content="${escapeAttribute(image.alt)}" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `<meta name="twitter:image" content="${image.url}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttribute(image.alt)}" />`,
    renderJsonLd(route, dateModified),
  ].join("\n    ");
}

export type RenderedPage = {
  /** Site path, e.g. `/fr/jeux-a-4-joueurs/`. */
  path: string;
  language: string;
  /** A language's landing page: the service worker precaches these. */
  isHome: boolean;
  head: string;
  html: string;
  /** Games this page is expected to list, for the build to verify. */
  gameNames: string[];
};

export type RenderOptions = { dateModified?: string };

export function renderPage(route: Route, options: RenderOptions = {}): RenderedPage {
  const html = renderToString(
    <ThemeProvider>
      <ReliefProvider>
        <LanguageProvider initialLanguage={route.language}>
          <App route={route} />
        </LanguageProvider>
      </ReliefProvider>
    </ThemeProvider>
  );

  return {
    path: buildPath(route),
    language: route.language,
    isHome: route.isHome,
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
      return `- [${game.name}](${game.link}): ${range}. ${description}`;
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

/**
 * `lastModified`: when the catalogue or its copy last changed (the same date as
 * the JSON-LD's `dateModified`). Every page is drawn from those two sources, so
 * it is true of each of them; without it, no `<lastmod>` rather than the build
 * clock, which would change on every deploy and teach crawlers to ignore it.
 */
export function buildSitemap(lastModified?: string): string {
  const lastmod = lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : "";
  const entries = allRoutes()
    .map((route) => {
      const links = alternates(route)
        .map(
          ({ hreflang, url }) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${url}" />`
        )
        .join("\n");

      return `  <url>\n    <loc>${buildUrl(route)}</loc>${lastmod}\n${links}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}
