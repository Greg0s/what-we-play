import { useCallback, useRef } from "react";
import type { Game } from "./games";

/**
 * The draw, without repeats: every game on the list comes up once before any
 * comes up again, like dealing a shuffled deck. Once the deck is through it
 * starts over, never on the game just drawn. A new list (another player count,
 * search, genre or option) is a new deck.
 */
export function useDeck(list: Game[]) {
  const deck = useRef<{ list: Game[]; drawn: Set<string>; last: string | null }>({
    list,
    drawn: new Set(),
    last: null,
  });

  /** Only ever called from a click handler or an effect: never during render. */
  const draw = useCallback((): Game | null => {
    if (list.length === 0) return null;
    if (deck.current.list !== list) deck.current = { list, drawn: new Set(), last: null };
    const current = deck.current;
    let pool = list.filter((game) => !current.drawn.has(game.id));
    if (pool.length === 0) {
      current.drawn.clear();
      pool = list.length > 1 ? list.filter((game) => game.id !== current.last) : list;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    current.drawn.add(next.id);
    current.last = next.id;
    return next;
  }, [list]);

  return draw;
}
