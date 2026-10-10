import { useCallback, useEffect, useRef } from "react";

/**
 * Named timeouts that cancel each other: starting `name` again replaces the
 * pending one, and everything is cleared on unmount.
 */
export function useTimers() {
  const timers = useRef(new Map<string, number>());

  const stop = useCallback((name: string) => {
    const id = timers.current.get(name);
    if (id !== undefined) {
      window.clearTimeout(id);
      timers.current.delete(name);
    }
  }, []);

  const later = useCallback(
    (name: string, ms: number, fn: () => void) => {
      stop(name);
      timers.current.set(
        name,
        window.setTimeout(() => {
          timers.current.delete(name);
          fn();
        }, ms),
      );
    },
    [stop],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
      pending.clear();
    };
  }, []);

  return { later, stop };
}
