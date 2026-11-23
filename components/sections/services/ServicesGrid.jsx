"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppWindow, Check, LayoutDashboard, PenTool, Plus, Workflow } from "lucide-react";
import { EASE } from "@/components/ui/motion";

const ICONS = { PenTool, LayoutDashboard, Workflow, AppWindow };

export default function ServicesGrid({ cards }) {
  // Accordion: only one card open at a time. Opening a card closes the other;
  // clicking the open card again closes it.
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5">
      {cards.map((card, i) => (
        <ServiceCard key={card.title} card={card} index={i} open={openIndex === i} onToggle={() => toggle(i)} />
      ))}
    </ul>
  );
}

function ServiceCard({ card, index, open, onToggle }) {
  const reduce = useReducedMotion();
  const iconRef = useRef(null);
  const Icon = ICONS[card.icon];
  const panelId = `service-panel-${index}`;
  const buttonId = `service-button-${index}`;

  // Give every icon stroke pathLength=1 so the hover redraw is length-independent.
  useEffect(() => {
    iconRef.current
      ?.querySelectorAll("path, line, rect, circle, polyline")
      .forEach((n) => n.setAttribute("pathLength", "1"));
  }, []);

  return (
    <li
      className={`group relative overflow-hidden rounded-card border bg-raised transition-colors duration-200 ease-quint ${
        open ? "border-line-strong" : "border-line hover:border-line-strong"
      }`}
    >
      <div
        aria-hidden="true"
        // Hover / open: the logo gradient (hard → easy) draws across the top edge.
        className={`bg-brand pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left transition-transform duration-500 ease-quint ${
          open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
      <h3 className="relative">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full flex-col items-start rounded-card p-7 text-left outline-offset-[-4px] md:p-9"
        >
          <span className="flex w-full items-center justify-between">
            <span className="font-mono text-[12px] tracking-[0.14em] text-mute">{String(index + 1).padStart(2, "0")}</span>
            <span
              aria-hidden="true"
              className={`flex size-10 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ease-quint ${
                open ? "rotate-45 border-fg bg-fg text-bg" : "border-line-strong text-fg"
              }`}
            >
              <Plus strokeWidth={1.5} className="size-4" />
            </span>
          </span>
          <span ref={iconRef} className="icon-draw mt-10 block text-fg">
            <Icon aria-hidden="true" strokeWidth={1.5} className="size-8" />
          </span>
          <span className="text-h3 mt-6 block max-w-[20ch]">{card.title}</span>
          <span className="text-body mt-3 block max-w-[44ch] text-mute">{card.description}</span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative overflow-hidden"
          >
            <motion.ul
              className="mx-7 grid gap-x-6 border-t border-line pt-6 pb-8 sm:grid-cols-2 md:mx-9 md:pb-9"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}
            >
              {card.items.map((item) => (
                <motion.li
                  key={item}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                  }}
                  className="flex items-start gap-3 py-2 text-[15px] leading-snug"
                >
                  <Check aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-accent" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
