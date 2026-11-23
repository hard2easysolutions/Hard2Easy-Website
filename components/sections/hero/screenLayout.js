// Shared geometry for the hero "Sketch → Live" screen.
// Units are a 1000 × 660 artboard. The SVG sketch draws in these units and the
// HTML live UI converts them to percentages, so both layers line up exactly.

export const W = 1000;
export const H = 660;

export const box = (x, y, w, h) => ({ x, y, w, h });

export const L = {
  sidebar: box(0, 0, 190, 660),
  logo: box(28, 30, 30, 30),
  brand: box(68, 36, 86, 18),
  nav: [0, 1, 2, 3, 4].map((i) => box(20, 100 + i * 46, 150, 34)),

  title: box(222, 32, 170, 40),
  search: box(610, 32, 250, 38),
  avatar: { cx: 935, cy: 51, r: 19 },

  kpis: [0, 1, 2].map((i) => box(222 + i * 257, 98, 241, 128)),

  chart: box(222, 248, 446, 384),
  chartPlot: { x: 250, base: 584, w: 390, max: 236 },

  list: box(684, 248, 293, 384),
  listRows: [0, 1, 2, 3].map((i) => 330 + i * 72),
};

/** Artboard box → absolute-position style in percentages. */
export function pct({ x, y, w, h }) {
  return {
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    width: `${(w / W) * 100}%`,
    height: `${(h / H) * 100}%`,
  };
}

/** Bar geometry for index i of n in the chart plot. */
export function bar(i, n, value) {
  const slot = L.chartPlot.w / n;
  const bw = slot * 0.52;
  const h = (value / 100) * L.chartPlot.max;
  return box(L.chartPlot.x + i * slot + (slot - bw) / 2, L.chartPlot.base - h, bw, h);
}
