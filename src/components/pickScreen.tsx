import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FaChevronLeft, FaUsers } from "react-icons/fa6";
import { TbArrowUpRight, TbDice5 } from "react-icons/tb";
import { gameLink, type Game } from "../games";
import { useTranslation } from "../i18n";
import { useRelief } from "../relief";
import { prefersReducedMotion } from "../relief/config";
import { buildScreen, GENRE_COLORS, REEL_ORDER, type Mood } from "../tv";
import { useTimers } from "../useTimers";
import { Floppy, Floppy3d } from "./floppy";
import { GlassesSwitch } from "./glassesSwitch";
import { Tv } from "./tv";
import { TvScreen } from "./tvScreen";
import { cardTags } from "../ui";
import "../stylesheets/floppy.scss";
import "../stylesheets/pick.scss";

type Vars = CSSProperties & Record<`--${string}`, string>;

/** The face between draws, as [mood, ms]: OPEN when the screen opens, LAND when a floppy lands, then LOOP forever. */
const FACE_LAND: [Mood, number][] = [["wow", 650], ["happy", 1500], ["look", 1300], ["read", 2000], ["idle", 2400]];
const FACE_LOOP: [Mood, number][] = [
  ["wink", 520], ["idle", 2800], ["look", 1200], ["idle", 2600],
  ["happy", 900], ["idle", 3200], ["sleepy", 2600], ["idle", 2000],
];

type Phase = "reels" | "eject" | "landed";

/**
 * What fills the empty slot while the first draw spins: three floppies in the
 * genres' colours, the front one pulled out and slipped to the back, like a deck.
 */
function PickLoader({ caption, out }: { caption: string; out: boolean }) {
  return (
    <div className={`ps-loader${out ? " is-gone" : ""}`} aria-hidden="true">
      <div className="ld-art">
        {(["drawing", "words", "fun"] as const).map((genre) => (
          <span key={genre} className="ld-fl">
            <i className="ld-sh" />
            <i className={`ld-lb gc-${genre}`} />
          </span>
        ))}
      </div>
      <p className="ld-cap">{caption}</p>
    </div>
  );
}

/**
 * « Pick for us » on a phone: a whole screen of its own (not a page: no URL),
 * the TV on top asking, the floppy ticket with the game under it. The TV keeps
 * living between draws: it marvels, smiles, reads the ticket, winks, dozes off.
 */
export function PickScreen({
  list,
  players,
  wide,
  onClose,
}: {
  /** The games on the list when the screen opened. */
  list: Game[];
  players: number;
  /** The list ignored the player count. */
  wide: boolean;
  onClose: () => void;
}) {
  const { t, language, gameDescription } = useTranslation();
  const { phase: reliefPhase, switchCount } = useRelief();
  const { later, stop } = useTimers();
  const [pickId, setPickId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("reels");
  const [stops, setStops] = useState(0);
  const [line, setLine] = useState(0);
  const [face, setFace] = useState<Mood>("happy");
  const [cheer, setCheer] = useState(false);
  const back = useRef<HTMLButtonElement>(null);
  const tvBox = useRef<HTMLDivElement>(null);
  const ticket = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<Vars>({});

  const runFace = useCallback(
    (sequence: [Mood, number][], index: number) => {
      const steps = index >= sequence.length ? FACE_LOOP : sequence;
      const at = index >= sequence.length ? 0 : index;
      const [mood, ms] = steps[at];
      setFace(mood);
      later("face", ms, () => runFace(steps, at + 1));
    },
    [later],
  );

  const draw = useCallback(
    (avoid: string | null) => {
      const pool = list.length > 1 ? list.filter((game) => game.id !== avoid) : list;
      const next = pool[Math.floor(Math.random() * pool.length)];
      const quick = prefersReducedMotion();
      stop("face");
      setNextId(next.id);
      setPhase("reels");
      setStops(0);
      later("l", quick ? 0 : 500, () => setStops(1));
      later("r", quick ? 0 : 680, () => setStops(2));
      later("e", quick ? 0 : 920, () => {
        setPickId(next.id);
        setPhase("eject");
        runFace(FACE_LAND, 0);
      });
      later("d", quick ? 0 : 1400, () => setPhase("landed"));
    },
    [later, list, runFace, stop],
  );

  // Opening the screen is the first draw. Its timers are cleared on the way
  // out, so React's StrictMode replay (dev only) simply draws again.
  useEffect(() => {
    draw(null);
    back.current?.focus();
    return () => ["l", "r", "e", "d", "face"].forEach(stop);
    // The list is the one the screen opened with: it never changes while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const reroll = () => {
    if (phase !== "landed") {
      // A second press lands the spinning draw on the spot.
      ["l", "r", "e", "d"].forEach(stop);
      if (nextId && nextId !== pickId) setPickId(nextId);
      setPhase("landed");
      runFace(FACE_LAND, 0);
      return;
    }
    setLine((n) => n + 1);
    draw(pickId);
  };

  // Touch screens have no hover: the finger landing on « Start playing »
  // (touchstart comes before the new tab opens) or keyboard focus makes the
  // TV hop and smile, then it goes back to idle.
  const onCheer = () => {
    if (phase !== "landed" || cheer) return;
    setFace("happy");
    setCheer(true);
    later("cheer", 320, () => setCheer(false));
    later("face", 1400, () => runFace(FACE_LOOP, 1));
  };

  const game = list.find((item) => item.id === (pickId ?? nextId)) ?? null;
  const spinning = phase === "reels";
  const ejecting = phase === "eject";

  // The ticket flies out of the slot: measured, like the drawer's floppy.
  useLayoutEffect(() => {
    if (!ejecting) return;
    const slot = tvBox.current
      ?.querySelector(
        document.documentElement.getAttribute("data-relief") === "3d"
          ? ".m3-front .slot-light"
          : ".tv-body .slot-light",
      )
      ?.getBoundingClientRect();
    const rest = ticket.current?.getBoundingClientRect();
    if (!slot || !rest) return;
    setFlight({
      "--ej-x": `${Math.round(slot.left + slot.width / 2 - (rest.left + rest.width / 2))}px`,
      "--ej-y": `${Math.round(slot.top + slot.height / 2 - (rest.top + rest.height / 2))}px`,
    });
  }, [ejecting]);

  const genre = game?.genre ?? null;
  const mood: Mood = spinning ? "reels" : face;
  const screen = useMemo(
    () =>
      buildScreen({
        count: 1,
        mood,
        gaze: { x: 0, y: 0 },
        colorAt: () => (genre && !spinning ? GENRE_COLORS[genre] : "#c9f6ff"),
        popFrom: -1,
      }),
    [genre, mood, spinning],
  );
  const target = list.find((item) => item.id === nextId);
  const reelStop = Math.max(0, REEL_ORDER.indexOf(target?.genre ?? "drawing"));
  const reelPhase = stops === 0 ? "spin" : stops === 1 ? "stop1" : "stop2";
  const face2d = <TvScreen screen={screen} mood={mood} reelPhase={spinning ? reelPhase : null} reelStop={reelStop} />;
  const glitch = reliefPhase === "glitch" ? (switchCount % 2 ? "sw-glitch-a" : "sw-glitch-b") : "";

  const say =
    line === 0 ? t.pick.firstLine(players) : t.pick.rerollLines[(line - 1) % t.pick.rerollLines.length];
  const tags = game ? cardTags(game, t) : [];
  // Before the first ticket comes out, the slot stays empty: the game is
  // already known (it sizes the zone) but hidden until it ejects.
  const flCls = spinning ? (pickId ? "is-out" : "is-wait") : ejecting ? "is-eject" : "";
  // Meanwhile a waiting screen holds the empty slot, and fades as the ticket flies out over it.
  const loading = line === 0 && phase !== "landed";

  return (
    <div className="pick-screen" role="dialog" aria-modal="true" aria-label={t.pick.title}>
      <div className="ps-bar">
        <button ref={back} type="button" className="ps-back" onClick={onClose}>
          <FaChevronLeft aria-hidden="true" />
          {t.pick.back}
        </button>
        <GlassesSwitch />
      </div>

      <div className="ps-main">
        <div className="ps-head">
          <div className="ps-say-w">
            <p id="pick-say" key={line} className={`ps-say${line ? " say-a" : ""}`}>
              {say}
            </p>
          </div>
          <div ref={tvBox}>
            <Tv
              set="pick"
              players={players}
              screen2d={face2d}
              screen3d={face2d}
              hop={ejecting || cheer ? "is-hop" : ""}
              slot={ejecting ? "is-slot" : ""}
              pawnHop={ejecting ? "hop-a" : ""}
            />
          </div>
        </div>

        <p className="sr" aria-live="polite">
          {game && phase !== "reels" ? t.pick.chosen(game.name) : loading ? t.pick.loading : ""}
        </p>
        <div className={`fl-zone ps-ticket ${glitch}`} ref={ticket}>
          {loading && <PickLoader caption={t.pick.loading} out={ejecting} />}
          {game && (
            <div className={`fl-move ${flCls}`} style={flight}>
              {(["2d", "3d"] as const).map((dim) => {
                const label = (
                  <section className="ps-lbl">
                    <div className={`band gc-${game.genre}`}>
                      <span>{t.genres[game.genre].band}</span>
                      <span className="band-range">
                        <FaUsers aria-hidden="true" />
                        {t.content.playerRange(game.minPlayers, game.maxPlayers)}
                      </span>
                    </div>
                    <div className="ps-lbl-body">
                      <h2 className={`ps-name${game.name.length > 14 ? " is-long" : ""}`}>{game.name}</h2>
                      <p className="clamp3">{gameDescription(game.id)}</p>
                      {tags.length > 0 && (
                        <div className="ps-tags">
                          {tags.map((tag) => (
                            <span key={tag.label} className={`btag${tag.warn ? " is-warn" : ""}`}>
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                      <a
                        className="ink-btn"
                        href={gameLink(game, language)}
                        target="_blank"
                        rel="noopener"
                        onTouchStart={onCheer}
                        onFocus={onCheer}
                      >
                        {t.pick.launch}
                        <TbArrowUpRight aria-hidden="true" />
                        <span className="sr">, {t.pick.newTab}</span>
                      </a>
                    </div>
                  </section>
                );
                return dim === "2d" ? (
                  <div key={dim} className="floppy-w relief-2d">
                    <Floppy>{label}</Floppy>
                  </div>
                ) : (
                  <Floppy3d key={dim} className="f3-pick relief-3d">
                    <Floppy>{label}</Floppy>
                  </Floppy3d>
                );
              })}
            </div>
          )}
        </div>

        <div className="ps-actions">
          {/* Nothing to reroll until the first ticket is out: the button waits, holding its place. */}
          <button type="button" className={`reroll${pickId ? "" : " is-wait"}`} onClick={reroll}>
            <TbDice5 aria-hidden="true" />
            {t.pick.reroll}
          </button>
          <p className="ps-note">{t.pick.note(list.length, wide ? null : players)}</p>
        </div>
      </div>

      <div className="ps-stripes" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
