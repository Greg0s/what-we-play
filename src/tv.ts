/**
 * The TV's screen: a video call with one pair of eyes per player. Everything
 * here is in TV units (u), the units of the TV drawing's 340 × 340 viewBox;
 * the stylesheets turn them into pixels with `calc(var(--u) * …)`, so the same
 * screen works at every size the TV is drawn at.
 */
import type { Genre } from "./games";

export type Mood =
  | "idle" // blinks
  | "happy" // smiling arcs
  | "wow" // round eyes: one game left
  | "sad" // nothing matches, a tear rolls
  | "read" // eyes scan the search box
  | "reels" // slot machine reels while a pick spins
  | "look" // looks down at the floppy ticket
  | "wink"
  | "sleepy";

/** Where the slot machine reels stand: spinning, left one stopped, both stopped. */
export type ReelPhase = "spin" | "stop1" | "stop2";

export const GENRE_COLORS: Record<Genre, string> = {
  drawing: "#ff9fd4",
  words: "#ffe14d",
  trivia: "#ffb35c",
  music: "#bba8ff",
  geography: "#8ee5b3",
  movies: "#ff9a86",
  fun: "#7fd8f0",
};

/** The reels' colour cells, top to bottom (the eighth repeats the first, for the wrap). */
export const REEL_ORDER: readonly Genre[] = [
  "drawing",
  "words",
  "trivia",
  "music",
  "geography",
  "movies",
  "fun",
];

/** One colour per player on the call, in order. */
const EYE_COLORS = [
  "#c9f6ff", "#ffe14d", "#ff9fd4", "#8ee5b3", "#ffb35c", "#bba8ff",
  "#ff9a86", "#7fd8f0", "#ffffff", "#ffe14d", "#ff9fd4", "#8ee5b3",
];
export const DEFAULT_EYE = EYE_COLORS[0];

/** Columns of the call grid for 1 to 12 tiles. */
const COLS = [1, 2, 2, 2, 3, 3, 4, 4, 3, 4, 4, 4];
/** Tiles on the call: past this, the last one reads « +N ». */
export const MAX_TILES = 12;
/** Height of one reel cell. */
export const REEL_CELL = 34;

/** Inner screen: 160 × 124 u, 6 u padding, 4 u gaps. */
const INNER_W = 148;
const INNER_H = 112;

export type ScreenTile = {
  /** Tile size. */
  w: number;
  h: number;
  /** « +N » instead of a face. */
  more: string | null;
  color: string;
  /** Pops in (after a player count change). */
  pop: boolean;
  popDelay: number;
  /** Gaze offset of the face. */
  fx: number;
  fy: number;
  /** Half the distance between the eyes. */
  half: number;
  /** Eye box and the drop of its centre below 58%. */
  ew: number;
  eh: number;
  drop: number;
  /** Border width of the smiling arcs. */
  arc: number;
  blinkDuration: number;
  blinkDelay: number;
};

export type Screen = {
  tiles: ScreenTile[];
  /** Tiles per row: the call is laid out row by row, so it can never wrap. */
  cols: number;
  solo: boolean;
  /** Where each face's tear starts, from its tile's top-left corner, and its scale. */
  tear: { x: number; y: number; s: number };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;
const floorTo = (value: number) => Math.floor(value * 100) / 100;

/**
 * Lays out the call for `count` people (one big face when `count` is 1),
 * with the eye shape for `mood` and the face turned by `gaze` (each axis −1…1).
 */
export function buildScreen(options: {
  count: number;
  mood: Mood;
  gaze: { x: number; y: number };
  colorAt: (index: number) => string;
  /** Tiles from this index on pop in (−1: none). */
  popFrom: number;
}): Screen {
  const { count, mood, gaze, colorAt, popFrom } = options;
  const solo = count === 1;
  const shown = Math.min(count, MAX_TILES);
  const cols = COLS[shown - 1];
  const rows = Math.ceil(shown / cols);
  // Rounded down, with a hair to spare: a row of tiles fills the screen's
  // width exactly (4 × 34 + 3 gaps = 148 at 7 or 8 players), so any rounding
  // up by the browser would push it past the edge.
  const tw = floorTo((INNER_W - (cols - 1) * 4) / cols - 0.05);
  const th = floorTo((INNER_H - (rows - 1) * 4) / rows - 0.05);
  const eh = solo ? 32 : Math.min(30, th * 0.42, tw * 0.5);
  const ew = solo ? 13 : eh * 0.4;
  const spread = solo ? 70 : Math.min(tw * 0.42, 60);
  const rx = Math.min(10, tw * 0.14);
  const ry = Math.min(7, th * 0.1);
  const sadDrop = Math.min(7, th * 0.12);

  let w = ew;
  let h = eh;
  let drop = 0;
  let arc = 0;
  if (mood === "happy") {
    w = eh * 0.8;
    h = eh * 0.45;
    arc = clamp(eh * 0.15, 2, 4.5);
  } else if (mood === "wow") {
    w = eh * 0.6;
    h = eh * 0.6;
  } else if (mood === "sad") {
    h = eh * 0.55;
    drop = sadDrop;
  } else if (mood === "reels") {
    w = 16;
    h = REEL_CELL;
  } else if (mood === "sleepy") {
    h = Math.max(3, eh * 0.16);
    drop = Math.min(6, th * 0.1);
  }

  const still = mood === "reels" || mood === "sad";
  const tiles: ScreenTile[] = [];
  for (let i = 0; i < shown; i += 1) {
    const isMore = count > MAX_TILES && i === MAX_TILES - 1;
    tiles.push({
      w: round(tw),
      h: round(th),
      more: isMore ? `+${count - (MAX_TILES - 1)}` : null,
      color: colorAt(i),
      pop: popFrom >= 0 && i >= popFrom,
      popDelay: Math.max(0, (i - popFrom) * 25),
      fx: still ? 0 : round(gaze.x * rx),
      fy: still ? 0 : round(gaze.y * ry),
      half: round(spread / 2),
      ew: round(w),
      eh: round(h),
      drop: round(drop),
      arc: round(arc),
      blinkDuration: round(4.2 + (i % 4) * 0.6),
      blinkDelay: round(i * 0.37),
    });
  }

  return {
    tiles,
    cols,
    solo,
    tear: {
      x: round(tw / 2 + spread / 2 - 2.5),
      y: round(th * 0.58 + sadDrop + eh * 0.275 + (solo ? 14 : th * 0.06)),
      // A crowd's small faces get smaller tears.
      s: round(clamp(eh / 20, 0.6, 1)),
    },
  };
}

/** Eye colours: per player at rest, the genre's while one is chosen or picked. */
export function eyeColor(index: number, genre: Genre | null): string {
  return genre ? GENRE_COLORS[genre] : EYE_COLORS[index % EYE_COLORS.length];
}

/** Pawns standing in front of the 3D Mac: one per player, ten at most. */
export const MAX_PAWNS = 10;

/**
 * Class lists of the ten pawn slots. `previous` is the player count just
 * before a change (null when nothing moves): newcomers drop in one by one and
 * leavers hop off from the last one, 45 ms apart.
 */
export function pawnClasses(players: number, previous: number | null): string[] {
  const shown = Math.min(players, MAX_PAWNS);
  const before = previous === null ? shown : Math.min(previous, MAX_PAWNS);
  return Array.from({ length: MAX_PAWNS }, (_, i) => {
    const inside = i < shown;
    let delay = 0;
    if (inside && i >= before) delay = i - before;
    if (!inside && i < before) delay = before - 1 - i;
    return [
      "m3-pawn",
      `p${i + 1}`,
      delay ? `d${Math.min(delay, 9)}` : "",
      inside ? "" : "is-out",
    ]
      .filter(Boolean)
      .join(" ");
  });
}
