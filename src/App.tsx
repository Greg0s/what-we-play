import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { TbDice5 } from "react-icons/tb";
import "./App.scss";
import "./stylesheets/intro.scss";
import logo from "../what-we-play.png";
import {
  Games,
  GlassesSwitch,
  HowItWorks,
  LanguageSwitcher,
  PickDrawer,
  PickScreen,
  Studio,
  ThemeSwitcher,
  Tv,
  TvScreen,
} from "./components/";
import { cardTags, isPlainClick, type PadKey } from "./ui";
import { NO_FILTERS, viewCatalogue, type Filters, type GenreChoice } from "./catalogue";
import { DEFAULT_PLAYERS, games, type Game } from "./games";
import { useTranslation } from "./i18n";
import { DEFAULT_LANGUAGE, detectLanguage } from "./i18n/config";
import { useIsomorphicLayoutEffect } from "./i18n/useIsomorphicLayoutEffect";
import { useRelief } from "./relief";
import { buildPath, parseRoute, type Route } from "./routes";
import { buildScreen, DEFAULT_EYE, eyeColor, GENRE_COLORS, MAX_TILES, type Mood } from "./tv";
import { useDocumentMeta } from "./useDocumentMeta";
import { useDeck } from "./useDeck";
import { usePick } from "./usePick";
import { useTimers } from "./useTimers";
import { useTvMood } from "./useTvMood";

/**
 * Comfortably past the end of the page-load entrance in intro.scss (its last
 * card finishes about 1.1s after first paint, and first paint always comes
 * before this effect runs). After it, cards that mount because of a filter or
 * a player-count change appear without replaying the entrance.
 */
const INTRO_DURATION_MS = 1500;

/** The keypad's keys; « 10+ » opens a stepper for bigger groups. */
const PAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MAX_PLAYERS = 99;

/** Below this width the banner is the phone's: « Pick for us » floats and opens a screen. */
const PHONE_QUERY = "(max-width: 639px)";

type PickScreenState = { list: Game[]; players: number; wide: boolean };

function App({ route }: { route: Route }) {
  const [players, setPlayers] = useState(route.players);
  const [isHome, setIsHome] = useState(route.isHome);
  const { t, language, setLanguage, gameDescription, gameKeywords } = useTranslation();
  const relief = useRelief();
  const { later } = useTimers();

  // How the next URL change should be recorded. Discrete moves — a language
  // switch, a key of the keypad — deserve a history entry. Stepping past ten
  // does not: it would push one entry per click.
  const historyMode = useRef<"pushState" | "replaceState">("pushState");

  useDocumentMeta({ language, players, isHome });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      document.documentElement.dataset.intro = "done";
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, []);

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
    window.history.replaceState(null, "", buildPath({ language: preferred, players, isHome }));
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

  // ------------------------------------------------------------ the catalogue

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<GenreChoice>("all");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const searchText = useCallback(
    (game: Game) =>
      [
        game.name,
        gameDescription(game.id),
        ...gameKeywords(game.id),
        t.genres[game.genre].chip,
        t.genres[game.genre].band,
        ...cardTags(game, t).map((tag) => tag.label),
      ].join(" "),
    [gameDescription, gameKeywords, t],
  );

  const view = useMemo(
    () => viewCatalogue({ players, query, genre, filters, searchText }),
    [players, query, genre, filters, searchText],
  );
  const count = view.list.length;

  // ------------------------------------------------------------ the TV

  const tv = useTvMood(count);
  const draw = useDeck(view.list);
  const pick = usePick(view.list, draw, { flat: relief.view !== "3d" });
  const tvZone = useRef<HTMLDivElement>(null);

  // A player count change: the bubble bounces, newcomers' faces pop onto the
  // call, and in 3D their pawns drop in (or leavers hop off) one by one.
  const [bump, setBump] = useState<{ n: number; popFrom: number; previous: number | null }>({
    n: 0,
    popFrom: -1,
    previous: null,
  });

  const changePlayers = (value: number, mode: "pushState" | "replaceState") => {
    const next = Math.min(MAX_PLAYERS, Math.max(1, value));
    if (next === players && !isHome) return;
    const wasSolo = players === 1 || pick.open || pick.phase !== null;
    historyMode.current = mode;
    pick.reset();
    tv.onPlayersChange();
    setBump((current) => ({
      n: current.n + 1,
      popFrom: wasSolo ? 1 : Math.min(players, MAX_TILES),
      previous: players,
    }));
    later("bump", 700, () => setBump((current) => ({ ...current, popFrom: -1, previous: null })));
    setPlayers(next);
    setIsHome(false);
  };

  const keys: PadKey[] = PAD.map((key) => ({
    label: key === 10 ? "10+" : String(key),
    href: buildPath({ language, players: key, isHome: false }),
    current: key === 10 ? players >= 10 : players === key,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      changePlayers(key === 10 ? Math.max(10, players) : key, "pushState");
    },
  }));

  const drawerOpen = pick.open;
  const mood: Mood = pick.phase
    ? "reels"
    : count === 0
      ? "sad"
      : tv.flash === "read" || tv.flash === "wow"
        ? tv.flash
        : tv.flash === "happy" || drawerOpen
          ? "happy"
          : "idle";

  const colorAt = (index: number) => {
    if (pick.phase) return DEFAULT_EYE;
    if (drawerOpen && pick.pick) return GENRE_COLORS[pick.pick.genre];
    return eyeColor(index, genre === "all" ? null : genre);
  };

  // The flat TV shows the whole call; the Mac a single face, its pawns carry
  // the head count. While a pick is on, everyone hands over to one face.
  const solo2d = players === 1 || pick.phase !== null || drawerOpen;
  const screen2d = buildScreen({
    count: solo2d ? 1 : players,
    mood,
    gaze: tv.gaze,
    colorAt,
    popFrom: solo2d ? -1 : bump.popFrom,
  });
  const screen3d = buildScreen({ count: 1, mood, gaze: tv.gaze, colorAt, popFrom: -1 });
  const reels = { reelPhase: pick.phase, reelStop: pick.reelStop };

  const screenRect = () =>
    tvZone.current
      ?.querySelector(relief.view === "3d" ? ".m3-front .scr" : ".tv-body .scr")
      ?.getBoundingClientRect() ?? null;

  const slotRect = useCallback(
    () =>
      tvZone.current
        ?.querySelector(relief.view === "3d" ? ".m3-front .slot-light" : ".tv-body .slot-light")
        ?.getBoundingClientRect() ?? null,
    [relief.view],
  );

  // ------------------------------------------------------------ picking

  const [pickScreen, setPickScreen] = useState<PickScreenState | null>(null);
  const fab = useRef<HTMLButtonElement>(null);

  const openPickScreen = () => {
    if (count === 0) return;
    setPickScreen({ list: view.list, players, wide: view.wide });
  };

  const closePickScreen = useCallback(() => {
    setPickScreen(null);
    fab.current?.focus();
  }, []);

  const onPick = () => {
    if (count === 0) return;
    if (window.matchMedia(PHONE_QUERY).matches) openPickScreen();
    else pick.start();
  };

  const say = drawerOpen
    ? {
        line:
          pick.line === 0
            ? t.pick.firstLine(players)
            : t.pick.rerollLines[(pick.line - 1) % t.pick.rerollLines.length],
        className: pick.classes.sayCls,
      }
    : null;

  // ------------------------------------------------------------ home

  // The logo always returns to the language's own landing page — no player
  // count, no search, no genre, no options.
  const homeRoute: Route = { language, players: DEFAULT_PLAYERS, isHome: true };
  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    historyMode.current = "pushState";
    pick.reset();
    setQuery("");
    setGenre("all");
    setFilters(NO_FILTERS);
    setPlayers(DEFAULT_PLAYERS);
    setIsHome(true);
  };

  return (
    <>
      <header className="top">
        <a className="brand" href={buildPath(homeRoute)} onClick={goHome}>
          <img src={logo} alt="" width="44" height="44" />
          <span>{t.header.title}</span>
        </a>
        <div className="top__actions">
          <HowItWorks />
          <LanguageSwitcher />
          <GlassesSwitch />
          <ThemeSwitcher />
        </div>
      </header>

      <main>
        <Studio
          question={t.header.question(players)}
          bubbleCls={bump.n ? (bump.n % 2 ? "bp-a" : "bp-b") : ""}
          tvZoneRef={tvZone}
          tv={
            <Tv
              set="desk"
              players={players}
              previousPlayers={bump.previous}
              hop={pick.classes.hop || (bump.popFrom >= 0 ? (bump.n % 2 ? "jp-a" : "jp-b") : "")}
              slot={pick.classes.slot}
              pawnHop={pick.classes.pawnHop}
              screen2d={<TvScreen screen={screen2d} mood={mood} share={filters.screenShare} {...reels} />}
              screen3d={<TvScreen screen={screen3d} mood={mood} share={filters.screenShare} {...reels} />}
            />
          }
          say={say}
          keys={keys}
          players={players}
          total={games.length}
          onLess={() => changePlayers(Math.max(10, players - 1), "replaceState")}
          onMore={() => changePlayers(players + 1, "replaceState")}
          onPick={onPick}
          pickDisabled={count === 0}
          pickBusy={pick.phase !== null}
          onPointerMove={(event) => tv.follow(event, screenRect())}
          onPointerLeave={tv.rest}
        />

        <p className="sr" aria-live="polite">
          {drawerOpen && !pick.phase && pick.pick ? t.pick.chosen(pick.pick.name) : ""}
        </p>

        {drawerOpen && pick.pick && (
          <PickDrawer
            game={pick.pick}
            players={players}
            note={t.pick.note(count, view.wide ? null : players)}
            classes={pick.classes}
            rerollBusy={pick.phase !== null}
            onReroll={pick.start}
            onClose={pick.close}
            slotRect={slotRect}
          />
        )}

        <Games
          players={players}
          view={view}
          query={query}
          onQuery={(value) => {
            setQuery(value);
            tv.onType();
          }}
          onSearchFocus={tv.setLookDown}
          genre={genre}
          onGenre={setGenre}
          filters={filters}
          onFilter={(key) => setFilters((current) => ({ ...current, [key]: !current[key] }))}
          onResetFilters={() => setFilters(NO_FILTERS)}
        />
      </main>

      <div className="fab-dock">
        <button
          ref={fab}
          type="button"
          className="fab"
          onClick={openPickScreen}
          aria-disabled={count === 0}
          aria-haspopup="dialog"
        >
          <TbDice5 aria-hidden="true" />
          {t.pick.button}
          {count === 0 && <span className="sr">{t.pick.noGame}</span>}
        </button>
      </div>

      {pickScreen && (
        <PickScreen
          list={pickScreen.list}
          players={pickScreen.players}
          wide={pickScreen.wide}
          draw={draw}
          onClose={closePickScreen}
        />
      )}
    </>
  );
}

export default App;
