import { gamesForPlayerCount } from "./games";
import { translations } from "./i18n/locales";
import type { Route } from "./routes";

export type PageMeta = { title: string; description: string };

/**
 * Title and description of a page. The build writes these into the HTML and the
 * browser reapplies them when the route changes, so both go through here rather
 * than composing the strings twice.
 */
export function pageMeta(route: Route): PageMeta {
  const { meta } = translations[route.language];

  if (route.isHome) {
    return { title: meta.title, description: meta.description };
  }

  const count = gamesForPlayerCount(route.players).length;
  return {
    title: meta.countTitle(count, route.players),
    description: meta.countDescription(count, route.players),
  };
}
