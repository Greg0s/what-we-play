/**
 * Who gets invited to install the app, and when. Everything here is pure or
 * guarded, so it can be unit-reasoned about and never runs during the
 * prerender (the hook only calls it from effects).
 */

export const STORAGE_KEY = "what-we-play:install";
/** Set for the length of a browser session, so a visit is counted once. */
export const SESSION_KEY = "what-we-play:visit";

/** A visit counts as a return from the second session on. */
export const RETURN_VISITS = 2;
/** Games opened (from the list or a draw) that show interest on a first visit. */
export const ENGAGED_PLAYS = 2;
/** How long a returning visitor browses before the invitation, in ms. */
export const RETURN_DWELL_MS = 20_000;
/** Pause after coming back to the tab from a game, so it doesn't pop at once. */
export const BACK_DELAY_MS = 1_200;
/** « Not now » holds for this long… */
export const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
/** …and after this many of them, we stop asking for good. */
export const MAX_DISMISSALS = 2;

export type InstallState = {
  visits: number;
  plays: number;
  dismissals: number;
  /** Epoch ms of the last « Not now », 0 if never. */
  dismissedAt: number;
  installed: boolean;
};

const EMPTY: InstallState = { visits: 0, plays: 0, dismissals: 0, dismissedAt: 0, installed: false };

export function readInstallState(): InstallState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<InstallState>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function updateInstallState(change: (state: InstallState) => Partial<InstallState>): InstallState {
  const current = readInstallState();
  const next = { ...current, ...change(current) };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Without storage the invitation simply comes back next time.
  }
  return next;
}

/** Counts this visit, once per browser session. */
export function countVisit(): InstallState {
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return readInstallState();
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    return readInstallState();
  }
  return updateInstallState((state) => ({ visits: state.visits + 1 }));
}

/** Not asked too often, and someone who has shown they come back or play. */
export function isEligible(state: InstallState, now: number): boolean {
  if (state.installed || state.dismissals >= MAX_DISMISSALS) return false;
  if (state.dismissedAt && now - state.dismissedAt < COOLDOWN_MS) return false;
  return state.visits >= RETURN_VISITS || state.plays >= ENGAGED_PLAYS;
}

/** Already running as the installed app (Android, desktop, or iOS's home screen). */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Safari on an iPhone or iPad: no install dialog there, only Share → Add to
 * Home Screen. iPadOS reports itself as a Mac, so touch gives it away. Other
 * iOS browsers (Chrome, Firefox, in-app views of Instagram and co.) name
 * themselves in the user agent and are left out: their menus differ.
 */
export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return ios && /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Instagram|FBAN|FBAV|Line\//.test(ua);
}
