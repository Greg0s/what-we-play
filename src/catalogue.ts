import { games, gamesForPlayerCount, type Game, type Genre } from "./games";

/** The four « Options » toggles. */
export type Filters = {
  /** Only games playable with strangers matched online. */
  strangers: boolean;
  /** Games fun over screen share; widens the list to the whole catalogue. */
  screenShare: boolean;
  /** Only games that work on a phone. */
  mobile: boolean;
  /** Only games playable without an account. */
  noAccount: boolean;
};

export const NO_FILTERS: Filters = {
  strangers: false,
  screenShare: false,
  mobile: false,
  noAccount: false,
};

export type GenreChoice = Genre | "all";

export type CatalogueView = {
  /** Everything that passes the player count, the search and the options. */
  base: Game[];
  /** `base` narrowed to the chosen genre: what the page lists. */
  list: Game[];
  hasQuery: boolean;
  /**
   * The player count is ignored: while searching, or with screen share on
   * (one person hosts, everyone else watches, so any game can work).
   */
  wide: boolean;
};

/** Lowercases and strips accents, so "cinema" finds "Cinéma" and vice versa. */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function viewCatalogue(options: {
  players: number;
  query: string;
  genre: GenreChoice;
  filters: Filters;
  /** Everything the search may match for a game, in the page's language. */
  searchText: (game: Game) => string;
}): CatalogueView {
  const { players, query, genre, filters, searchText } = options;
  const needle = normalizeForSearch(query.trim());
  const hasQuery = needle.length > 0;
  const wide = hasQuery || filters.screenShare;

  let base = wide ? games : gamesForPlayerCount(players);
  if (hasQuery) base = base.filter((game) => normalizeForSearch(searchText(game)).includes(needle));
  if (filters.strangers) base = base.filter((game) => game.soloWithStrangers);
  if (filters.screenShare) base = base.filter((game) => game.screenShare);
  if (filters.mobile) base = base.filter((game) => game.mobileFriendly);
  if (filters.noAccount) base = base.filter((game) => !game.accountNeeded);

  const list = genre === "all" ? base : base.filter((game) => game.genre === genre);
  return { base, list, hasQuery, wide };
}

export function activeFilterCount(filters: Filters): number {
  return Object.values(filters).filter(Boolean).length;
}
