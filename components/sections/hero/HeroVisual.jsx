"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { EASE } from "@/components/ui/motion";
import { L, W, H, pct, bar } from "./screenLayout";
import { buildSketch } from "./sketch";

// Timeline (seconds from navigation start) — matches the CSS intro in Hero.jsx.
const SKETCH_START = 0.5;
const SKETCH_STAGGER = 0.009;
const SWEEP_AT = 1.0;
const SWEEP_FROM = 85;
const SWEEP_TO = 50;

export default function HeroVisual({ visual, ui }) {
  const { screen } = visual;
  const reduce = useReducedMotion();

  const areaRef = useRef(null);
  const sliderRef = useRef(null);
  const sweepRef = useRef(null);
  const drag = useRef({ active: false, pending: false, x: 0, y: 0 });

  // --- slider position (percent from left) --------------------------------
  const pos = useMotionValue(SWEEP_FROM);
  const clip = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`);
  const handleLeft = useTransform(pos, (v) => `${v}%`);
  const sketchPill = useTransform(pos, [4, 14], [0, 1]);
  const livePill = useTransform(pos, [86, 94], [1, 0]);

  useMotionValueEvent(pos, "change", (v) => {
    const el = sliderRef.current;
    if (!el) return;
    const n = Math.round(v);
    el.setAttribute("aria-valuenow", String(n));
    el.setAttribute("aria-valuetext", `${100 - n}% live`);
  });

  // Auto-sweep 85% → 50% once the sketch has drawn. Aligned to page load so a
  // late hydration does not replay the whole sequence.
  useEffect(() => {
    if (reduce) {
      pos.set(SWEEP_TO);
      return;
    }
    if (reduce === null) return;
    const elapsed = performance.now() / 1000;
    sweepRef.current = animate(pos, SWEEP_TO, {
      delay: Math.max(0, SWEEP_AT - elapsed),
      duration: 0.6,
      ease: EASE,
    });
    return () => sweepRef.current?.stop();
  }, [reduce, pos]);

  const stopSweep = () => sweepRef.current?.stop();

  const setFromClientX = (clientX) => {
    const r = areaRef.current.getBoundingClientRect();
    pos.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  // --- pointer: mouse/pen drag immediately; touch waits for a horizontal intent
  const onPointerDown = (e) => {
    stopSweep();
    const d = drag.current;
    d.x = e.clientX;
    d.y = e.clientY;
    if (e.pointerType === "touch") {
      d.pending = true;
      return;
    }
    d.active = true;
    areaRef.current.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (d.pending) {
      const dx = Math.abs(e.clientX - d.x);
      const dy = Math.abs(e.clientY - d.y);
      if (dx > 6 && dx > dy) {
        d.pending = false;
        d.active = true;
        areaRef.current.setPointerCapture(e.pointerId);
      } else if (dy > 8) {
        d.pending = false;
      }
    }
    if (d.active) setFromClientX(e.clientX);
  };
  const endDrag = () => {
    drag.current.active = false;
    drag.current.pending = false;
  };

  // --- keyboard ------------------------------------------------------------
  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    const v = pos.get();
    let next = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = v - step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = v + step;
    if (e.key === "PageDown") next = v - 10;
    if (e.key === "PageUp") next = v + 10;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    stopSweep();
    pos.set(Math.max(0, Math.min(100, next)));
  };

  // --- tilt (desktop, fine pointer only) -------------------------------------
  const frameRef = useRef(null);
  const inView = useInView(frameRef);
  const [tiltOn, setTiltOn] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 20 });
  const sry = useSpring(ry, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setTiltOn(mq.matches && reduce === false);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!tiltOn || !inView) return;
    const onMove = (e) => {
      if (drag.current.active) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      ry.set(nx * 4);
      rx.set(-ny * 4);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      rx.set(0);
      ry.set(0);
    };
  }, [tiltOn, inView, rx, ry]);

  return (
    <div className="intro-frame perspective-[1600px]" style={{ "--d": "0.45s" }}>
      <motion.div
        ref={frameRef}
        style={tiltOn ? { rotateX: srx, rotateY: sry } : undefined}
        className="tone-dark relative rounded-[28px] border border-line-strong bg-graphite p-2 shadow-[0_60px_120px_-60px_rgb(0_0_0/0.7)] sm:p-2.5"
      >
        <div
          ref={areaRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="@container relative aspect-1000/660 cursor-ew-resize touch-pan-y overflow-hidden rounded-[18px] select-none"
        >
          <SketchLayer values={screen.chart.values} />

          <motion.div aria-hidden="true" className="absolute inset-0" style={{ clipPath: clip }}>
            <LiveLayer screen={screen} />
          </motion.div>

          {/* labels */}
          <motion.span
            aria-hidden="true"
            style={{ opacity: sketchPill }}
            className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full border border-orange/50 bg-ink/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-orange uppercase sm:bottom-3.5 sm:left-3.5"
          >
            {visual.sketchLabel}
          </motion.span>
          <motion.span
            aria-hidden="true"
            style={{ opacity: livePill }}
            className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase sm:right-3.5 sm:bottom-3.5"
          >
            <span className="size-1.5 rounded-full bg-live" />
            {visual.liveLabel}
          </motion.span>

          {/* handle */}
          <motion.div
            ref={sliderRef}
            role="slider"
            tabIndex={0}
            aria-label={ui.sliderLabel}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={SWEEP_FROM}
            aria-valuetext={`${100 - SWEEP_FROM}% live`}
            onKeyDown={onKeyDown}
            style={{ left: handleLeft }}
            className="group absolute inset-y-0 z-10 flex w-11 -translate-x-1/2 items-center justify-center outline-none"
          >
            <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/90" />
            <span
              aria-hidden="true"
              className="relative flex size-9 items-center justify-center rounded-full bg-white text-ink shadow-[0_6px_20px_-6px_rgb(7_17_31/0.6)] ring-lime ring-offset-2 ring-offset-graphite transition-transform duration-200 ease-quint group-hover:scale-105 group-focus-visible:ring-2"
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 6 3.5 10l4 4M12.5 6l4 4-4 4" />
              </svg>
            </span>
          </motion.div>
        </div>
      </motion.div>

      <p className="mt-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-mute uppercase">
        <MoveHorizontal aria-hidden="true" strokeWidth={1.5} className="size-3.5 text-accent" />
        {ui.sliderHint}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SketchLayer({ values }) {
  const paths = useMemo(() => buildSketch(values), [values]);
  const ref = useRef(null);
  const [sw, setSw] = useState(2.4);

  // Keep strokes ~1.5px regardless of rendered size.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width || 1;
      setSw(Math.round(((1.5 * W) / width) * 100) / 100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[#0b0b0b]">
      <div className="bp-grid absolute inset-0 [--grid-line:rgb(255_255_255/0.05)] bg-size-[4%_6.06%]" />
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 size-full"
        fill="none"
        stroke="rgb(255 122 0 / 0.85)"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength="1"
            className="intro-draw"
            style={{ "--d": `${(SKETCH_START + i * SKETCH_STAGGER).toFixed(3)}s`, "--dur": "0.4s" }}
          />
        ))}
      </svg>
    </div>
  );
}

function LiveLayer({ screen }) {
  const { kpis, chart, list } = screen;
  return (
    <div className="absolute inset-0 bg-paper text-ink">
      {/* sidebar */}
      <div className="absolute bg-ink" style={pct(L.sidebar)} />
      <div className="absolute flex items-center gap-[1.2cqw]" style={pct({ ...L.logo, w: 160 })}>
        <span className="block aspect-square h-full rounded-[0.8cqw] bg-brand" />
        <span className="block h-[0.7cqw] w-[8cqw] rounded-full bg-white/80" />
      </div>
      {screen.nav.map((label, i) => (
        <div
          key={label}
          className={`absolute flex items-center rounded-[0.7cqw] px-[1.2cqw] text-[1.35cqw] font-medium ${
            i === 0 ? "bg-white/10 text-white" : "text-white/55"
          }`}
          style={pct(L.nav[i])}
        >
          {label}
        </div>
      ))}

      {/* top bar */}
      <div className="absolute flex items-center font-display text-[2.6cqw] font-semibold tracking-[-0.02em]" style={pct(L.title)}>
        {screen.title}
      </div>
      <div
        className="absolute flex items-center rounded-full border border-line-ink bg-white px-[1.6cqw] text-[1.3cqw] text-mute-ink"
        style={pct(L.search)}
      >
        {screen.search}
      </div>
      <div
        className="absolute flex items-center justify-center rounded-full bg-ink font-mono text-[1.2cqw] text-white"
        style={pct({ x: L.avatar.cx - L.avatar.r, y: L.avatar.cy - L.avatar.r, w: L.avatar.r * 2, h: L.avatar.r * 2 })}
      >
        {screen.user}
      </div>

      {/* KPI tiles */}
      {kpis.map((k, i) => (
        <div
          key={k.label}
          className="absolute flex flex-col justify-between rounded-[1.2cqw] border border-line-ink bg-white p-[2cqw]"
          style={pct(L.kpis[i])}
        >
          <span className="text-[1.3cqw] text-mute-ink">{k.label}</span>
          <span className="font-display text-[3.4cqw] leading-none font-semibold tracking-[-0.03em] tabular-nums">{k.value}</span>
          <span className="font-mono text-[1.15cqw] text-green-deep">{k.delta}</span>
        </div>
      ))}

      {/* chart */}
      <div className="absolute rounded-[1.2cqw] border border-line-ink bg-white" style={pct(L.chart)} />
      <div className="absolute text-[1.5cqw] font-medium" style={pct({ x: L.chart.x + 26, y: L.chart.y + 22, w: 300, h: 26 })}>
        {chart.title}
      </div>
      <div
        className="absolute border-t border-line-ink"
        style={pct({ x: L.chartPlot.x, y: L.chartPlot.base, w: L.chartPlot.w, h: 1 })}
      />
      {chart.values.map((v, i) => {
        const b = bar(i, chart.values.length, v);
        const peak = v === Math.max(...chart.values);
        return (
          <div key={i} className="absolute" style={pct(b)}>
            <div
              className={`intro-bar size-full rounded-t-[0.5cqw] ${peak ? "bg-green" : "bg-green/20"}`}
              style={{ "--d": `${(1.05 + i * 0.04).toFixed(2)}s` }}
            />
            <span className="absolute top-full left-1/2 mt-[0.8cqw] -translate-x-1/2 font-mono text-[1.1cqw] text-mute-ink">
              {chart.days[i]}
            </span>
          </div>
        );
      })}

      {/* list */}
      <div className="absolute rounded-[1.2cqw] border border-line-ink bg-white" style={pct(L.list)} />
      <div className="absolute text-[1.5cqw] font-medium" style={pct({ x: L.list.x + 24, y: L.list.y + 22, w: 240, h: 26 })}>
        {list.title}
      </div>
      {list.rows.map((row, i) => {
        const y = L.listRows[i];
        return (
          <div
            key={row.initials}
            className="absolute flex items-center gap-[1.2cqw]"
            style={pct({ x: L.list.x + 24, y: y - 22, w: L.list.w - 48, h: 44 })}
          >
            <span className="flex aspect-square h-[75%] shrink-0 items-center justify-center rounded-full bg-paper-deep font-mono text-[1.05cqw] text-ink">
              {row.initials}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[1.3cqw] font-medium">{row.name}</span>
              <span className="text-[1.1cqw] text-mute-ink">{row.meta}</span>
            </span>
            <span className="ml-auto font-mono text-[1.2cqw] tabular-nums">{row.amount}</span>
          </div>
        );
      })}
    </div>
  );
}
