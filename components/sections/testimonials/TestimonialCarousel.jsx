"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const initials = (name) =>
  name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function TestimonialCarousel({ items, ui, titleId }) {
  const trackRef = useRef(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [scrollable, setScrollable] = useState(true);

  const slides = () => [...(trackRef.current?.children ?? [])];

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 4);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    // active = slide whose left edge is closest to the track's left edge
    const left = el.getBoundingClientRect().left;
    let best = 0;
    let bestDist = Infinity;
    slides().forEach((s, i) => {
      const d = Math.abs(s.getBoundingClientRect().left - left);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setIndex(el.scrollLeft >= max - 4 ? items.length - 1 : best);
  }, [items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  const goTo = (i) => {
    const el = trackRef.current;
    const slide = slides()[Math.max(0, Math.min(items.length - 1, i))];
    if (!el || !slide) return;
    el.scrollTo({
      left: slide.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft) || 0,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const arrowBtn =
    "flex size-11 items-center justify-center rounded-full border border-line-strong text-fg transition-[opacity,border-color,background-color] duration-200 hover:border-fg/50 hover:bg-fg/5 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="region" aria-roledescription="carousel" aria-labelledby={titleId}>
      <ul
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-lenis-prevent-horizontal
        className="snap-track flex snap-x gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 outline-offset-4 md:scroll-px-8 md:gap-5 md:px-8 lg:scroll-px-[max(3rem,calc((100vw_-_var(--container-site))/2_+_3rem))] lg:px-[max(3rem,calc((100vw_-_var(--container-site))/2_+_3rem))]"
      >
        {items.map((t, i) => (
          <li
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
            className="w-[86%] shrink-0 snap-start sm:w-[62%] md:w-[calc(50%-10px)] lg:w-[calc(40%-12px)]"
          >
            <figure className="flex h-full flex-col rounded-card border border-line bg-raised p-7 md:p-9">
              <span aria-hidden="true" className="font-display text-[96px] leading-[0.7] font-medium text-accent">
                &ldquo;
              </span>
              <blockquote className="mt-4 flex-1 text-[19px] leading-[1.55] md:text-[20px]">
                <p>{t.quote}</p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4 border-t border-line pt-6">
                {t.photo ? (
                  <Image src={t.photo} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[13px] text-mute"
                  >
                    {initials(t.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-medium">{t.name}</span>
                  <span className="mt-0.5 block font-mono text-[12px] tracking-[0.04em] text-mute">
                    {t.role}, {t.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {scrollable && (
        <div className="mx-auto mt-8 flex w-full max-w-site items-center justify-between px-5 md:px-8 lg:px-12">
          <div className="flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${ui.carouselGoTo} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex h-11 min-w-6 items-center justify-center px-1"
              >
                <span
                  className={`block h-[3px] rounded-full transition-all duration-300 ease-quint ${
                    i === index ? "w-8 bg-accent" : "w-3 bg-line-strong group-hover:bg-mute"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => goTo(index - 1)} disabled={atStart} aria-label={ui.carouselPrev} className={arrowBtn}>
              <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </button>
            <button type="button" onClick={() => goTo(index + 1)} disabled={atEnd} aria-label={ui.carouselNext} className={arrowBtn}>
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
