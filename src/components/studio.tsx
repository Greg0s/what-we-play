import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from "react";
import type { PadKey } from "../ui";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { TbCornerDownLeft, TbDice5 } from "react-icons/tb";
import { useTranslation } from "../i18n";
import { useIsomorphicLayoutEffect } from "../i18n/useIsomorphicLayoutEffect";
import "../stylesheets/studio.scss";

/** Smallest size the H1 steps down to, in 4 px steps from the stylesheet's. */
const MIN_TITLE_PX = 48;

/**
 * On the wide stage the bubble sits right above the keypad: a third line of
 * question would slide under it. How wide a line is depends on the language,
 * the player count and how the browser renders Honk, so the H1 is measured,
 * once the font has loaded and on every resize, and shrinks until it holds on
 * two lines. Only there: when the banner stacks, the bubble may grow.
 */
function useFitTwoLines(question: readonly [string, string]) {
  const ref = useRef<HTMLHeadingElement>(null);

  const fit = useCallback(() => {
    const title = ref.current;
    const bubble = title?.parentElement;
    if (!title || !bubble) return;
    title.style.fontSize = "";
    if (getComputedStyle(bubble).position !== "absolute") return;

    const lines = () => {
      const style = getComputedStyle(title);
      return Math.round(title.offsetHeight / parseFloat(style.lineHeight));
    };
    let size = parseFloat(getComputedStyle(title).fontSize);
    while (lines() > 2 && size > MIN_TITLE_PX) {
      size -= 4;
      title.style.fontSize = `${size}px`;
    }
  }, []);

  useIsomorphicLayoutEffect(fit, [fit, question[0], question[1]]);

  useEffect(() => {
    let active = true;
    document.fonts?.ready.then(() => active && fit());
    window.addEventListener("resize", fit);
    return () => {
      active = false;
      window.removeEventListener("resize", fit);
    };
  }, [fit]);

  return ref;
}

/**
 * The banner: the TV asks the page's question in its bubble, and the keypad
 * plugged into it answers with how many you are. Its Enter key draws a game.
 * One markup for every width: a fixed stage on wide screens, a stack below.
 */
export function Studio({
  question,
  bubbleCls,
  tv,
  tvZoneRef,
  say,
  keys,
  players,
  total,
  onLess,
  onMore,
  onPick,
  pickDisabled,
  pickBusy,
  onPointerMove,
  onPointerLeave,
}: {
  question: readonly [string, string];
  bubbleCls: string;
  tv: ReactNode;
  tvZoneRef: RefObject<HTMLDivElement | null>;
  /** What the TV says while a pick is open, above it. */
  say: { line: string; className: string } | null;
  keys: PadKey[];
  players: number;
  /** Size of the whole catalogue, on the round sticker. */
  total: number;
  onLess: () => void;
  onMore: () => void;
  onPick: () => void;
  pickDisabled: boolean;
  pickBusy: boolean;
  onPointerMove: (event: MouseEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}) {
  const { t } = useTranslation();
  const big = players >= 10;
  // Honk is wide: past 14 characters a line no longer fits the bubble at full
  // size (English, mostly). A first guess for the prerender; useFitTwoLines
  // has the last word once the font is there.
  const long = Math.max(question[0].length, question[1].length) > 14;
  const title = useFitTwoLines(question);

  return (
    <section
      className={`studio${big ? " is-big" : ""}`}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
    >
      <div className="stage">
        <div className={`bubble ${bubbleCls}`}>
          <h1 ref={title} className={`b-h1${long ? " is-long" : ""}`}>
            <span>{question[0]}</span> <span>{question[1]}</span>
          </h1>
          <svg className="tail" width="96" height="60" viewBox="0 0 96 60" preserveAspectRatio="none" aria-hidden="true">
            <path className="tail-p" d="M0 6 L92 34 L0 50" />
            <rect className="tail-m" x="-4" y="9" width="7" height="38" />
          </svg>
        </div>

        <svg className="cord" width="220" height="80" viewBox="0 0 220 80" aria-hidden="true">
          <path
            className="cord-p"
            d="M0 22 C 18 22 20 40 34 40 c 8 0 10 -14 4 -16 c -6 -2 -8 14 2 18 c 10 4 14 -14 8 -16 c -6 -2 -8 14 2 18 c 10 4 14 -14 8 -16 c -6 -2 -8 14 2 18 c 10 4 14 -14 8 -16 c -6 -2 -8 14 2 18 C 96 52 140 52 162 40 S 186 30 214 30"
          />
        </svg>

        <div className="tv-zone" ref={tvZoneRef}>
          {tv}
          {say && (
            <p className={`tv-say ${say.className}`} aria-hidden="true">
              {say.line}
            </p>
          )}
        </div>

        <p className="badge2">{t.header.handPicked(total)}</p>

        <nav className="deck" aria-label={t.header.playerCount}>
          <span className="tape" aria-hidden="true">
            {t.header.howMany}
          </span>
          <div className="keys">
            {keys.map((key) => (
              <a
                key={key.label}
                className={`key pad-key${key.current ? " is-on" : ""}${key.label.length > 2 ? " is-ten" : ""}`}
                href={key.href}
                aria-current={key.current ? "page" : undefined}
                onClick={key.onClick}
              >
                {key.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            className={`ret ret-enter${pickBusy ? " is-busy" : ""}`}
            onClick={onPick}
            aria-disabled={pickDisabled}
          >
            <TbDice5 className="ret-enter__dice" aria-hidden="true" />
            <span className="ret-enter__label">{t.pick.button}</span>
            <TbCornerDownLeft className="ret-enter__arrow" aria-hidden="true" />
            {pickDisabled && <span className="sr">{t.pick.noGame}</span>}
          </button>
          {big && (
            <div className="tab">
              <button type="button" className="key tab-key" onClick={onLess} aria-label={t.header.removePlayer}>
                <FaMinus aria-hidden="true" />
              </button>
              <span className="tab-n" aria-live="polite">
                {players}
              </span>
              <button type="button" className="key tab-key" onClick={onMore} aria-label={t.header.addPlayer}>
                <FaPlus aria-hidden="true" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </section>
  );
}
