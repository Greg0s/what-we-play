import { createContext } from "react";
import type { ReliefMode } from "./config";

/**
 * Where a switch between 2D and 3D stands. `pre`: the pawns hop off before the
 * Mac goes; `glitch`: the red/cyan anaglyph flicker, halfway through which the
 * drawing changes; `after`: the flat TV blinks, or the pawns drop in.
 */
export type ReliefPhase = "pre" | "glitch" | "after" | null;

export type ReliefContextValue = {
  /** What the user chose: flips the moment they click. */
  mode: ReliefMode;
  /** What is drawn: lags `mode` until the middle of the glitch. */
  view: ReliefMode;
  phase: ReliefPhase;
  /** Bumped on every switch, so the one-shot animations can restart. */
  switchCount: number;
  toggle: () => void;
};

export const ReliefContext = createContext<ReliefContextValue | null>(null);
