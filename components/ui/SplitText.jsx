"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE, VIEWPORT } from "./motion";

/**
 * Splits a heading into words that slide up from 110% inside overflow masks.
 * Screen readers get the full sentence via aria-label.
 */
export default function SplitText({ as = "h2", text, className = "", delay = 0, stagger = 0.04, ...props }) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return (
      <Tag className={className} {...props}>
        {text}
      </Tag>
    );
  }

  const MotionTag = motion[as];
  const words = text.split(" ");

  return (
    <MotionTag
      aria-label={text}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...props}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              data-reveal
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}
