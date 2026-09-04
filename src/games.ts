import gamesData from "./games.json";

export type Game = {
  id: string;
  name: string;
  minPlayers: number;
  /** `-1` means the game has no upper limit. */
  maxPlayers: number;
  link: string;
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

export const games: Game[] = gamesData;

/** Player count the site opens on, and the one the home page is prerendered at. */
export const DEFAULT_PLAYERS = 4;

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
