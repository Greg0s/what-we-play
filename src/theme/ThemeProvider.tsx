import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../i18n/useIsomorphicLayoutEffect";
import {
  getStoredThemeMode,
  nextThemeMode,
  storeThemeMode,
  systemThemeMode,
  type ThemeMode,
} from "./config";
import { ThemeContext, type ThemeContextValue } from "./context";

function applyTheme(theme: ThemeMode) {
  // Light has no attribute at all — the CSS variables at `:root` already are
  // the light values, and `[data-theme="dark"]` only needs to exist to override
  // them.
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#1b1a20" : "#ffffff");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  // The inline script in index.html already set `data-theme` before the first
  // paint, so there is no flash to avoid here — this only brings React's own
  // state (the switcher's icon) in step with it. On a first visit nothing is
  // stored yet, so the OS preference is used and immediately remembered, the
  // same way the inline script resolved it for that first paint.
  useIsomorphicLayoutEffect(() => {
    const stored = getStoredThemeMode();
    const initial = stored ?? systemThemeMode();
    setModeState(initial);
    if (stored === null) storeThemeMode(initial);
  }, []);

  useIsomorphicLayoutEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storeThemeMode(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setMode(nextThemeMode(mode));
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, cycleTheme }),
    [mode, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
