export const THEME_MODES = ["light", "dark"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

/**
 * Must match the literal used by the anti-flash script in `index.html`: that
 * script runs before React and cannot import this module.
 */
export const STORAGE_KEY = "what-we-play:theme";

export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value);
}

/** The mode a click on the switcher moves to: light → dark → light. */
export function nextThemeMode(mode: ThemeMode): ThemeMode {
  return mode === "light" ? "dark" : "light";
}

/** Reads the theme previously chosen by the user, if any. */
export function getStoredThemeMode(): ThemeMode | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== null && isThemeMode(stored) ? stored : null;
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
    return null;
  }
}

export function storeThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Not being able to remember the choice is not a reason to fail.
  }
}

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** The mode to use on a first visit, before anything was ever stored. */
export function systemThemeMode(): ThemeMode {
  return prefersDark() ? "dark" : "light";
}
