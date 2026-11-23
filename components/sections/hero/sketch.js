// Hand-drawn stroke generator for the hero sketch layer.
// Deterministic (seeded) so server and client render identical paths.
// Every shape is a single continuous sub-path so pathLength-based drawing works.

import { L, bar } from "./screenLayout";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/** Catmull-Rom spline through points → cubic Bézier path. */
function spline(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(
      p2[0] - (p3[0] - p1[0]) / 6
    )} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Wobbly rectangle drawn in one stroke, overshooting where it started. */
export function roughRect({ x, y, w, h }, seed, j = 2.4) {
  const r = rng(seed);
  const J = (s = 1) => (r() - 0.5) * 2 * j * s;
  const c = Math.max(4, Math.min(12, w * 0.07, h * 0.07));
  return spline([
    [x + c * 2 + J(), y + J()],
    [x + w * 0.5 + J(), y + J(1.5)],
    [x + w - c + J(), y + J()],
    [x + w + J(0.5), y + c + J()],
    [x + w + J(1.5), y + h * 0.5 + J()],
    [x + w + J(), y + h - c + J()],
    [x + w - c + J(), y + h + J(0.5)],
    [x + w * 0.5 + J(), y + h + J(1.5)],
    [x + c + J(), y + h + J()],
    [x + J(0.5), y + h - c + J()],
    [x + J(1.5), y + h * 0.5 + J()],
    [x + J(), y + c + J()],
    [x + c + J(), y + J(0.5) - 1],
    [x + c * 3.4 + J(), y - 2 + J(0.5)],
  ]);
}

/** Zig-zag scribble that reads as handwriting. */
export function scribble(x, y, w, seed, amp = 4) {
  const r = rng(seed);
  const pts = [];
  const step = 7 + amp * 0.9;
  let cx = x;
  let up = true;
  while (cx < x + w) {
    pts.push([cx, y + (up ? -amp : amp) * (0.5 + r() * 0.5) + (r() - 0.5) * 1.4]);
    cx += step * (0.7 + r() * 0.6);
    up = !up;
  }
  pts.push([x + w, y + (r() - 0.5) * 2]);
  return spline(pts);
}

/** Slightly bowed straight line. */
export function roughLine(x1, y1, x2, y2, seed, j = 2) {
  const r = rng(seed);
  const J = () => (r() - 0.5) * 2 * j;
  return spline([
    [x1, y1],
    [x1 + (x2 - x1) * 0.33 + J(), y1 + (y2 - y1) * 0.33 + J()],
    [x1 + (x2 - x1) * 0.66 + J(), y1 + (y2 - y1) * 0.66 + J()],
    [x2 + J() * 0.5, y2 + J() * 0.5],
  ]);
}

/** Loose ellipse that loops past its start, like a pen circling something. */
export function roughEllipse(cx, cy, rx, ry, seed, turns = 1.14) {
  const r = rng(seed);
  const n = Math.round(13 * turns);
  const a0 = -Math.PI * 0.62 + r() * 0.3;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + t * Math.PI * 2 * turns;
    const grow = 1 + t * 0.08;
    const k = (1 + (r() - 0.5) * 0.08) * grow;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return spline(pts);
}

// ---------------------------------------------------------------------------
// The sketch itself. Order = drawing order.
// ---------------------------------------------------------------------------

export function buildSketch(values) {
  const paths = [];
  let seed = 11;
  const add = (d) => paths.push(d);
  const s = () => (seed += 7);

  // sidebar
  add(roughLine(190, 10, 188, 650, s(), 3));
  add(roughRect(L.logo, s(), 2));
  add(scribble(L.brand.x, L.brand.y + 9, L.brand.w, s(), 4));
  L.nav.forEach((n, i) => {
    add(scribble(n.x + 12, n.y + 17, 70 + ((i * 23) % 50), s(), 3.4));
  });

  // top bar
  add(scribble(L.title.x, L.title.y + 20, 150, s(), 8));
  add(roughRect(L.search, s(), 2.4));
  add(roughEllipse(L.avatar.cx, L.avatar.cy, L.avatar.r, L.avatar.r, s(), 1.08));

  // KPI tiles
  L.kpis.forEach((k) => {
    add(roughRect(k, s()));
    add(scribble(k.x + 20, k.y + 30, 64, s(), 3));
    add(scribble(k.x + 20, k.y + 74, 118, s(), 10));
    add(scribble(k.x + 20, k.y + 106, 44, s(), 2.6));
  });

  // chart card
  add(roughRect(L.chart, s()));
  add(scribble(L.chart.x + 26, L.chart.y + 34, 108, s(), 4));
  add(roughLine(L.chartPlot.x - 6, L.chartPlot.base + 2, L.chartPlot.x + L.chartPlot.w + 6, L.chartPlot.base, s(), 1.5));
  values.forEach((v, i) => {
    add(roughRect(bar(i, values.length, v), s(), 2));
  });
  // circle the peak bar + arrow + note
  const peakI = values.indexOf(Math.max(...values));
  const peak = bar(peakI, values.length, values[peakI]);
  add(roughEllipse(peak.x + peak.w / 2, peak.y + 12, peak.w * 1.25, 34, s()));
  add(roughLine(peak.x + peak.w + 74, peak.y - 52, peak.x + peak.w + 22, peak.y - 14, s(), 4));
  add(
    `M${f(peak.x + peak.w + 22)} ${f(peak.y - 30)} L${f(peak.x + peak.w + 20)} ${f(peak.y - 13)} L${f(
      peak.x + peak.w + 38
    )} ${f(peak.y - 12)}`
  );
  add(scribble(peak.x + peak.w + 70, peak.y - 66, 68, s(), 3.4));

  // list card
  add(roughRect(L.list, s()));
  add(scribble(L.list.x + 24, L.list.y + 34, 112, s(), 4));
  L.listRows.forEach((y) => {
    add(roughEllipse(L.list.x + 42, y, 16, 16, s(), 1.05));
    add(scribble(L.list.x + 70, y - 8, 84, s(), 3));
    add(scribble(L.list.x + 70, y + 12, 46, s(), 2.4));
    add(scribble(L.list.x + 212, y - 2, 50, s(), 3));
  });

  return paths;
}
