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

/** A random index below `count`, never `previous` when there is a choice. */
function randomIndex(count: number, previous: number | null): number {
  if (previous === null || previous >= count || count < 2) return Math.floor(Math.random() * count);
  const index = Math.floor(Math.random() * (count - 1));
  return index >= previous ? index + 1 : index;
}

const same = (a: Say, b: Say | null) => b !== null && JSON.stringify(a) === JSON.stringify(b);

/**
 * The line for a draw: the first one, the end of a round, or one of the
 * current tier, never the one just said. `reroll` counts the rerolls since
 * the draw opened (0 = the first draw).
 */
export function chooseSay(
  t: Translation,
  { reroll, edge, size, previous }: { reroll: number; edge: Edge; size: number; previous: Say | null },
): Say {
  if (reroll === 0) return { kind: "first" };
  const few = size <= FEW_GAMES;
  if (few && edge === "again" && !same({ kind: "few" }, previous)) return { kind: "few" };
  if (!few && edge === "last") return { kind: "last" };
  if (!few && edge === "again") {
    return {
      kind: "again",
      index: randomIndex(t.pick.againLines.length, previous?.kind === "again" ? previous.index : null),
    };
  }
  const tier = rerollTier(reroll);
  const lines = t.pick.rerollLines[tier];
  const last = previous?.kind === "reroll" && previous.tier === tier ? previous.index : null;
  return { kind: "reroll", tier, index: randomIndex(lines.length, last) };
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
