/** Small helpers the components share. Kept out of the component files so Fast Refresh keeps working. */
import type { MouseEvent } from "react";
import type { Game } from "./games";
import type { Translation } from "./i18n";

export type CardTag = { label: string; warn: boolean };

/** Only what sets a game apart; the two dashed ones (`warn`) are what might stop you. */
export function cardTags(game: Game, t: Translation): CardTag[] {
  const tags: CardTag[] = [];
  if (game.soloWithStrangers) tags.push({ label: t.catalogue.tagStrangers, warn: false });
  if (game.screenShare) tags.push({ label: t.catalogue.tagScreenShare, warn: false });
  if (game.accountNeeded) tags.push({ label: t.catalogue.tagAccount, warn: true });
  if (!game.mobileFriendly) tags.push({ label: t.catalogue.tagNotMobile, warn: true });
  return tags;
}

/** 34 px fits a ten-letter word on a floppy's label; longer words shrink so they never break. */
export function labelSize(name: string): number {
  const longest = name.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0);
  return longest > 10 ? Math.max(20, Math.floor(340 / longest)) : 34;
}

/** False for a click that asks for a new tab or window: let the browser follow the link then. */
export function isPlainClick(event: MouseEvent) {
  return !(event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

export type PadKey = {
  label: string;
  href: string;
  current: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};
