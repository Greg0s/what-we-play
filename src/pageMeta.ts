import { gamesForPlayerCount } from "./games";
import { translations } from "./i18n/locales";
import type { Language } from "./i18n/config";
import { SITE_URL, type Route } from "./routes";

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

  const count = gamesForPlayerCount(route.players).length;
  return {
    title: `${header.title} — ${meta.countTitle(count, route.players)}`,
    description: meta.countDescription(count, route.players),
  };
}
