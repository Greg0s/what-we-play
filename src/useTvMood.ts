import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { Mood } from "./tv";
import { useTimers } from "./useTimers";

type Flash = Extract<Mood, "happy" | "wow" | "read"> | null;

const quarter = (value: number) => Math.round(Math.max(-1, Math.min(1, value)) * 4) / 4;

/**
 * The TV's passing moods, over its resting one: it reads while you type,
 * smiles when results come back, goes round-eyed when one game is left. Its
 * eyes follow the pointer, and look down at the search box while it has focus.
 */
export function useTvMood(resultCount: number) {
  const { later } = useTimers();
  const [flash, setFlash] = useState<Flash>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [lookDown, setLookDown] = useState(false);
  const count = useRef(resultCount);
  const previousCount = useRef(resultCount);
  count.current = resultCount;

  const show = useCallback(
    (mood: Flash, ms: number, then?: () => void) => {
      setFlash(mood);
      later("mood", ms, () => (then ? then() : setFlash(null)));
    },
    [later],
  );

  /** One game left after a pause: wow, otherwise back to rest. */
  const settle = useCallback(() => {
    if (count.current === 1) show("wow", 900);
    else setFlash(null);
  }, [show]);

  const onType = useCallback(() => show("read", 900, settle), [show, settle]);
  const onPlayersChange = useCallback(() => show("happy", 760, settle), [show, settle]);

  // Any other change to the list (a genre, an option): react to what it did.
  useEffect(() => {
    const before = previousCount.current;
    previousCount.current = resultCount;
    if (flash === "read" || before === resultCount) return;
    if (resultCount === 1) show("wow", 900);
    else if (before === 0 && resultCount > 0) show("happy", 700);
  }, [resultCount, flash, show]);

  /** Pointer over the banner, relative to the screen's centre. */
  const follow = useCallback((event: MouseEvent<HTMLElement>, screen: DOMRect | null) => {
    if (!screen) return;
    const x = quarter((event.clientX - (screen.left + screen.width / 2)) / 420);
    const y = quarter((event.clientY - (screen.top + screen.height / 2)) / 320);
    setGaze((current) => (current.x === x && current.y === y ? current : { x, y }));
  }, []);

  const rest = useCallback(() => setGaze({ x: 0, y: 0 }), []);

  return {
    flash,
    gaze: lookDown ? { x: -0.75, y: 1 } : gaze,
    setLookDown,
    onType,
    onPlayersChange,
    follow,
    rest,
  };
}
