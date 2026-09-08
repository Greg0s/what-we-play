import { createContext } from "react";
import type { ThemeMode } from "./config";

export type ThemeContextValue = {
  /** What the user chose (or, on a first visit, the OS preference). */
  mode: ThemeMode;
  /** Advances the mode: light → dark → light. */
  cycleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
