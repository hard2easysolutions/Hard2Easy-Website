"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE } from "./motion";

/**
 * Counts from 0 to `value` once scrolled into view. The final value is
 * server-rendered; the animation writes straight to the DOM node.
 */
export default function Counter({ value, suffix = "", duration = 1.4, className = "" }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = numRef.current;
    if (!el || reduce !== false) return;
    if (!inView) {
      el.textContent = "0";
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      <span aria-hidden="true">
        <span ref={numRef}>{value}</span>
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
