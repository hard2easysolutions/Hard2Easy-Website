"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { EASE } from "@/components/ui/motion";
import { roughEllipse, roughRect, roughLine, scribble } from "@/components/sections/hero/sketch";

// All scenes share a 480 × 360 artboard.
const VB = "0 0 480 360";

// Geometry shared by wireframe / build / live so the stages read as one screen evolving.
const G = {
  frame: { x: 48, y: 36, w: 384, h: 288 },
  bar: { x: 48, y: 36, w: 384, h: 30 },
  title: { x: 72, y: 92, w: 196, h: 22 },
  sub: { x: 72, y: 124, w: 150, h: 10 },
  sub2: { x: 72, y: 142, w: 120, h: 10 },
  button: { x: 72, y: 166, w: 84, h: 24 },
  image: { x: 292, y: 88, w: 116, h: 104 },
  cards: [0, 1, 2].map((i) => ({ x: 72 + i * 116, y: 216, w: 104, h: 84 })),
};

const draw = (play, i, reduce) =>
  reduce || !play
    ? { initial: false, animate: { pathLength: 1, opacity: 1 } }
    : {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { duration: 0.6, ease: EASE, delay: 0.1 + i * 0.05 },
      };

const fade = (play, i, reduce) =>
  reduce || !play
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE, delay: 0.15 + i * 0.07 },
      };

/* 01 — a scribbled note ---------------------------------------------------- */
const NOTE = (() => {
  let s = 300;
  const n = () => (s += 13);
  return [
    scribble(118, 104, 150, n(), 7),
    scribble(118, 146, 216, n(), 3.4),
    scribble(118, 170, 184, n(), 3.4),
    scribble(118, 194, 126, n(), 3.4),
    roughRect({ x: 118, y: 222, w: 112, h: 62 }, n(), 2.6),
    roughLine(244, 252, 312, 236, n(), 3),
    "M300 229 L314 235 L303 246",
    roughEllipse(326, 104, 46, 22, n()),
  ];
})();

function NoteScene({ play, reduce }) {
  return (
    <svg viewBox={VB} className="size-full" fill="none" aria-hidden="true">
      <g transform="rotate(-4 240 190)">
        <rect x="90" y="58" width="300" height="252" rx="6" fill="#F4F2EC" />
        <rect x="200" y="46" width="80" height="22" rx="2" fill="#FBBF24" opacity="0.55" />
        <g stroke="#050505" strokeOpacity="0.78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {NOTE.map((d, i) => (
            <motion.path key={i} d={d} {...draw(play, i, reduce)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* 02–04 — the same screen as wireframe, build, live -------------------------- */
function Rect({ b, rx = 4, ...p }) {
  return <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={rx} {...p} />;
}

function WireScene({ play, reduce }) {
  const items = [G.title, G.sub, G.sub2, G.button, G.image, ...G.cards];
  return (
    <svg viewBox={VB} className="size-full" fill="none" aria-hidden="true">
      <g stroke="var(--color-mute)" strokeWidth="1.25" strokeDasharray="5 4">
        <Rect b={G.frame} rx={10} />
        <line x1={G.bar.x} y1={G.bar.y + G.bar.h} x2={G.bar.x + G.bar.w} y2={G.bar.y + G.bar.h} />
        {items.map((b, i) => (
          <motion.g key={i} {...fade(play, i, reduce)}>
            <Rect b={b} />
          </motion.g>
        ))}
        <motion.g {...fade(play, 5, reduce)}>
          <line x1={G.image.x} y1={G.image.y} x2={G.image.x + G.image.w} y2={G.image.y + G.image.h} />
          <line x1={G.image.x + G.image.w} y1={G.image.y} x2={G.image.x} y2={G.image.y + G.image.h} />
        </motion.g>
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={64 + i * 12} cy={51} r={3} stroke="var(--color-mute)" strokeWidth="1.25" />
      ))}
    </svg>
  );
}

function Screen({ live }) {
  return (
    <>
      <Rect b={G.frame} rx={10} fill="var(--color-raised)" stroke="var(--color-line-strong)" />
      <path
        d={`M${G.bar.x} ${G.bar.y + G.bar.h}H${G.bar.x + G.bar.w}`}
        stroke="var(--color-line-strong)"
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={64 + i * 12} cy={51} r={3} fill="var(--color-mute)" opacity="0.5" />
      ))}
      <Rect b={G.title} fill="var(--color-fg)" />
      <Rect b={G.sub} fill="var(--color-mute)" opacity="0.55" />
      <Rect b={G.sub2} fill="var(--color-mute)" opacity="0.35" />
      <Rect b={G.button} fill="#16A34A" />
      <Rect b={G.image} rx={8} fill="var(--color-accent)" opacity={live ? 0.22 : 0.14} />
      {live && (
        <path
          d={`M${G.image.x + 14} ${G.image.y + 80} L${G.image.x + 40} ${G.image.y + 56} L${G.image.x + 62} ${G.image.y + 66} L${
            G.image.x + 100
          } ${G.image.y + 28}`}
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {G.cards.map((b, i) => (
        <g key={i}>
          <Rect b={b} rx={8} fill="var(--color-bg)" stroke="var(--color-line-strong)" />
          <rect x={b.x + 12} y={b.y + 14} width={48} height={7} rx={3} fill="var(--color-mute)" opacity="0.5" />
          <rect x={b.x + 12} y={b.y + 34} width={64} height={16} rx={3} fill="var(--color-fg)" opacity={live ? 0.9 : 0.6} />
        </g>
      ))}
    </>
  );
}

function BuildScene({ play, reduce, log }) {
  return (
    <div className="relative size-full">
      <svg viewBox={VB} className="size-full" fill="none" aria-hidden="true">
        <motion.g
          initial={reduce || !play ? false : { opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Screen live={false} />
        </motion.g>
      </svg>
      <div className="tone-dark absolute right-[3%] bottom-[4%] w-[50%] rounded-[10px] border border-line-strong bg-ink p-[3.5%] font-mono text-[clamp(9px,1.1vw,12px)] leading-relaxed shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)]">
        {log.map((line, i) => (
          <motion.p
            key={line}
            {...fade(play, i * 1.6, reduce)}
            className="flex items-center gap-2 text-white/80"
          >
            <Check aria-hidden="true" strokeWidth={2} className="size-3 shrink-0 text-live" />
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

function LiveScene({ play, reduce, label, url }) {
  return (
    <div className="relative size-full">
      <svg viewBox={VB} className="size-full" fill="none" aria-hidden="true">
        <Screen live />
        <rect x="150" y="44" width="180" height="15" rx="7.5" fill="var(--color-bg)" />
        <text x="240" y="55" textAnchor="middle" className="font-mono" fontSize="9" fill="var(--color-mute)">
          {url}
        </text>
      </svg>
      <motion.span
        {...fade(play, 1, reduce)}
        className="absolute top-[12.5%] right-[12%] inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase"
      >
        <span className="relative flex size-1.5">
          <span className="live-pulse absolute inset-0 rounded-full bg-live" />
          <span className="relative size-1.5 rounded-full bg-live" />
        </span>
        {label}
      </motion.span>
    </div>
  );
}

/** Renders the illustration for step `index`. `play` animates it in. */
export default function ProcessScene({ index, play = true, visual }) {
  const reduce = useReducedMotion();
  if (index === 0) return <NoteScene play={play} reduce={reduce} />;
  if (index === 1) return <WireScene play={play} reduce={reduce} />;
  if (index === 2) return <BuildScene play={play} reduce={reduce} log={visual.log} />;
  return <LiveScene play={play} reduce={reduce} label={visual.live} url={visual.url} />;
}
