import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../i18n/useIsomorphicLayoutEffect";
import {
  getStoredThemeMode,
  nextThemeMode,
  resolveTheme,
  storeThemeMode,
  type ResolvedTheme,
  type ThemeMode,
} from "./config";
import { ThemeContext, type ThemeContextValue } from "./context";

function applyTheme(theme: ResolvedTheme) {
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
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // The inline script in index.html already set `data-theme` before the first
  // paint, so there is no flash to avoid here — this only brings React's own
  // state (the switcher's icon) in step with whichever mode the user chose on
  // a previous visit.
  useIsomorphicLayoutEffect(() => {
    const stored = getStoredThemeMode() ?? "system";
    setModeState(stored);
    setResolvedTheme(resolveTheme(stored));
  }, []);

  useIsomorphicLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Only "system" needs to keep watching: an explicit light/dark choice should
  // not move just because the OS preference changes underneath it.
  useEffect(() => {
    if (mode !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(resolveTheme("system"));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setResolvedTheme(resolveTheme(next));
    storeThemeMode(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setMode(nextThemeMode(mode));
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, cycleTheme }),
    [mode, resolvedTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
