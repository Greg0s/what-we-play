import type { Translation } from "./i18n/locales";

/** Where a draw falls in the deck (see `useDeck`). */
export type Edge =
  /** The last game not drawn yet: the whole list has now come up. */
  | "last"
  /** The deck was through: this draw starts it over. */
  | "again"
  | null;

/**
 * What the TV says with a draw: which line of the locale, not its text, so a
 * language switch translates it. Chosen when the game is drawn, never during
 * render, since it is random.
 */
export type Say =
  | { kind: "first" }
  | { kind: "reroll"; tier: number; index: number }
  | { kind: "last" }
  | { kind: "again"; index: number }
  | { kind: "few" };

/** From how many rerolls each tier of `rerollLines` takes over: the TV loses patience. */
export const REROLL_TIERS = [1, 5, 10, 20] as const;

/** Up to this many games, a round is over every few draws: the TV remarks on the short list instead. */
export const FEW_GAMES = 3;

/** The tier of `rerollLines` for the nth reroll (1 = the first reroll). */
export function rerollTier(reroll: number): number {
  return REROLL_TIERS.reduce((tier, from, index) => (reroll >= from ? index : tier), 0);
}

/**
 * Which lines the TV has said, per situation (each tier of `rerollLines`,
 * `againLines`): like the games, none comes back before the others of the same
 * situation have. Kept for the whole visit, shared by the drawer and the phone
 * screen; only ever touched from a click handler or an effect.
 */
export type LineMemory = Map<string, { count: number; said: Set<number>; last: number | null }>;

export const createLineMemory = (): LineMemory => new Map();

/**
 * An index below `count` not said yet in `situation`. Once they all have, they
 * start over, never on the one just said. A locale with another number of
 * lines (a language switch) starts its own round.
 */
function dealLine(memory: LineMemory, situation: string, count: number): number {
  let round = memory.get(situation);
  if (!round || round.count !== count) {
    round = { count, said: new Set(), last: null };
    memory.set(situation, round);
  }
  if (round.said.size >= count) round.said.clear();
  const { said, last } = round;
  const left = [...Array(count).keys()].filter((index) => !said.has(index) && (index !== last || count < 2));
  const index = left[Math.floor(Math.random() * left.length)];
  said.add(index);
  round.last = index;
  return index;
}

const same = (a: Say, b: Say | null) => b !== null && JSON.stringify(a) === JSON.stringify(b);

/**
 * The line for a draw: the first one, the end of a round, or one of the
 * current tier, dealt from `memory` so none repeats before the others have
 * come up. `reroll` counts the rerolls since the draw opened (0 = the first draw).
 */
export function chooseSay(
  t: Translation,
  {
    reroll,
    edge,
    size,
    previous,
    memory,
  }: { reroll: number; edge: Edge; size: number; previous: Say | null; memory: LineMemory },
): Say {
  if (reroll === 0) return { kind: "first" };
  const few = size <= FEW_GAMES;
  if (few && edge === "again" && !same({ kind: "few" }, previous)) return { kind: "few" };
  if (!few && edge === "last") return { kind: "last" };
  if (!few && edge === "again") {
    return { kind: "again", index: dealLine(memory, "again", t.pick.againLines.length) };
  }
  const tier = rerollTier(reroll);
  return { kind: "reroll", tier, index: dealLine(memory, `reroll-${tier}`, t.pick.rerollLines[tier].length) };
}

/** The text of a line, in the page's language. */
export function sayLine(t: Translation, say: Say, players: number): string {
  switch (say.kind) {
    case "first":
      return t.pick.firstLine(players);
    case "reroll": {
      const lines = t.pick.rerollLines[say.tier];
      return lines[say.index % lines.length];
    }
    case "last":
      return t.pick.lastLine;
    case "again":
      return t.pick.againLines[say.index % t.pick.againLines.length];
    case "few":
      return t.pick.fewLine;
  }
}
