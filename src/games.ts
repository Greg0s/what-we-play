import gamesData from "./games.json";

export type Game = {
  id: string;
  name: string;
  minPlayers: number;
  /** `-1` means the game has no upper limit. */
  maxPlayers: number;
  link: string;
};

export const games: Game[] = gamesData;

/** Player count the site opens on, and the one the home page is prerendered at. */
export const DEFAULT_PLAYERS = 4;

export function matchesPlayerCount(game: Game, players: number): boolean {
  return (
    (players >= game.minPlayers && players <= game.maxPlayers) ||
    game.maxPlayers === -1
  );
}

export function gamesForPlayerCount(players: number): Game[] {
  return games.filter((game) => matchesPlayerCount(game, players));
}
