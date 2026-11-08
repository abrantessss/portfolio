import { useEffect, useRef, useState } from "react";

/**
 * Observes whether the returned ref is in the viewport.
 *
 * Returns `[ref, inView, hasBeenInView]`:
 *  - `inView` is the live state,
 *  - `hasBeenInView` latches on the first intersection and never clears, which
 *    is what reveal animations and one-way mounts want.
 *
 * With `once` (the default) the observer disconnects after first intersection.
 */
export function useInView({ once = true, rootMargin = "0px", threshold = 0 } = {}) {
  const ref = useRef(null);

  const [state, setState] = useState(() => {
    // Without IntersectionObserver, show the content rather than leaving it
    // stuck behind a reveal transition that will never trigger.
    const unsupported = typeof IntersectionObserver === "undefined";
    return { inView: unsupported, seen: unsupported };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        setState((prev) => {
          const seen = prev.seen || next;
          if (prev.inView === next && prev.seen === seen) return prev;
          return { inView: next, seen };
        });
        if (next && once) observer.disconnect();
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, state.inView, state.seen];
}
