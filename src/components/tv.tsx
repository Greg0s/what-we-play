import type { ReactNode } from "react";
import { useRelief } from "../relief";
import { pawnClasses } from "../tv";
import "../stylesheets/tv.scss";
import "../stylesheets/mac.scss";

const PAWN_PATH =
  "M23 3.5a11.5 11.5 0 0 1 7.6 20.1c3.4.9 5.6 2.4 5.6 4 0 1.5-1.7 2.6-4.2 3.3 1.8 7.5 5.4 14 9.5 19.1v5.8H4.5V50c4.1-5.1 7.7-11.6 9.5-19.1-2.5-.7-4.2-1.8-4.2-3.3 0-1.6 2.2-3.1 5.6-4A11.5 11.5 0 0 1 23 3.5z";

const VENTS =
  "M252 306l6-4.4M262 299l6-4.4M272 292l6-4.4M282 285l6-4.4M292 278l6-4.4 M252 296l6-4.4M262 289l6-4.4M272 282l6-4.4M282 275l6-4.4M292 268l6-4.4 M252 286l6-4.4M262 279l6-4.4M272 272l6-4.4M282 265l6-4.4M292 258l6-4.4 M252 276l6-4.4M262 269l6-4.4M272 262l6-4.4M282 255l6-4.4M292 248l6-4.4";

/**
 * The mascot. Both drawings are always in the markup and `data-relief` on
 * <html> picks one (see src/relief/): the flat TV, or the same TV built as a
 * CSS 3D Mac with a pawn per player standing in front of it. The screen is the
 * same component in both; only its number of faces differs (the pawns carry
 * the head count in 3D).
 */
export function Tv({
  screen2d,
  screen3d,
  players,
  previousPlayers = null,
  hop = "",
  slot = "",
  pawnHop = "",
  set,
  className = "",
  children,
}: {
  screen2d: ReactNode;
  screen3d: ReactNode;
  players: number;
  /** Count before the last change, so pawns arrive or leave one by one. */
  previousPlayers?: number | null;
  /** `jp-a`/`jp-b`: the TV hops. */
  hop?: string;
  /** `sl-a`/`sl-b`: the floppy slot blinks. */
  slot?: string;
  /** `hop-a`/`hop-b`: the pawns hop when a floppy lands. */
  pawnHop?: string;
  /** Where the pawns stand: around the hero's Mac, or the phone's pick screen. */
  set: "desk" | "phone" | "pick";
  className?: string;
  /** Over the TV: the say bubble, a button… */
  children?: ReactNode;
}) {
  const { mode, view, phase, switchCount } = useRelief();
  const glitch = phase === "glitch" ? (switchCount % 2 ? "sw-glitch-a" : "sw-glitch-b") : "";
  const blink = phase === "after" && view === "2d" ? "sw-blink" : "";
  const arriving = view === "3d" && mode === "3d" && (phase === "glitch" || phase === "after");
  const leaving = view === "3d" && mode === "2d";
  const sign = players > 10 ? `+${players - 10}` : "";

  return (
    <div className={`tv tv--${set} ${className}`}>
      <div className={`sw-glitch ${glitch} ${blink}`} aria-hidden="true">
        <div className={`tv-body relief-2d ${hop} ${slot}`}>
          <svg className="tv-svg" viewBox="0 0 340 340" focusable="false">
            <polygon className="tv-sh" transform="translate(8 8)" points="22,84 51.7,62.4 64.9,62.4 64.9,52.8 88,36 308,36 308,282 242,330 22,330" />
            <polygon className="f" fill="#f2d9a6" points="242,84 271.7,62.4 271.7,72.4 284.9,62.8 284.9,52.8 308,36 308,282 242,330" />
            <polygon className="f" fill="#fff1d0" points="22,84 51.7,62.4 271.7,62.4 242,84" />
            <polygon className="f" fill="#c9a263" points="51.7,62.4 64.9,52.8 284.9,52.8 271.7,62.4" />
            <polygon className="f" fill="#fff1d0" points="64.9,52.8 88,36 308,36 284.9,52.8" />
            <rect className="f" fill="#5fcde8" x="22" y="84" width="220" height="228" />
            <rect className="f" fill="#3fb3d6" x="32" y="312" width="210" height="18" />
            <line className="f" x1="22" y1="262" x2="242" y2="262" />
            <rect className="f" fill="#3db2d6" x="42" y="104" width="180" height="142" rx="12" />
            <rect className="f" fill="#05121f" x="52" y="113" width="160" height="124" rx="9" />
            <circle cx="42" cy="287" r="6.5" fill="#ffe14d" />
            <path d="M35.5 287a6.5 6.5 0 0 0 13 0z" fill="#ff46af" />
            <circle className="f f2" cx="42" cy="287" r="6.5" fill="none" />
            <text className="tv-name" x="55" y="291">what we play</text>
            <rect x="140" y="282" width="80" height="7" rx="3.5" fill="#17121c" />
            <rect x="140" y="279" width="12" height="5" rx="1.5" fill="#17121c" />
            <circle cx="231" cy="285.5" r="2.4" fill="#17121c" />
            <path className="vent" d={VENTS} />
          </svg>
          {screen2d}
          <span className="slot-light" />
        </div>

        <div
          className={`m3-set relief-3d m3-${set}${arriving ? " is-arriving" : ""}${
            leaving ? " is-leaving" : ""
          } ${pawnHop}`}
        >
          <div className="m3-world">
            <div className={`m3-hop ${hop} ${slot}`}>
              <div className="m3">
                <i className="m3-shadow" />
                <div className="m3-f m3-back" />
                <div className="m3-f m3-left" />
                <div className="m3-f m3-right">
                  <i className="m3-notch" />
                  <i className="m3-vents" />
                </div>
                <div className="m3-f m3-top">
                  <i className="m3-groove" />
                </div>
                <div className="m3-f m3-front">
                  <i className="m3-bezel" />
                  {screen3d}
                  <i className="m3-seam" />
                  <i className="m3-dot" />
                  <span className="m3-name">what we play</span>
                  <i className="m3-slot" />
                  <span className="slot-light" />
                  <i className="m3-led" />
                  <i className="m3-foot" />
                </div>
              </div>
            </div>
            {pawnClasses(players, previousPlayers).map((classes, i) => (
              <div key={i} className={classes}>
                <div className="m3-pb">
                  <i className="m3-ps" />
                  <svg viewBox="0 0 46 66">
                    <path className="m3-pbody" d={PAWN_PATH} />
                    <rect className="m3-pbase" x="2.5" y="55" width="41" height="9" rx="3.5" />
                    <g className="m3-peyes">
                      <rect x="17" y="10" width="3.6" height="8.5" rx="1" />
                      <rect x="25.4" y="10" width="3.6" height="8.5" rx="1" />
                    </g>
                  </svg>
                </div>
              </div>
            ))}
            <div className={`m3-sign${sign ? "" : " is-out"}`}>
              <i className="m3-stick" />
              <span className="m3-board">{sign || "+1"}</span>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
