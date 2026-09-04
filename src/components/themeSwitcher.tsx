import { FaCircleHalfStroke, FaMoon, FaSun } from "react-icons/fa6";
import "../stylesheets/themeSwitcher.scss";
import { useTranslation } from "../i18n";
import { nextThemeMode, useTheme, type ThemeMode } from "../theme";

/** The icon shows the mode that's currently active. */
const MODE_ICON: Record<ThemeMode, typeof FaMoon> = {
  system: FaCircleHalfStroke,
  light: FaSun,
  dark: FaMoon,
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, cycleTheme } = useTheme();

  // The label describes what a click does, i.e. the mode it switches *to*.
  const next = nextThemeMode(mode);
  const Icon = MODE_ICON[mode];
  const label = t.theme[next];

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="theme-switcher"
      onClick={cycleTheme}
    >
      <Icon className="theme-switcher__icon" />
    </button>
  );
}
