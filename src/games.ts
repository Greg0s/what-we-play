import gamesData from "./games.json" with { type: "json" };
import type { Language } from "./i18n/config";

/**
 * What kind of game it is, for the « Feel like… » chips. Each one has a colour
 * of its own (`$genre-colors` in src/stylesheets/_variables.scss) and a label
 * in every locale (`genres`).
 */
export const GENRES = ["drawing", "words", "trivia", "music", "geography", "movies", "fun"] as const;

export type Genre = (typeof GENRES)[number];

export type Game = {
  id: string;
  name: string;
  /**
   * The day the game joined the catalogue, `YYYY-MM-DD`. It decides which
   * games are « New » (src/fresh.ts). The games already there when the
   * history starts all share its first day.
   */
  added: string;
  minPlayers: number;
  /** `-1` means the game has no upper limit. */
  maxPlayers: number;
  link: string;
  /**
   * The game's own page in a given language, for the few sites that address
   * their translations by URL. Languages missing here use `link`.
   */
  localizedLinks?: Partial<Record<Language, string>>;
  /**
   * The game's icon, served from `public/` (e.g. `/favicons/abyssion.png`),
   * for the sites Google's favicon service has no icon for. Without it, the
   * card asks Google for the icon of `link`'s host.
   */
  favicon?: string;
  genre: Genre;
  /** Playable with just yourself. */
  solo: boolean;
  /** Playable solo against strangers matched online. */
  soloWithStrangers: boolean;
  /** Playable with people you know, together. */
  multiplayer: boolean;
  /** Playable with everyone looking at one shared screen. */
  screenShare: boolean;
  /** Works well on a phone's screen. */
  mobileFriendly: boolean;
  /** Requires creating or signing into an account to play. */
  accountNeeded: boolean;
  /**
   * Makes this game the « Coup de cœur du moment », instead of the one drawn
   * for the week (src/featured.ts). At most one game.
   */
  featured?: boolean;
};

export const games: Game[] = gamesData as Game[];

// The JSON import types `genre` as any string, so a typo would slip past the
// compiler. The prerender imports this module, so a bad genre fails the build.
for (const game of games) {
  if (!(GENRES as readonly string[]).includes(game.genre)) {
    throw new Error(`Unknown genre "${game.genre}" for ${game.id} in src/games.json`);
  }
  // Same reasoning: a missing or malformed date would quietly never be « New ».
  if (!/^\d{4}-\d{2}-\d{2}$/.test(game.added ?? "") || Number.isNaN(Date.parse(game.added))) {
    throw new Error(`Missing or malformed "added" date for ${game.id} in src/games.json (expected YYYY-MM-DD)`);
  }
}
// « Du moment »: one favourite at a time, so a forgotten flag can't make two.
const featured = games.filter((game) => game.featured);
if (featured.length > 1) {
  throw new Error(`Only one game can be "featured" in src/games.json, found ${featured.map((game) => game.id).join(", ")}`);
}

/** Player count the site opens on, and the one the home page is prerendered at. */
export const DEFAULT_PLAYERS = 4;

/** Where to send someone reading the site in `language`. */
export function gameLink(game: Game, language: Language): string {
  return game.localizedLinks?.[language] ?? game.link;
}

/** The icon shown on the game's card. */
export function gameFavicon(game: Game): string {
  if (game.favicon) return game.favicon;
  const { hostname } = new URL(game.link);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function matchesPlayerCount(game: Game, players: number): boolean {
  return (
    players >= game.minPlayers &&
    (game.maxPlayers === -1 || players <= game.maxPlayers)
  );
}

export function gamesForPlayerCount(players: number): Game[] {
  return games.filter((game) => matchesPlayerCount(game, players));
}

/** "4", "1–20" or "3+" — purely numeric, so it needs no translation. */
export function playerRangeShort(min: number, max: number): string {
  if (max === -1) return `${min}+`;
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}
