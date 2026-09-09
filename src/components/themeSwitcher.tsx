import { useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import "../stylesheets/themeSwitcher.scss";
import { useTranslation } from "../i18n";
import { nextThemeMode, useTheme, type ThemeMode } from "../theme";

/** The icon shows the mode that's currently active. */
const MODE_ICON: Record<ThemeMode, typeof FaMoon> = {
  light: FaSun,
  dark: FaMoon,
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, cycleTheme } = useTheme();
  // Startup also swaps the icon once, when ThemeProvider resolves the stored
  // or OS-preferred mode — that swap must stay silent, so the animation only
  // plays once a click has actually happened.
  const [animateIcon, setAnimateIcon] = useState(false);

  // The label describes what a click does, i.e. the mode it switches *to*.
  const next = nextThemeMode(mode);
  const Icon = MODE_ICON[mode];
  const label = t.theme[next];

  const handleClick = () => {
    setAnimateIcon(true);
    cycleTheme();
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="theme-switcher"
      onClick={handleClick}
    >
      <Icon
        className={
          animateIcon
            ? "theme-switcher__icon theme-switcher__icon--animate"
            : "theme-switcher__icon"
        }
      />
    </button>
  );
}
