import { useCallback, useEffect, useRef, useState } from "react";
import {
  BACK_DELAY_MS,
  countVisit,
  isEligible,
  isIosSafari,
  isStandalone,
  RETURN_DWELL_MS,
  updateInstallState,
  readInstallState,
} from "./config";
import { heldInstallPrompt, onInstallPrompt, releaseInstallPrompt } from "./nativePrompt";

/** `native`: the browser's own install dialog is ready. `ios`: Safari, where we explain the steps. */
export type InstallOffer = "native" | "ios";

type Umami = { track: (event: string, data?: Record<string, string>) => void };

function track(event: string, data?: Record<string, string>) {
  (window as Window & { umami?: Umami }).umami?.track(event, data);
}

/** A game opened, from a card or a draw: the same attribute Umami counts. */
const PLAY_SELECTOR = '[data-umami-event="Play game"]';

/**
 * Decides when to invite the visitor to install the app. Only from effects:
 * none of it exists during the prerender, so the first render is always
 * « nothing », as on the server.
 *
 * The invitation waits for a sign the visitor will come back: a second visit
 * (after `RETURN_DWELL_MS` of browsing), or a second game opened (shown when
 * they return to the tab from it). Never inside the installed app, never over
 * a dialog, never twice in a visit, and « Not now » holds for a month.
 */
export function useInstallPrompt() {
  const [offer, setOffer] = useState<InstallOffer | null>(null);
  // Once shown or answered, this visit is done.
  const settled = useRef(false);

  const show = useCallback((platform: InstallOffer) => {
    settled.current = true;
    setOffer(platform);
    track("Install prompt", { step: "shown", platform });
  }, []);

  useEffect(() => {
    if (isStandalone()) {
      updateInstallState(() => ({ installed: true }));
      return;
    }
    countVisit();

    const ios = isIosSafari();
    const timers = new Set<number>();
    const wait = (ms: number, then: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        then();
      }, ms);
      timers.add(id);
    };
    let dwelled = false;

    const consider = () => {
      if (settled.current || document.visibilityState !== "visible") return;
      const platform: InstallOffer | null = ios ? "ios" : heldInstallPrompt() ? "native" : null;
      if (!platform || !isEligible(readInstallState(), Date.now())) return;
      // Never over the pick screen or « How it works »: try again a bit later.
      if (document.querySelector('[aria-modal="true"]')) {
        wait(5_000, consider);
        return;
      }
      show(platform);
    };

    wait(RETURN_DWELL_MS, () => {
      dwelled = true;
      consider();
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") wait(BACK_DELAY_MS, consider);
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.(PLAY_SELECTOR)) {
        updateInstallState((state) => ({ plays: state.plays + 1 }));
      }
    };
    const onInstalled = () => {
      settled.current = true;
      updateInstallState(() => ({ installed: true }));
      setOffer(null);
      track("App installed");
    };
    // Chrome may only decide the site is installable after the dwell.
    const stopListening = onInstallPrompt(() => {
      if (dwelled) consider();
    });

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("click", onClick, true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      stopListening();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [show]);

  const later = useCallback(() => {
    updateInstallState((state) => ({ dismissals: state.dismissals + 1, dismissedAt: Date.now() }));
    setOffer(null);
  }, []);

  const accept = useCallback(async () => {
    const event = heldInstallPrompt();
    setOffer(null);
    if (!event) return;
    releaseInstallPrompt();
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      track("Install prompt", { step: outcome === "accepted" ? "accepted" : "declined", platform: "native" });
      if (outcome === "accepted") updateInstallState(() => ({ installed: true }));
      else later();
    } catch {
      // The browser refused to show its dialog: nothing more to do this visit.
    }
  }, [later]);

  return { offer, accept, later };
}
