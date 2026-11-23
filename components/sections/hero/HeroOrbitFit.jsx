"use client";

import { useEffect, useRef } from "react";

/**
 * Positions the hero orbit (the section's ::before / ::after circle and the
 * satellite track) so it NEVER touches the text.
 *
 * It measures the real text boxes — every word of the H1 plus the copy column —
 * and slides the circle away from them until there is at least `gap` px of
 * clear space between the ring (and its satellites) and any text.
 *   desktop: the circle frames the device on the right; slides right
 *   mobile:  the circle sits behind the device; slides down
 * Re-runs on resize and once web fonts have loaded (line widths change).
 */
export default function HeroOrbitFit() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const h1 = section.querySelector("#hero-title");
    const copy = section.querySelector("[data-hero-copy]");
    const device = section.querySelector("[data-hero-device]");
    if (!h1 || !copy || !device) return;

    const DOT = 14; // satellite dot + glow reaches past the ring line

    const fit = () => {
      const s = section.getBoundingClientRect();
      const desktop = window.innerWidth >= 1024;
      const gap = (desktop ? 48 : 32) + DOT;

      // Text boxes in section coordinates.
      const range = document.createRange();
      range.selectNodeContents(h1);
      const rects = [...range.getClientRects(), ...[...copy.children].map((c) => c.getBoundingClientRect())]
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({ l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top }));

      const d = device.getBoundingClientRect();
      const dev = { cx: d.left - s.left + d.width / 2, cy: d.top - s.top + d.height / 2, w: d.width, top: d.top - s.top };

      const size = desktop ? Math.min(s.width * 0.62, 940) : Math.min(dev.w * 1.18, 560);
      const r = size / 2;

      const clear = (cx, cy) =>
        rects.every((b) => {
          const dx = Math.max(b.l - cx, 0, cx - b.r);
          const dy = Math.max(b.t - cy, 0, cy - b.b);
          return Math.hypot(dx, dy) >= r + gap;
        });

      let cx = dev.cx;
      let cy = desktop ? dev.top + d.height * 0.28 : dev.cy;
      // Slide away from the text until clear (bounded so it can't run forever).
      for (let i = 0; i < 400 && !clear(cx, cy); i++) {
        if (desktop) cx += 6;
        else cy += 6;
      }

      section.style.setProperty("--orbit-size", `${Math.round(size)}px`);
      section.style.setProperty("--orbit-x", `${Math.round(cx - r)}px`);
      section.style.setProperty("--orbit-y", `${Math.round(cy - r)}px`);
      section.dataset.orbitReady = "true";
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    schedule();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    ro.observe(h1);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <span ref={ref} hidden />;
}
