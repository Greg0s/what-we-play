import type { CSSProperties } from "react";
import { REEL_CELL, REEL_ORDER, type Mood, type ReelPhase, type Screen } from "../tv";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function Reel({ spin, stopAt }: { spin: string; stopAt: number }) {
  return (
    <span
      className={`strip ${spin}`}
      style={{ "--sy": spin ? 0 : -stopAt * REEL_CELL } as Vars}
    >
      {[...REEL_ORDER, REEL_ORDER[0]].map((genre, i) => (
        <span key={i} className={`gc-${genre}`} />
      ))}
    </span>
  );
}

/**
 * The video call on the TV's screen. Drawn inside the flat TV, the 3D Mac and
 * the phone's pick screen alike: everything is sized from the `--u` of
 * whichever TV holds it.
 */
export function TvScreen({
  screen,
  mood,
  share = false,
  reelPhase = null,
  reelStop = 0,
}: {
  screen: Screen;
  mood: Mood;
  /** Screen-share filter on: the screen gets a pink frame. */
  share?: boolean;
  reelPhase?: ReelPhase | null;
  /** Index of the genre the reels stop on. */
  reelStop?: number;
}) {
  const reels = mood === "reels";
  const left = reelPhase === "spin" ? "spin-l" : "";
  const right = reelPhase === "spin" || reelPhase === "stop1" ? "spin-r" : "";

  return (
    <div
      className={`scr m-${mood}${screen.solo ? " is-solo" : ""}${share ? " is-share" : ""}`}
    >
      <div className="scr-in">
        {screen.tiles.map((tile, i) => (
          <div
            key={i}
            className={`tile${tile.pop ? " is-pop" : ""}`}
            style={{ "--tw": tile.w, "--th": tile.h, animationDelay: `${tile.popDelay}ms` } as Vars}
          >
            {tile.more ? (
              <span className="more">{tile.more}</span>
            ) : (
              <div className="face" style={{ "--fx": tile.fx, "--fy": tile.fy } as Vars}>
                {(["l", "r"] as const).map((side) => (
                  <span
                    key={side}
                    className={`eye ${side}`}
                    style={
                      {
                        "--c": tile.color,
                        "--half": tile.half,
                        "--ew": tile.ew,
                        "--eh": tile.eh,
                        "--drop": tile.drop,
                        "--arc": tile.arc,
                        animationDuration: `${tile.blinkDuration}s`,
                        animationDelay: `${tile.blinkDelay + (side === "r" ? 0.04 : 0)}s`,
                      } as Vars
                    }
                  >
                    {reels && (
                      <Reel
                        spin={side === "l" ? left : right}
                        stopAt={side === "l" ? (left ? 0 : reelStop) : right ? 0 : reelStop}
                      />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {mood === "sad" && (
        <span className="tear" style={{ "--tx": screen.tear.x, "--ty": screen.tear.y } as Vars} />
      )}
      <span className="zz">z</span>
      <span className="glare" />
    </div>
  );
}
