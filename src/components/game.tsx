import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FaHeart, FaUsers } from "react-icons/fa6";
import { TbArrowUpRight } from "react-icons/tb";
import type { Game as GameData } from "../games";
import type { CardTag } from "../ui";

/** The « Coup de cœur »: its tag, and the TV's note when there is one. */
export type Featured = {
  label: string;
  /** What the TV says about the game, or null: then the TV is only a drawing. */
  note: string | null;
  noteTitle: string;
  /** The TV button's accessible name. */
  readNote: string;
};

export function Game({
  id,
  name,
  genre,
  genreLabel,
  description,
  playLink,
  favicon,
  playerRange,
  tags,
  fresh,
  featured,
  extra = false,
  playLabel,
}: {
  id: string;
  name: string;
  genre: GameData["genre"];
  genreLabel: string;
  description: string;
  playLink: string;
  favicon: string;
  playerRange: string;
  tags: CardTag[];
  /** The « New » tag's label, or null for a game that isn't new. */
  fresh: string | null;
  /** Set only on the « Coup de cœur » (src/featured.ts). */
  featured: Featured | null;
  /** Shown although the player count leaves it out (the « Coup de cœur » on opening): not one of the list's games. */
  extra?: boolean;
  playLabel: string;
}) {
  const play = {
    target: "_blank",
    rel: "noopener",
    href: playLink,
    "data-umami-event": "Play game",
    "data-umami-event-game": id,
    "data-umami-event-from": "list",
  };

  const body = (title: ReactNode, tv: ReactNode) => (
    <>
      <span className={`game__band gc-${genre}`}>
        <span className="game__genre">{genreLabel}</span>
        <span className="game__range">
          <FaUsers aria-hidden="true" />
          {playerRange}
        </span>
      </span>
      <span className="game__body">
        <span className="game__head">
          <span className="game__fav">
            <img className="game__favicon" src={favicon} alt="" loading="lazy" width="24" height="24" />
          </span>
          <h3>{title}</h3>
          {tv}
        </span>
        <span className="game__desc">{description}</span>
        <span className="game__meta">
          {featured && (
            <span className="game__tag is-featured">
              <FaHeart aria-hidden="true" />
              {featured.label}
            </span>
          )}
          {fresh && <span className="game__tag is-new">{fresh}</span>}
          {tags.map((tag) => (
            <span key={tag.label} className={`game__tag${tag.warn ? " is-warn" : ""}`}>
              {tag.label}
            </span>
          ))}
          <span className="game__play">
            {playLabel}
            <TbArrowUpRight aria-hidden="true" />
          </span>
        </span>
      </span>
    </>
  );

  // With a note, the TV is a button, and a button can't sit inside a link: the
  // card becomes a box whose title link stretches over all of it (`.game__link`).
  if (featured?.note) {
    return (
      <div className={`game is-featured has-note${extra ? " is-extra" : ""}`}>
        {body(
          <a className="game__link" {...play}>
            {name}
          </a>,
          <TvNote id={id} featured={featured} note={featured.note} />,
        )}
      </div>
    );
  }

  // Without one, the TV is a drawing inside the card's link, which it opens like the rest of the card.
  return (
    <a className={`game${featured ? " is-featured" : ""}${extra ? " is-extra" : ""}`} {...play}>
      {body(
        name,
        featured && (
          <span className="game__tv">
            <MiniTv />
          </span>
        ),
      )}
    </a>
  );
}

/**
 * The small TV and what it says. On a mouse it speaks while hovered; a click
 * (or a tap, on a touch screen) keeps the bubble open until the next click,
 * Escape, or a click anywhere else.
 */
function TvNote({ id, featured, note }: { id: string; featured: Featured; note: string }) {
  const [open, setOpen] = useState<"hover" | "pinned" | null>(null);
  const spot = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const noteId = useId();

  useEffect(() => {
    if (open !== "pinned") return;
    const away = (event: PointerEvent) => {
      if (!spot.current?.contains(event.target as Node)) setOpen(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(null);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <span className="game__tv" ref={spot}>
      <button
        ref={button}
        type="button"
        className="game__tv-btn"
        aria-label={featured.readNote}
        aria-expanded={open !== null}
        aria-controls={noteId}
        data-umami-event="Read note"
        data-umami-event-game={id}
        onClick={() => setOpen((state) => (state === "pinned" ? null : "pinned"))}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen((state) => state ?? "hover");
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setOpen((state) => (state === "hover" ? null : state));
        }}
      >
        <MiniTv />
      </button>
      <span className="game__note" id={noteId} role="note" hidden={open === null}>
        <span className="game__note-title">{featured.noteTitle}</span>
        {note}
      </span>
    </span>
  );
}

const HEART =
  "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z";

/** The mascot, small and seen from the front, with hearts for eyes. */
function MiniTv() {
  return (
    <svg className="mini-tv" viewBox="0 0 46 44" width="46" height="44" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="38" height="38" rx="3" className="mini-tv__shadow" />
      <rect x="2" y="2" width="38" height="38" rx="3" fill="#5fcde8" stroke="#17121c" strokeWidth="2" />
      <rect x="6" y="6" width="30" height="22" rx="4" fill="#3db2d6" stroke="#17121c" strokeWidth="1.6" />
      <rect x="9" y="8.5" width="24" height="17" rx="3" fill="#05121f" />
      <g className="mini-tv__eyes" fill="#ff46af">
        <g transform="translate(12.2 12.3) scale(.32)">
          <path d={HEART} />
        </g>
        <g transform="translate(22 12.3) scale(.32)">
          <path d={HEART} />
        </g>
      </g>
      <line x1="2" y1="32" x2="40" y2="32" stroke="#17121c" strokeWidth="1.6" />
      <circle cx="8" cy="36" r="2" fill="#ffe14d" stroke="#17121c" strokeWidth="1" />
      <rect x="22" y="35" width="13" height="2.4" rx="1.2" fill="#17121c" />
    </svg>
  );
}
