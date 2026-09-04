import { useEffect, useRef, useState } from "react";
import "./App.scss";
import { Games, HowItWorks, LanguageSwitcher, ThemeSwitcher } from "./components/";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useTranslation } from "./i18n";
import { DEFAULT_LANGUAGE, detectLanguage } from "./i18n/config";
import { useIsomorphicLayoutEffect } from "./i18n/useIsomorphicLayoutEffect";
import { buildPath, parseRoute, type Route } from "./routes";
import { useDocumentMeta } from "./useDocumentMeta";

function App({ route }: { route: Route }) {
  const [players, setPlayers] = useState(route.players);
  const [isHome, setIsHome] = useState(route.isHome);
  const { t, playersLabel, language, setLanguage } = useTranslation();

  // How the next URL change should be recorded. Discrete moves — a language
  // switch, a click on a player-count link — deserve a history entry. Typing in
  // the counter does not: it would push one entry per keystroke.
  const historyMode = useRef<"pushState" | "replaceState">("pushState");

  useDocumentMeta({ language, players, isHome });

  // A prefixed URL states the language outright, so it wins. Only the
  // unprefixed entry points fall back to the visitor's own preference, and the
  // history entry is replaced so Back cannot bounce between / and /fr/.
  const detected = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (detected.current) return;
    detected.current = true;
    if (route.language !== DEFAULT_LANGUAGE) return;

    const preferred = detectLanguage();
    if (preferred === route.language) return;

    setLanguage(preferred);
    window.history.replaceState(
      null,
      "",
      buildPath({ language: preferred, players, isHome }),
    );
  }, [route.language, players, isHome, setLanguage]);

  // Keeps the address bar on the page you are actually looking at, so the URL
  // stays shareable.
  //
  // The mount pass is skipped: the URL is where the route came from, so there is
  // nothing to write — and this effect would otherwise run holding the language
  // from before detection ran, pushing the pre-redirect path back on top of it.
  const synced = useRef(false);
  useEffect(() => {
    if (!synced.current) {
      synced.current = true;
      return;
    }

    const path = buildPath({ language, players, isHome });
    if (window.location.pathname !== path) {
      window.history[historyMode.current](null, "", path);
      historyMode.current = "pushState";
    }
  }, [language, players, isHome]);

  useEffect(() => {
    const onPopState = () => {
      const next = parseRoute(window.location.pathname);
      setPlayers(next.players);
      setIsHome(next.isHome);
      setLanguage(next.language);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setLanguage]);

  const handleChange = (value: number) => {
    if (value < 1) return;
    historyMode.current = "replaceState";
    setPlayers(value);
    setIsHome(false);
  };

  return (
    <>
      <header>
        <div className="header-actions">
          <ThemeSwitcher />
          <HowItWorks />
          <LanguageSwitcher />
        </div>
        <h1>{t.header.title}</h1>
        <div className="how-many">
          <div className="how-many__buttons">
            <button
              aria-label={t.header.addPlayer}
              onClick={() => handleChange(players + 1)}
              type="button"
              className="how-many__buttons__plus"
            >
              <FaPlus />
            </button>
            <input
              type="number"
              min={1}
              max={99}
              aria-label={t.header.playerCount}
              value={players}
              onChange={(e) => handleChange(Number(e.target.value))}
            />
            <button
              aria-label={t.header.removePlayer}
              onClick={() => handleChange(players - 1)}
              type="button"
              className="how-many__buttons__minus"
            >
              <FaMinus />
            </button>
          </div>
          <span className="how-many__label">{playersLabel(players)}</span>
        </div>
      </header>

      <main>
        <Games players={players} />
      </main>
    </>
  );
}

export default App;
