import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../i18n/useIsomorphicLayoutEffect";
import {
  DEFAULT_RELIEF,
  getStoredRelief,
  prefersReducedMotion,
  storeRelief,
  type ReliefMode,
} from "./config";
import { ReliefContext, type ReliefContextValue, type ReliefPhase } from "./context";

/** The anaglyph flicker; the drawing changes at its middle. */
const GLITCH_MS = 280;
/** Leaving 3D: the pawns hop off before the flicker starts. */
const HOP_OFF_MS = 220;
/** Back in 2D: the flat TV blinks once. */
const BLINK_MS = 420;
/** Into 3D: up to ten pawns drop in, 45 ms apart. */
const LAND_MS = 820;

/**
 * Both drawings are always in the markup (the prerender cannot know the
 * visitor's choice); `data-relief="3d"` on <html> is what shows the Mac and
 * hides the flat TV. The inline script in index.html sets it before the first
 * paint, so a 3D visitor never sees the 2D TV flash first.
 */
function applyRelief(view: ReliefMode) {
  if (view === "3d") {
    document.documentElement.setAttribute("data-relief", "3d");
  } else {
    document.documentElement.removeAttribute("data-relief");
  }
}

export function ReliefProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReliefMode>(DEFAULT_RELIEF);
  const [view, setView] = useState<ReliefMode>(DEFAULT_RELIEF);
  const [phase, setPhase] = useState<ReliefPhase>(null);
  const [switchCount, setSwitchCount] = useState(0);
  const timers = useRef<number[]>([]);

  // Only brings React's state in step with what the inline script already
  // drew: no animation on arrival.
  useIsomorphicLayoutEffect(() => {
    const stored = getStoredRelief();
    if (stored) {
      setMode(stored);
      setView(stored);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    applyRelief(view);
  }, [view]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const toggle = useCallback(() => {
    const next: ReliefMode = mode === "3d" ? "2d" : "3d";
    clearTimers();
    setMode(next);
    storeRelief(next);
    setSwitchCount((count) => count + 1);

    // Clicked back before the drawing changed, or no animations wanted:
    // straight to the end state.
    if (next === view || prefersReducedMotion()) {
      setView(next);
      setPhase(null);
      return;
    }

    const later = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };
    const pre = view === "3d" ? HOP_OFF_MS : 0;
    setPhase(pre ? "pre" : "glitch");
    if (pre) later(pre, () => setPhase("glitch"));
    later(pre + GLITCH_MS / 2, () => setView(next));
    later(pre + GLITCH_MS, () => setPhase("after"));
    later(pre + GLITCH_MS + (next === "3d" ? LAND_MS : BLINK_MS), () => setPhase(null));
  }, [mode, view]);

  const value = useMemo<ReliefContextValue>(
    () => ({ mode, view, phase, switchCount, toggle }),
    [mode, view, phase, switchCount, toggle],
  );

  return <ReliefContext.Provider value={value}>{children}</ReliefContext.Provider>;
}
