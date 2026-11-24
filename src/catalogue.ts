import { games, gamesForPlayerCount, type Game, type Genre } from "./games";

/** The « Options » toggles. */
export type Filters = {
  /** Only games playable with strangers matched online. */
  strangers: boolean;
  /** Games fun over screen share; widens the list to the whole catalogue. */
  screenShare: boolean;
  /** Only games that work on a phone. */
  mobile: boolean;
  /** Only games playable without an account. */
  noAccount: boolean;
  /** Only the « New » games (src/fresh.ts). Offered only while the list has some. */
  fresh: boolean;
};

export const NO_FILTERS: Filters = {
  strangers: false,
  screenShare: false,
  mobile: false,
  noAccount: false,
  fresh: false,
};

export type GenreChoice = Genre | "all";

export type CatalogueView = {
  /** Everything that passes the player count, the search and the options. */
  base: Game[];
  /** `base` narrowed to the chosen genre: what the page lists. */
  list: Game[];
  /** « New » games the list would show with the « New » option off: the option's count. */
  freshCount: number;
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
  /** The games that wear « New » for this visitor (src/fresh.ts). */
  fresh: ReadonlySet<string>;
  /** Everything the search may match for a game, in the page's language. */
  searchText: (game: Game) => string;
}): CatalogueView {
  const { players, query, genre, filters, fresh, searchText } = options;
  const needle = normalizeForSearch(query.trim());
  const hasQuery = needle.length > 0;
  const wide = hasQuery || filters.screenShare;

  let base = wide ? games : gamesForPlayerCount(players);
  if (hasQuery) base = base.filter((game) => normalizeForSearch(searchText(game)).includes(needle));
  if (filters.strangers) base = base.filter((game) => game.soloWithStrangers);
  if (filters.screenShare) base = base.filter((game) => game.screenShare);
  if (filters.mobile) base = base.filter((game) => game.mobileFriendly);
  if (filters.noAccount) base = base.filter((game) => !game.accountNeeded);

  const inGenre = (game: Game) => genre === "all" || game.genre === genre;
  const freshCount = base.filter((game) => inGenre(game) && fresh.has(game.id)).length;
  // Just the new ones: newest first, since that is what the visitor came to see.
  if (filters.fresh) {
    base = base.filter((game) => fresh.has(game.id)).sort((a, b) => b.added.localeCompare(a.added));
  }

  const list = base.filter(inGenre);
  return { base, list, freshCount, hasQuery, wide };
}

export function activeFilterCount(filters: Filters): number {
  return Object.values(filters).filter(Boolean).length;
}
