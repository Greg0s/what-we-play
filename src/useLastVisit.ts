import { useEffect, useState } from "react";

/** `{ since, last }`: when the previous visit began, and when this one did (epoch ms). */
export const VISIT_KEY = "what-we-play:visits";
/** Holds `since` for this browser session, so moving between pages doesn't use it up. */
export const VISIT_SESSION_KEY = "what-we-play:since";
/** Coming back within this long is the same visit (a second tab, a quick return). */
export const VISIT_GAP_MS = 3 * 60 * 60 * 1000;

type Visits = { since: number | null; last: number };

/**
 * When the visitor's previous visit began, or null on a first visit (or
 * without storage). Read once per browser session, so it stays the same while
 * they move from page to page.
 */
export function readLastVisit(now: number): number | null {
  try {
    const held = window.sessionStorage.getItem(VISIT_SESSION_KEY);
    if (held !== null) return held === "" ? null : Number(held);

    const raw = window.localStorage.getItem(VISIT_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<Visits>) : null;
    const last = typeof stored?.last === "number" ? stored.last : null;
    // A return within the gap continues that visit: it keeps the same « since ».
    const since = last === null ? null : now - last < VISIT_GAP_MS ? (stored?.since ?? null) : last;

    window.localStorage.setItem(VISIT_KEY, JSON.stringify({ since, last: now } satisfies Visits));
    window.sessionStorage.setItem(VISIT_SESSION_KEY, since === null ? "" : String(since));
    return since;
  } catch {
    return null;
  }
}

/**
 * The previous visit, once hydrated: null during the prerender and the first
 * client render, which therefore only know the catalogue-wide « New » games.
 */
export function useLastVisit(): number | null {
  const [since, setSince] = useState<number | null>(null);
  useEffect(() => {
    setSince(readLastVisit(Date.now()));
  }, []);
  return since;
}
