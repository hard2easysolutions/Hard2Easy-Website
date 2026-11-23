"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE, VIEWPORT } from "./motion";

const item = (y) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
});

/**
 * Fade + 24px rise when scrolled into view.
 * With `stagger`, direct <RevealItem> children animate in sequence.
 */
export default function Reveal({ as = "div", delay = 0, stagger = 0, y = 24, className, children, ...props }) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[as];

  if (stagger) {
    return (
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
        {...props}
      >
        {children}
      </MotionTag>
    );
  }

  const v = item(y);
  return (
    <MotionTag
      data-reveal
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: v.hidden, show: { ...v.show, transition: { ...v.show.transition, delay } } }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/** Child of a staggered <Reveal>. */
export function RevealItem({ as = "div", y = 24, className, children, ...props }) {
  const reduce = useReducedMotion();
  const Tag = as;
  if (reduce) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }
  const MotionTag = motion[as];
  return (
    <MotionTag data-reveal className={className} variants={item(y)} {...props}>
      {children}
    </MotionTag>
  );
}
