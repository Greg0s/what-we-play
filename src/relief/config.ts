export const RELIEF_MODES = ["2d", "3d"] as const;

/** How the TV is drawn: flat (2D, the default) or as a CSS 3D Mac with a pawn per player. */
export type ReliefMode = (typeof RELIEF_MODES)[number];

export const DEFAULT_RELIEF: ReliefMode = "2d";

/**
 * Must match the literal used by the anti-flash script in `index.html`: that
 * script runs before React and cannot import this module.
 */
export const STORAGE_KEY = "what-we-play:relief";

export function isReliefMode(value: string): value is ReliefMode {
  return (RELIEF_MODES as readonly string[]).includes(value);
}

/** Reads the mode previously chosen by the user, if any. */
export function getStoredRelief(): ReliefMode | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== null && isReliefMode(stored) ? stored : null;
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
    return null;
  }
}

export function storeRelief(mode: ReliefMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Not being able to remember the choice is not a reason to fail.
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
