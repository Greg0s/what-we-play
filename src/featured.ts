/**
 * Which game is the « Coup de cœur du moment ». A game marked `"featured":
 * true` in games.json wins; otherwise one is dealt for the week, the same for
 * every visitor and every page: every game gets a week before any gets a
 * second one.
 *
 * The draw is seeded by the week, not random at render: the prerender and the
 * browser must agree (see Rendering in CLAUDE.md). The app asks for the week
 * the site was built (`__BUILD_DAY__`), and the deploy workflow rebuilds it
 * every Monday, so the pick changes weekly with nobody touching anything.
 */
import { games } from "./games";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** A Monday: weeks run Monday to Sunday, in UTC. */
const FIRST_MONDAY = Date.parse("1970-01-05");

/** Weeks since FIRST_MONDAY of `day` (`YYYY-MM-DD`). */
export function weekOf(day: string): number {
  return Math.floor((Date.parse(day) - FIRST_MONDAY) / WEEK_MS);
}

/** A small seeded random generator (mulberry32): the same seed gives the same numbers, at build time and in the browser. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The catalogue shuffled for the `round`-th pass, by index. */
function shuffled(round: number): number[] {
  const order = games.map((_, index) => index);
  const random = seeded(round + 1);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * The game for a week, dealt like a deck: the weeks go through the catalogue
 * in a shuffled order, so no game comes back before every other has had its
 * week. A new pass starts with a new shuffle, never on the game that ended
 * the last one.
 */
function dealt(week: number): number {
  const count = games.length;
  const round = Math.floor(week / count);
  const order = shuffled(round);
  const previousLast = shuffled(round - 1)[count - 1];
  // The pass would open on the game that just closed the last one: swap its first two.
  if (order[0] === previousLast) [order[0], order[1]] = [order[1], order[0]];
  return order[week % count];
}

/** The id of the « Coup de cœur » in the week of `day` (`YYYY-MM-DD`). */
export function featuredId(day: string): string {
  const chosen = games.find((game) => game.featured);
  if (chosen) return chosen.id;
  return games[dealt(weekOf(day))].id;
}
