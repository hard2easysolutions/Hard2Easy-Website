"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { EASE } from "@/components/ui/motion";

/**
 * Custom dropdown (WAI-ARIA "select-only combobox" pattern) that matches the
 * form's floating-label fields. Works like a native select:
 *   click / Enter / Space / ↓ opens · ↑ ↓ Home End move · type a letter to jump
 *   Enter / Space / Tab picks · Esc closes · click outside closes
 * `value` is "" when nothing is chosen.
 */
export default function SelectMenu({ id, label, placeholder, options, value, onChange, onBlur, name }) {
  const reduce = useReducedMotion();
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // highlighted option while open
  const [dropUp, setDropUp] = useState(false);

  const selectedIndex = options.indexOf(value);
  const optionId = (i) => `${listId}-opt-${i}`;

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    // Open upwards if there isn't room below (e.g. near the bottom of the screen).
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const needed = Math.min(options.length * 44 + 16, 320);
      setDropUp(window.innerHeight - rect.bottom < needed && rect.top > window.innerHeight - rect.bottom);
    }
    setActive(index);
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const choose = (i) => {
    onChange(options[i]);
    closeMenu();
  };

  // Close on click / tap outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onBlur]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const jumpByLetter = (key) => {
    const t = typeahead.current;
    clearTimeout(t.timer);
    t.text += key.toLowerCase();
    t.timer = setTimeout(() => (t.text = ""), 600);
    const start = open ? active : selectedIndex;
    const ordered = [...options.slice(start + 1), ...options.slice(0, start + 1)];
    const hit = ordered.find((o) => o.toLowerCase().startsWith(t.text));
    return hit ? options.indexOf(hit) : -1;
  };

  const onKeyDown = (e) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu(e.key === "ArrowUp" ? (selectedIndex >= 0 ? selectedIndex : last) : undefined);
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        const i = jumpByLetter(e.key);
        if (i >= 0) onChange(options[i]);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (active >= 0) choose(active);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "Tab":
        if (active >= 0) onChange(options[active]);
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const i = jumpByLetter(e.key);
          if (i >= 0) setActive(i);
        }
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className={`pointer-events-none absolute top-2 left-4 z-1 text-[12px] transition-colors ${open ? "text-accent" : "text-mute"}`}>
        {label}
      </span>

      <button
        ref={buttonRef}
        id={id}
        name={name}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget)) onBlur?.();
        }}
        className={`flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-btn border bg-transparent px-4 pt-5 pb-1 text-left text-[16px] transition-colors duration-200 outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
          open ? "border-accent ring-1 ring-accent" : "border-line-strong hover:border-fg/40"
        }`}
      >
        <span className={`truncate ${value ? "text-fg" : "text-mute"}`}>{value || placeholder}</span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className={`-mt-4 size-4 shrink-0 text-mute transition-transform duration-300 ease-quint ${open ? "rotate-180 text-accent" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={`${id}-label`}
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: dropUp ? 4 : -4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ transformOrigin: dropUp ? "bottom center" : "top center" }}
            className={`no-scrollbar absolute inset-x-0 z-30 max-h-80 overflow-y-auto overscroll-contain rounded-[12px] border border-line-strong bg-raised p-1.5 ${
              dropUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
            }`}
          >
            {options.map((option, i) => {
              const selected = option === value;
              const highlighted = i === active;
              return (
                <li
                  key={option}
                  id={optionId(i)}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault() /* keep focus on the button */}
                  onClick={() => choose(i)}
                  className={`relative flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-[15px] leading-snug transition-colors duration-150 ${
                    highlighted ? "bg-fg/6 text-fg" : "text-fg/80"
                  } ${selected ? "font-medium text-fg" : ""}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`h-4 w-0.5 rounded-full transition-colors duration-150 ${selected ? "bg-accent" : highlighted ? "bg-fg/25" : "bg-transparent"}`}
                    />
                    {option}
                  </span>
                  {selected && <Check aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-accent" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
