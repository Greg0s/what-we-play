import { gameLink, gamesForPlayerCount, type Game } from "./games";
import type { Language } from "./i18n/config";
import { translations } from "./i18n/locales";
import { pageMeta } from "./pageMeta";
import { SITE_URL, buildUrl, type Route } from "./routes";

/**
 * JSON-LD for a page.
 *
 * This is the part of the site an answer engine can actually quote with
 * confidence: the player range of every game as data rather than prose. The
 * vocabulary happens to fit exactly — `schema.org/VideoGame` carries
 * `numberOfPlayers`, which is the site's whole organising idea.
 */

type JsonLd = Record<string, unknown>;

/** The site's one name, as og:site_name and the manifest spell it. */
export const SITE_NAME = translations.en.header.title;

/** The H1 in the other languages, then the bare domain label. */
function siteAlternateNames(): string[] {
  const localized = Object.values(translations)
    .map((t) => t.header.title)
    .filter((name) => name !== SITE_NAME);
  return [...new Set(localized), "whatweplay"];
}

function videoGame(game: Game, description: string, language: Language): JsonLd {
  return {
    "@type": "VideoGame",
    name: game.name,
    description,
    url: gameLink(game, language),
    gamePlatform: "Web browser",
    applicationCategory: "GameApplication",
    playMode: game.maxPlayers === 1 ? "SinglePlayer" : "MultiPlayer",
    numberOfPlayers: {
      "@type": "QuantitativeValue",
      minValue: game.minPlayers,
      // Omitting maxValue is how "no upper limit" is expressed; inventing a
      // number here would be a claim the data does not make.
      ...(game.maxPlayers === -1 ? {} : { maxValue: game.maxPlayers }),
      unitText: "player",
    },
    isAccessibleForFree: true,
  };
}

export function structuredData(
  route: Route,
  options: { dateModified?: string } = {}
): JsonLd[] {
  const t = translations[route.language];
  const { title, description } = pageMeta(route);
  const url = buildUrl(route);
  const games = gamesForPlayerCount(route.players);

  const page: JsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: title,
    description,
    inLanguage: route.language,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    mainEntity: {
      "@type": "ItemList",
      name: title,
      numberOfItems: games.length,
      itemListElement: games.map((game, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: videoGame(
          game,
          t.gameDescriptions[game.id as keyof typeof t.gameDescriptions],
          route.language
        ),
      })),
    },
  };

  const blocks: JsonLd[] = [page];

  if (route.isHome) {
    // What Google shows as the site's name in its results. Without it, it
    // falls back to the domain (or to the parent domain's name, mintymoon),
    // and appends that to titles. One name for the whole site, the same in
    // every language and on every landing, like og:site_name and the
    // manifest; the localized names go in alternateName.
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: siteAlternateNames(),
      description: t.meta.description,
      inLanguage: route.language,
    });
  } else {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t.header.title,
          item: buildUrl({ ...route, isHome: true }),
        },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    });
  }

  return blocks;
}
