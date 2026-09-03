import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "./i18n/config";
import { DEFAULT_PLAYERS } from "./games";

export const SITE_URL = "https://whatweplay.gregoiretinn.es";

/**
 * Player counts that get their own page. Past ten the catalogue barely changes,
 * and the counter stays free-form for anyone who wants more.
 */
export const PLAYER_COUNT_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * How each language spells its URLs.
 *
 * `prefix` is the first path segment — English has none, so it owns the root and
 * serves as the `x-default` target. `slug` handles its own plural, and `match`
 * accepts either form so a hand-typed singular still resolves.
 */
const ROUTING: Record<
  Language,
  { prefix: string; slug: (players: number) => string; match: RegExp }
> = {
  en: {
    prefix: "",
    slug: (n) => `games-for-${n}-player${n === 1 ? "" : "s"}`,
    match: /^games-for-(\d+)-players?$/,
  },
  fr: {
    prefix: "fr",
    slug: (n) => `jeux-a-${n}-joueur${n === 1 ? "" : "s"}`,
    match: /^jeux-a-(\d+)-joueurs?$/,
  },
  es: {
    prefix: "es",
    slug: (n) => `juegos-para-${n}-jugador${n === 1 ? "" : "es"}`,
    match: /^juegos-para-(\d+)-jugador(?:es)?$/,
  },
};

export type Route = {
  language: Language;
  players: number;
  /** True for the language's landing page, which carries no player count. */
  isHome: boolean;
};

/** Path of a route, always absolute and always with a trailing slash. */
export function buildPath(route: Route): string {
  const { prefix } = ROUTING[route.language];
  const segments = [prefix, route.isHome ? "" : ROUTING[route.language].slug(route.players)];
  const path = segments.filter(Boolean).join("/");
  return path === "" ? "/" : `/${path}/`;
}

export function buildUrl(route: Route): string {
  return `${SITE_URL}${buildPath(route)}`;
}

/**
 * Reads a route back out of a pathname. Anything unrecognised falls back to the
 * English landing page, which is also what an unknown URL should look like.
 */
export function parseRoute(pathname: string): Route {
  const segments = pathname.split("/").filter(Boolean);

  let language: Language = DEFAULT_LANGUAGE;
  if (segments.length > 0) {
    const candidate = LANGUAGES.find(
      (code) => ROUTING[code].prefix !== "" && ROUTING[code].prefix === segments[0]
    );
    if (candidate) {
      language = candidate;
      segments.shift();
    }
  }

  const home: Route = { language, players: DEFAULT_PLAYERS, isHome: true };
  if (segments.length === 0) return home;

  const matched = segments[0].match(ROUTING[language].match);
  if (!matched) return home;

  const players = Number(matched[1]);
  if (!PLAYER_COUNT_PAGES.includes(players)) return home;

  return { language, players, isHome: false };
}

/** Same route in another language — what the language switcher navigates to. */
export function translateRoute(route: Route, language: Language): Route {
  return { ...route, language };
}

/** Every page the build generates. */
export function allRoutes(): Route[] {
  return LANGUAGES.flatMap((language) => [
    { language, players: DEFAULT_PLAYERS, isHome: true },
    ...PLAYER_COUNT_PAGES.map((players) => ({ language, players, isHome: false })),
  ]);
}

/**
 * The same page in every language, for hreflang. Each page lists the whole set,
 * itself included, which is what makes the annotations reciprocal.
 */
export function alternates(route: Route): { hreflang: string; url: string }[] {
  return [
    ...LANGUAGES.map((language) => ({
      hreflang: language,
      url: buildUrl(translateRoute(route, language)),
    })),
    { hreflang: "x-default", url: buildUrl(translateRoute(route, DEFAULT_LANGUAGE)) },
  ];
}
