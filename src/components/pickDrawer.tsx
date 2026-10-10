import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { FaXmark } from "react-icons/fa6";
import { TbArrowUpRight, TbDice5 } from "react-icons/tb";
import { gameLink, type Game } from "../games";
import { useTranslation } from "../i18n";
import { useRelief } from "../relief";
import { labelSize } from "../ui";
import { Floppy, Floppy3d } from "./floppy";
import "../stylesheets/floppy.scss";
import "../stylesheets/pick.scss";

type Vars = CSSProperties & Record<`--${string}`, string>;

/**
 * Under the banner, while a game is picked: the game, how to launch it, a
 * reroll, and the floppy the TV ejected. The floppy's flight starts at the
 * TV's slot, wherever the layout puts it, so it is measured rather than set.
 */
export function PickDrawer({
  game,
  players,
  note,
  classes,
  rerollBusy,
  onReroll,
  onClose,
  slotRect,
}: {
  game: Game;
  players: number;
  note: string;
  classes: { drawerCls: string; fadeCls: string; ejectCls: string };
  rerollBusy: boolean;
  onReroll: () => void;
  onClose: () => void;
  /** Where the TV's slot is on screen right now. */
  slotRect: () => DOMRect | null;
}) {
  const { t, language, gameDescription, playersLabel } = useTranslation();
  const { phase, switchCount } = useRelief();
  const anchor = useRef<HTMLSpanElement>(null);
  const [flight, setFlight] = useState<Vars>({});

  // Measured before paint, as the eject (or the trip back in) starts.
  useLayoutEffect(() => {
    if (!classes.ejectCls) return;
    const rest = anchor.current?.getBoundingClientRect();
    const slot = slotRect();
    if (!rest || !slot) return;
    const dx = `${Math.round(slot.left + slot.width / 2 - (rest.left + rest.width / 2))}px`;
    const dy = `${Math.round(slot.top + slot.height / 2 - (rest.top + rest.height / 2))}px`;
    setFlight({ "--ej-x": dx, "--ej-y": dy });
  }, [classes.ejectCls, slotRect]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const glitch = phase === "glitch" ? (switchCount % 2 ? "sw-glitch-a" : "sw-glitch-b") : "";
  const band = `${t.genres[game.genre].chip} · ${players} ${playersLabel(players)}`;
  const label = (
    <>
      <span className={`lbl-band gc-${game.genre}`}>{band}</span>
      <span className="lbl-name" style={{ fontSize: labelSize(game.name) }}>
        {game.name}
      </span>
    </>
  );

  return (
    <div className={`drawer-wrap ${classes.drawerCls}`}>
      <div className="drawer-in">
        <section className="drawer" aria-labelledby="pick-name">
          <div className={`d-main ${classes.fadeCls}`}>
            <h2 id="pick-name" className="d-name">
              {game.name}
            </h2>
            <p className="d-desc">{gameDescription(game.id)}</p>
            <div className="d-pills">
              <span className={`pill pill-genre gc-${game.genre}`}>{t.genres[game.genre].band}</span>
              <span className="pill pill-line">{t.content.playerRange(game.minPlayers, game.maxPlayers)}</span>
            </div>
          </div>
          <div className="d-stub">
            <a className="ink-btn" href={gameLink(game, language)} target="_blank" rel="noopener">
              {t.pick.launch}
              <TbArrowUpRight aria-hidden="true" />
              <span className="sr">, {t.pick.newTab}</span>
            </a>
            <button type="button" className={`ret ret-row${rerollBusy ? " is-busy" : ""}`} onClick={onReroll}>
              <TbDice5 aria-hidden="true" />
              {t.pick.reroll}
            </button>
            <p className="d-note">{note}</p>
          </div>
          <div className="d-slot" />
          <button type="button" className="d-close" onClick={onClose} aria-label={t.pick.close}>
            <FaXmark aria-hidden="true" />
          </button>
        </section>
        <div className={`fl-zone ${glitch}`} aria-hidden="true">
          <span className="fl-anchor" ref={anchor} />
          <div className={`floppy-w relief-2d ${classes.ejectCls}`} style={flight}>
            <Floppy>{label}</Floppy>
          </div>
          <Floppy3d className={`f3-desk relief-3d ${classes.ejectCls}`} style={flight}>
            <Floppy>{label}</Floppy>
          </Floppy3d>
        </div>
      </div>
    </div>
  );
}
