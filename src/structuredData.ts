import { gamesForPlayerCount, type Game } from "./games";
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

function videoGame(game: Game, description: string): JsonLd {
  return {
    "@type": "VideoGame",
    name: game.name,
    description,
    url: game.link,
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
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    mainEntity: {
      "@type": "ItemList",
      name: title,
      numberOfItems: games.length,
      itemListElement: games.map((game, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: videoGame(game, t.gameDescriptions[game.id as keyof typeof t.gameDescriptions]),
      })),
    },
  };

  const blocks: JsonLd[] = [page];

  if (route.isHome) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url,
      name: t.header.title,
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
