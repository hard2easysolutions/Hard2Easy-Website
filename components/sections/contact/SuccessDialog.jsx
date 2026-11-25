"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { EASE } from "@/components/ui/motion";

/**
 * Popup shown once the message has been accepted for sending.
 * A native <dialog> gives us the focus trap, Esc and top layer for free.
 * Text lives in content/data/contact.json → form.popup ("{name}" = first name).
 */
export default function SuccessDialog({ name, copy, onClose }) {
  const ref = useRef(null);
  const doneRef = useRef(null);
  const reduce = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    doneRef.current?.focus();
    return () => dialog.close();
  }, []);

  // Hold the page still behind the popup.
  useEffect(() => {
    const { overflow } = document.documentElement.style;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
      lenis?.start();
    };
  }, [lenis]);

  const draw = (duration, delay = 0) => ({
    initial: reduce ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <dialog
      ref={ref}
      aria-labelledby="cf-popup-title"
      aria-describedby="cf-popup-body"
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()} // click on the backdrop
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto bg-transparent p-0 text-fg backdrop:bg-ink/75"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative overflow-hidden rounded-card border border-line-strong bg-raised px-7 pt-10 pb-8 text-center sm:px-10"
      >
        <div aria-hidden="true" className="bg-brand absolute inset-x-0 top-0 h-0.5" />
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full text-mute transition-colors hover:text-fg"
        >
          <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
        </button>

        <svg viewBox="0 0 56 56" className="mx-auto size-16" fill="none" aria-hidden="true">
          <motion.circle cx="28" cy="28" r="26" stroke="var(--color-accent)" strokeWidth="1.5" {...draw(0.6)} />
          <motion.path
            d="M17 29l7.5 7.5L40 21"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...draw(0.45, 0.45)}
          />
        </svg>

        <h3 id="cf-popup-title" className="text-h3 mt-6 break-words">
          {copy.title.replace("{name}", () => name)}
        </h3>
        <p id="cf-popup-body" className="mt-3 text-[16px] leading-relaxed text-mute">
          {copy.body}
        </p>
        <button
          type="button"
          ref={doneRef}
          onClick={onClose}
          className="mt-8 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-btn bg-green px-6 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-lime"
        >
          {copy.button}
        </button>
      </motion.div>
    </dialog>
  );
}
