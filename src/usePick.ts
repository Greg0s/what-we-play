import { useCallback, useRef, useState } from "react";
import type { Game } from "./games";
import { prefersReducedMotion } from "./relief/config";
import { REEL_ORDER, type ReelPhase } from "./tv";
import { useTimers } from "./useTimers";

type State = {
  /** The game on the floppy; the drawer is open while it is set. */
  pickId: string | null;
  /** The last game picked, so a new draw avoids it. */
  lastId: string | null;
  /** While the reels spin, the game they will stop on. */
  nextId: string | null;
  phase: ReelPhase | null;
  /** Index in REEL_ORDER of the next game's genre: where the reels stop. */
  reelStop: number;
  /** The floppy goes back into the slot (reroll, close). */
  retract: boolean;
  closing: boolean;
  /** How many draws since the drawer opened: picks what the TV says. */
  line: number;
  // One-shot animations: each counter flips an a/b class so the next run
  // restarts it; the flag says whether it is running.
  eject: number;
  ejecting: boolean;
  fade: number;
  fading: boolean;
  opening: boolean;
  jump: number;
  jumping: boolean;
  slot: number;
  slotting: boolean;
  hop: number;
  hopping: boolean;
};

const INITIAL: State = {
  pickId: null,
  lastId: null,
  nextId: null,
  phase: null,
  reelStop: 0,
  retract: false,
  closing: false,
  line: 0,
  eject: 0,
  ejecting: false,
  fade: 0,
  fading: false,
  opening: false,
  jump: 0,
  jumping: false,
  slot: 0,
  slotting: false,
  hop: 0,
  hopping: false,
};

const ab = (on: boolean, n: number, a: string, b: string) => (on ? (n % 2 ? a : b) : "");

/**
 * « Pick for us » on wide screens: the TV's eyes turn into slot machine reels,
 * stop on the game's genre, and a floppy with the game pops out of the slot
 * into the drawer under the banner. Again: the floppy goes back in first.
 */
export function usePick(list: Game[], options: { flat: boolean }) {
  const { later, stop } = useTimers();
  const [state, setState] = useState<State>(INITIAL);
  const latest = useRef(state);
  latest.current = state;

  const patch = useCallback((next: Partial<State>) => {
    setState((current) => ({ ...current, ...next }));
  }, []);

  const cancelReels = useCallback(() => {
    ["r1", "r2", "r3"].forEach(stop);
  }, [stop]);

  const settle = useCallback(() => {
    later("fx", 700, () =>
      patch({ ejecting: false, fading: false, opening: false, jumping: false, slotting: false }),
    );
  }, [later, patch]);

  const pick = list.find((game) => game.id === state.pickId) ?? null;
  const open = pick !== null;

  const finish = useCallback(() => {
    const current = latest.current;
    if (!current.nextId) return;
    cancelReels();
    const wasOpen = current.pickId !== null && list.some((game) => game.id === current.pickId);
    setState({
      ...current,
      phase: null,
      pickId: current.nextId,
      lastId: current.nextId,
      nextId: null,
      retract: false,
      line: wasOpen ? current.line + 1 : 0,
      eject: current.eject + 1,
      ejecting: true,
      fade: current.fade + 1,
      fading: wasOpen,
      opening: !wasOpen,
      jump: current.jump + 1,
      jumping: true,
      slot: current.slot + 1,
      slotting: true,
      hop: current.hop + 1,
      hopping: true,
    });
    settle();
    // 3D: the pawns hop as the floppy lands (the CSS waits 380 ms).
    later("hop", 1000, () => patch({ hopping: false }));
  }, [cancelReels, later, list, patch, settle]);

  const start = useCallback(() => {
    const current = latest.current;
    if (current.closing) return;
    if (current.phase) {
      finish();
      return;
    }
    if (list.length === 0) return;
    const showing = list.some((game) => game.id === current.pickId) ? current.pickId : null;
    const avoid = showing ?? current.lastId;
    const pool = list.length > 1 ? list.filter((game) => game.id !== avoid) : list;
    const next = pool[Math.floor(Math.random() * pool.length)];
    const quick = showing !== null;
    setState({
      ...current,
      phase: "spin",
      nextId: next.id,
      reelStop: Math.max(0, REEL_ORDER.indexOf(next.genre)),
      retract: quick,
      ejecting: false,
      fading: false,
      opening: false,
      slot: current.slot + 1,
      slotting: true,
    });
    later("r1", quick ? 250 : 500, () => patch({ phase: "stop1" }));
    later("r2", quick ? 380 : 680, () => patch({ phase: "stop2" }));
    later("r3", quick ? 560 : 900, finish);
  }, [finish, later, list, patch]);

  const close = useCallback(() => {
    const current = latest.current;
    if (current.closing) return;
    cancelReels();
    setState({
      ...current,
      phase: null,
      nextId: null,
      closing: true,
      retract: true,
      ejecting: false,
      fading: false,
      opening: false,
      slot: current.slot + 1,
      slotting: true,
    });
    settle();
    // Wait for the floppy to be back in: the eject played backwards in 2D,
    // the flight back into the Mac's slot in 3D.
    const wait = prefersReducedMotion() ? 0 : options.flat ? 440 : 240;
    later("close", wait, () => patch({ pickId: null, retract: false, closing: false, line: 0 }));
  }, [cancelReels, later, options.flat, patch, settle]);

  /** The player count changed: whatever was picked no longer applies. */
  const reset = useCallback(() => {
    cancelReels();
    stop("close");
    patch({ pickId: null, nextId: null, phase: null, retract: false, closing: false, line: 0 });
  }, [cancelReels, patch, stop]);

  return {
    pick,
    open,
    phase: state.phase,
    reelStop: state.reelStop,
    line: state.line,
    closing: state.closing,
    start,
    close,
    reset,
    classes: {
      ejectCls: state.retract ? "is-in" : ab(state.ejecting, state.eject, "ej-a", "ej-b"),
      fadeCls: ab(state.fading, state.fade, "fd-a", "fd-b"),
      drawerCls: state.opening ? "is-opening" : "",
      sayCls: state.closing
        ? "is-out"
        : state.opening
          ? "say-a"
          : state.line && state.fading
            ? ab(true, state.fade, "say-a", "say-b")
            : "",
      hop: ab(state.jumping, state.jump, "jp-a", "jp-b"),
      slot: ab(state.slotting, state.slot, "sl-a", "sl-b"),
      pawnHop: ab(state.hopping, state.hop, "hop-a", "hop-b"),
    },
    /** Bumped on every eject, so the drawer can measure the flight before it starts. */
    ejectCount: state.eject,
  };
}
