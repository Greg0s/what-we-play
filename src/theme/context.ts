import { createContext } from "react";
import type { ResolvedTheme, ThemeMode } from "./config";

export type ThemeContextValue = {
  /** What the user chose: "system" follows the OS preference. */
  mode: ThemeMode;
  /** "system" resolved against the OS preference, otherwise the mode itself. */
  resolvedTheme: ResolvedTheme;
  /** Advances the mode: system → light → dark → system. */
  cycleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
