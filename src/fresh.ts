/**
 * Which games wear the « New » tag. One label for two reasons, because the
 * difference doesn't matter to the visitor:
 *
 * - the last `LATEST_COUNT` games added to the catalogue, for everyone. Pure
 *   data, so the prerender draws these tags too;
 * - for a returning visitor, every game added since their last visit. That
 *   needs `localStorage`, so it only joins in after hydration (`useLastVisit`).
 *
 * The latest ones are counted over the whole catalogue, never per player
 * count: on a page few new games fit, the « latest five » would otherwise reach
 * back to launch-day games. Launch-day games are never new.
 */
import { games, type Game } from "./games";

export const LATEST_COUNT = 5;

/** The catalogue's first day: the games already there when its history starts. */
const FIRST_DAY = games.reduce((first, game) => (game.added < first ? game.added : first), games[0].added);

/** Newest first; on the same day, the one further down games.json (added later) first. */
const byNewest = games
  .map((game, index) => ({ game, index }))
  .filter(({ game }) => game.added > FIRST_DAY)
  .sort((a, b) => b.game.added.localeCompare(a.game.added) || b.index - a.index)
  .map(({ game }) => game);

export const latestIds: ReadonlySet<string> = new Set(byNewest.slice(0, LATEST_COUNT).map((game) => game.id));

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Added after `since` (epoch ms). A game's date has no time, so it counts as
 * added at the end of its day: one put online the afternoon of a visit is
 * still new on the next one.
 */
export function addedSince(game: Game, since: number): boolean {
  return game.added > FIRST_DAY && Date.parse(game.added) + DAY_MS > since;
}

/** Everything that wears « New » for a visitor whose previous visit began at `since` (null: first visit, or unknown). */
export function freshIds(since: number | null): ReadonlySet<string> {
  if (since === null) return latestIds;
  const ids = new Set(latestIds);
  for (const game of games) if (addedSince(game, since)) ids.add(game.id);
  return ids;
}

/** Only what arrived since the last visit: what the TV announces, so a regular isn't told about the same games every time. */
export function arrivedIds(since: number | null): ReadonlySet<string> {
  if (since === null) return new Set();
  return new Set(games.filter((game) => addedSince(game, since)).map((game) => game.id));
}
