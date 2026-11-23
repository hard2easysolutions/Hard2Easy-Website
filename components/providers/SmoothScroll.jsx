"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext(null);

/** Returns the Lenis instance, or null when smooth scroll is disabled. */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Scroll to a target (selector, element or number) with an 80px nav offset.
 * Falls back to native scrolling when Lenis is not running.
 */
export function scrollToTarget(lenis, target, { offset = -80 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : offset });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top });
}

export default function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance = null;

    const start = () => {
      instance = new Lenis({
        lerp: 0.1,
        autoRaf: true,
        anchors: { offset: -80 },
      });
      setLenis(instance);
    };
    const stop = () => {
      instance?.destroy();
      instance = null;
      setLenis(null);
    };

    if (!query.matches) start();
    const onChange = (e) => (e.matches ? stop() : start());
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      instance?.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
