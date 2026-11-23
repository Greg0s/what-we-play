/**
 * Chromium browsers (Chrome, Edge, Samsung Internet…) fire
 * `beforeinstallprompt` once the site is installable. It is caught here, from
 * `main.tsx`, before React hydrates — it can fire early — and held until the
 * invitation decides it is the right time to call its `prompt()`.
 * Holding it (`preventDefault`) also keeps Android's own mini-bar away, so the
 * site asks once, at its moment, instead of on arrival.
 */

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let held: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

export function captureInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    held = event as InstallPromptEvent;
    listeners.forEach((listener) => listener());
  });
}

export function heldInstallPrompt() {
  return held;
}

/** The event can only be prompted once: after that, wait for the next one. */
export function releaseInstallPrompt() {
  held = null;
  listeners.forEach((listener) => listener());
}

export function onInstallPrompt(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
