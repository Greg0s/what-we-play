import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server — where layout
 * effects never run and React would warn about it.
 *
 * We need the layout variant on the client: it runs after hydration but before
 * the browser paints, so switching to the visitor's language leaves no frame of
 * English on screen.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
