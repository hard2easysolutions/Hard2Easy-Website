// ---------------------------------------------------------------------------
// npm run check:content
//
// Checks every file in content/data/*.json:
//   1. the JSON is valid (missing commas, quotes, brackets…) — with line numbers
//   2. every required field is there and has the right type
//   3. every image path points to a real file in /public
// Runs automatically before `npm run build`, so a broken edit never ships.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "content", "data");
const PUBLIC = path.join(ROOT, "public");

const str = z.string().min(1, "must not be empty");
const link = z.object({ label: str, href: str });
const imagePath = z.string().startsWith("/", 'must start with "/" (a path inside /public)');
const image = z.object({ src: imagePath, width: z.number().int().positive(), height: z.number().int().positive() });

const schemas = {
  "brand.json": z.object({
    name: str,
    legalName: str,
    tagline: str,
    url: str,
    locality: str,
    country: str,
    logos: z.object({ onDark: image, onLight: image, mark: image }),
  }),
  "seo.json": z.object({ title: str, description: str }),
  "contact-details.json": z.object({
    email: str,
    phones: z.array(str).min(1),
    location: str,
    replyTime: str,
    social: z.object({ linkedin: str, x: str, instagram: str }),
  }),
  "nav.json": z.object({
    links: z.array(z.object({ label: str, href: z.string().startsWith("#"), id: str })).min(1),
    cta: link,
  }),
  "hero.json": z.object({
    headline: z.object({ lead: str, accent: str }),
    subtext: str,
    primaryCta: link,
    secondaryCta: link,
    chips: z.array(str),
    visual: z.object({
      sketchLabel: str,
      liveLabel: str,
      screen: z.object({
        title: str,
        search: str,
        user: str,
        nav: z.array(str).min(1).max(5, "the mock sidebar has room for 5 items"),
        kpis: z.array(z.object({ label: str, value: str, delta: str })).length(3, "the mock dashboard has exactly 3 KPI tiles"),
        chart: z
          .object({
            title: str,
            days: z.array(str),
            values: z.array(z.number().min(0).max(100, "chart values are percentages (0–100)")),
          })
          .refine((c) => c.days.length === c.values.length, "chart.days and chart.values must have the same number of items"),
        list: z.object({
          title: str,
          rows: z
            .array(z.object({ initials: str, name: str, meta: str, amount: str }))
            .length(4, "the mock list has exactly 4 rows"),
        }),
      }),
    }),
  }),
  "numbers.json": z.object({
    items: z.array(z.object({ value: z.union([z.number(), z.string()]), label: str, suffix: z.string().optional() })),
  }),
  "process.json": z.object({
    title: str,
    intro: str,
    steps: z.array(z.object({ title: str, body: str })).min(1),
    visual: z.object({ log: z.array(str), live: str, url: str }),
  }),
  "services.json": z.object({
    title: str,
    subline: str,
    cards: z
      .array(
        z.object({
          icon: z.enum(["PenTool", "LayoutDashboard", "Workflow", "AppWindow"], {
            message: "icon must be one of PenTool, LayoutDashboard, Workflow, AppWindow",
          }),
          title: str,
          description: str,
          items: z.array(str).min(1),
        })
      )
      .min(1),
    extras: z.array(
      z.object({
        title: str,
        body: z.union([str, z.array(z.object({ text: str, href: z.string().optional() }))]),
      })
    ),
  }),
  "clients.json": z.object({
    title: str,
    subline: str,
    placeholderLabel: str,
    logos: z.array(z.object({ name: str, logo: imagePath.nullable(), placeholder: z.string().optional() })),
  }),
  "testimonials.json": z.object({
    title: str,
    items: z.array(z.object({ quote: str, name: str, role: str, company: str, photo: imagePath.nullable() })),
  }),
  "about.json": z.object({
    eyebrow: str,
    title: str,
    paragraphs: z.array(str).min(1),
    pillars: z.array(z.object({ title: str, body: str })),
    wordmark: z.object({ from: str, to: str }),
  }),
  "contact.json": z.object({
    eyebrow: str,
    title: str,
    intro: str,
    next: z.object({ title: str, steps: z.array(str).min(1) }),
    form: z.object({
      title: str,
      fields: z.object({ name: str, email: str, phone: str, service: str, message: str }),
      servicePlaceholder: str,
      serviceOptions: z.array(str).min(1, "add at least one option for the 'What do you need?' dropdown"),
      submit: str,
      sending: str,
      requiredNote: str,
      popup: z.object({ title: str, body: str, button: str, close: str }),
      errors: z.object({ name: str, email: str, phone: str, service: str, message: str, server: str }),
      replyNote: str,
      privacy: str,
    }),
  }),
  "footer.json": z.object({ blurb: str, links: z.array(link), legal: str, rcNumber: z.string(), wordmark: str }),
  "ui.json": z.object({
    skipLink: str,
    menuOpen: str,
    menuClose: str,
    menuLabel: str,
    menuContact: str,
    menuEmail: str,
    menuWhatsApp: str,
    sliderLabel: str,
    sliderHint: str,
    backToTop: str,
    themeToLight: str,
    themeToDark: str,
    carouselPrev: str,
    carouselNext: str,
    carouselGoTo: str,
    expand: str,
    navPrimary: str,
    navMobile: str,
    navFooter: str,
    numbersLabel: str,
    socialNames: z.object({ linkedin: str, x: str, instagram: str }),
  }),
};

// Collect every image path in a file so we can check it exists.
function imagePaths(name, data) {
  if (name === "brand.json") return Object.values(data.logos).map((l) => l.src);
  if (name === "clients.json") return data.logos.map((l) => l.logo).filter(Boolean);
  if (name === "testimonials.json") return data.items.map((t) => t.photo).filter(Boolean);
  return [];
}

function lineOf(text, message) {
  const pos = Number(/position (\d+)/.exec(message)?.[1]);
  if (Number.isNaN(pos)) return "";
  return ` (around line ${text.slice(0, pos).split("\n").length})`;
}

const problems = [];
const files = fs.readdirSync(DATA).filter((f) => f.endsWith(".json"));

for (const name of Object.keys(schemas)) {
  if (!files.includes(name)) problems.push(`${name}: file is missing from content/data/`);
}

for (const name of files) {
  const text = fs.readFileSync(path.join(DATA, name), "utf8");
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    problems.push(`${name}: not valid JSON${lineOf(text, e.message)} — check for a missing comma, quote or bracket. (${e.message})`);
    continue;
  }
  const schema = schemas[name];
  if (!schema) {
    problems.push(`${name}: unknown file — the site does not read it. Rename it or remove it.`);
    continue;
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const where = issue.path.length ? issue.path.join(" → ") : "(top level)";
      problems.push(`${name}: ${where}: ${issue.message}`);
    }
    continue;
  }
  for (const p of imagePaths(name, data)) {
    if (!fs.existsSync(path.join(PUBLIC, p))) problems.push(`${name}: image "${p}" not found — put the file in /public${p}`);
  }
}

if (problems.length) {
  console.error(`\n✖ Content check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):\n`);
  problems.forEach((p) => console.error(`  • ${p}`));
  console.error("\nFix these in content/data/ and run `npm run check:content` again.\n");
  process.exit(1);
}

console.log(`✓ Content OK — ${files.length} files in content/data/ checked.`);
