"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import { EASE } from "@/components/ui/motion";
import ProcessScene from "./ProcessScenes";

export default function ProcessSteps({ steps, visual }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
    if (i !== active) setActive(i);
  });

  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
      {/* Sticky, evolving illustration (desktop) */}
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-[max(7rem,calc(50dvh-17rem))]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-raised">
            <div aria-hidden="true" className="bp-dots bp-mask absolute inset-0 opacity-60" />
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0 p-[4%]"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              >
                <ProcessScene index={active} visual={visual} />
              </motion.div>
            </AnimatePresence>
            <p className="absolute bottom-4 left-5 font-mono text-[11px] tracking-[0.14em] text-mute uppercase">
              {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="relative lg:col-span-5 lg:col-start-8">
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-px bg-line" />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: reduce ? 1 : fill }}
          className="absolute top-0 bottom-0 -left-px w-[3px] origin-top rounded-full bg-[linear-gradient(180deg,var(--color-step-1),var(--color-step-2)_33%,var(--color-step-3)_66%,var(--color-step-4))]"
        />
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-active={active === i}
            className="relative pl-8 transition-opacity duration-500 ease-quint not-last:pb-14 sm:pl-10 lg:flex lg:min-h-[62dvh] lg:flex-col lg:justify-center lg:pb-0 lg:opacity-40 lg:data-[active=true]:opacity-100"
          >
            <span
              aria-hidden="true"
              style={active >= i ? { backgroundColor: `var(--color-step-${i + 1})`, borderColor: `var(--color-step-${i + 1})` } : undefined}
              className={`absolute top-2 left-0 size-2 -translate-x-1/2 rounded-full border transition-colors duration-300 lg:top-auto ${
                active >= i ? "" : "border-line-strong bg-bg"
              }`}
            />
            <Reveal>
              {/* mini illustration (mobile/tablet) */}
              <div className="relative mb-7 aspect-[4/3] max-w-md overflow-hidden rounded-card border border-line bg-raised lg:hidden">
                <div aria-hidden="true" className="bp-dots bp-mask absolute inset-0 opacity-60" />
                <div className="absolute inset-0 p-[4%]">
                  <ProcessScene index={i} visual={visual} play={false} />
                </div>
              </div>
              {/* 01 → 04 walks the logo spectrum: hard (orange) to easy (green) */}
              <p
                className="font-mono text-[clamp(2.5rem,4vw,3.5rem)] leading-none tracking-[-0.04em] tabular-nums"
                style={{ color: `var(--color-step-${i + 1})` }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-h3 mt-5">{step.title}</h3>
              <p className="text-body mt-3 max-w-[40ch] text-mute">{step.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
