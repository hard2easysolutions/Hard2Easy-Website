"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Orbit from "@/components/ui/Orbit";

/**
 * "Hard" gets struck through as you scroll; "Easy" rises in beside it.
 * Scroll-linked via useTransform. Static end state under reduced motion.
 */
export default function HardToEasy({ from, to }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });

  const strike = useTransform(scrollYProgress, [0.1, 0.55], [0, 1]);
  const hardOpacity = useTransform(scrollYProgress, [0.35, 0.7], [1, 0.4]);
  const easyY = useTransform(scrollYProgress, [0.45, 0.95], ["60%", "0%"]);
  const easyOpacity = useTransform(scrollYProgress, [0.45, 0.85], [0, 1]);

  const s = reduce ? {} : null;

  return (
    <div
      ref={ref}
      aria-label={`${from} → ${to}`}
      role="img"
      className="tone-dark relative flex aspect-[5/4] flex-col justify-center overflow-hidden rounded-card bg-ink px-[8%] sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]"
    >
      <Orbit disc dots className="top-1/2 left-1/2 w-[88%] -translate-x-1/2 -translate-y-1/2" speed="44s" trackSpeed="30s" />
      <div aria-hidden="true" className="noise absolute inset-0" />

      <div aria-hidden="true" className="relative font-display leading-[0.85] font-medium tracking-[-0.025em]">
        <span className="relative inline-block text-[clamp(4.5rem,13vw,10rem)]">
          <motion.span style={s ?? { opacity: hardOpacity }} className="inline-block text-orange">
            {from}
          </motion.span>
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute top-[48%] -left-[4%] h-[0.22em] w-[108%] overflow-visible" fill="none">
            <motion.path
              d="M6 38C70 30 140 22 214 22c70 0 120 6 180-4"
              stroke="var(--color-accent)"
              strokeWidth="7"
              strokeLinecap="round"
              style={{ pathLength: reduce ? 1 : strike }}
            />
          </svg>
        </span>
        <span className="-mb-[0.35em] block overflow-hidden pb-[0.35em] text-right">
          <motion.span
            style={s ?? { y: easyY, opacity: easyOpacity }}
            className="text-easy inline-block text-[clamp(4.5rem,13vw,10rem)]"
          >
            {to}
          </motion.span>
        </span>
      </div>
    </div>
  );
}
