import { gamesForPlayerCount, type Game } from "./games";
import { translations } from "./i18n/locales";
import type { Language } from "./i18n/config";
import { SITE_URL, type Route } from "./routes";

/** How many game names a player-count page's description cites. */
const DESCRIPTION_EXAMPLES = 3;

export type PageMeta = { title: string; description: string };

/**
 * Bump after redrawing the previews (scripts/og-image.js): social sites cache
 * an image by its URL, so the same URL would keep showing the old one.
 */
const PREVIEW_VERSION = 1;

/** The link preview of every page in a language, drawn by scripts/og-image.js. */
export function previewImage(language: Language) {
  return {
    url: `${SITE_URL}/what-we-play-preview-${language}.jpg?v=${PREVIEW_VERSION}`,
    alt: translations[language].preview.alt,
    width: 1200,
    height: 630,
  };
}

/**
 * Title and description of a page. The build writes these into the HTML and the
 * browser reapplies them when the route changes, so both go through here rather
 * than composing the strings twice.
 */
export function pageMeta(route: Route): PageMeta {
  const { meta, header } = translations[route.language];

  if (route.isHome) {
    return { title: meta.title, description: meta.description };
  }

  const games = gamesForPlayerCount(route.players);
  // The query first, the site's name last: a results page cuts long titles
  // from the end, and what people type is "games for 4", not our name.
  // The description names a few of the games, the ones made most for this
  // count (narrowest player range, then catalogue order): it differs from page
  // to page, and a game's name is what people search once they know it.
  const span = (game: Game) =>
    (game.maxPlayers === -1 ? Infinity : game.maxPlayers) - game.minPlayers;
  const examples = games
    .map((game, index) => ({ game, index }))
    .sort((a, b) => span(a.game) - span(b.game) || a.index - b.index)
    .slice(0, DESCRIPTION_EXAMPLES)
    .map(({ game }) => game.name);
  return {
    title: `${meta.countTitle(games.length, route.players)} | ${header.title}`,
    description: meta.countDescription(games.length, route.players, examples),
  };
}
