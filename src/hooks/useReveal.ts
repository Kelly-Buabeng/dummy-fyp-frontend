import { useEffect, useRef, useState } from "react";

/**
 * Drives the .reveal CSS utility (globals.css): fades an element in and
 * lifts it slightly, either right after mount or the first time it
 * scrolls into view. The actual motion (including the
 * prefers-reduced-motion fallback) lives in CSS — this hook only flips
 * a boolean at the right moment.
 */
export function useReveal<T extends HTMLElement>(trigger: "mount" | "visible" = "visible") {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (trigger === "mount") {
      const raf = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(raf);
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  return { ref, revealed };
}
