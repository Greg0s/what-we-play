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
  minPlayers: number;
  /** `-1` means the game has no upper limit. */
  maxPlayers: number;
  link: string;
  /**
   * The game's own page in a given language, for the few sites that address
   * their translations by URL. Languages missing here use `link`.
   */
  localizedLinks?: Partial<Record<Language, string>>;
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
};

export const games: Game[] = gamesData as Game[];

// The JSON import types `genre` as any string, so a typo would slip past the
// compiler. The prerender imports this module, so a bad genre fails the build.
for (const game of games) {
  if (!(GENRES as readonly string[]).includes(game.genre)) {
    throw new Error(`Unknown genre "${game.genre}" for ${game.id} in src/games.json`);
  }
}

/** Player count the site opens on, and the one the home page is prerendered at. */
export const DEFAULT_PLAYERS = 4;

/** Where to send someone reading the site in `language`. */
export function gameLink(game: Game, language: Language): string {
  return game.localizedLinks?.[language] ?? game.link;
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
