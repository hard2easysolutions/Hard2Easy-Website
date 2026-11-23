import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroVisual from "./hero/HeroVisual";
import HeroOrbitFit from "./hero/HeroOrbitFit";
import { navLinks } from "@/content/derive";

// Intro timeline (seconds). CSS-driven so the H1 paints before hydration.
const T = {
  word0: 0.04,
  wordStep: 0.04,
  underline: 0.7,
  subtext: 0.45,
  buttons: 0.55,
  chips: 0.65,
};

const d = (s) => ({ "--d": `${s.toFixed(2)}s` });

function Word({ children, delay, className = "", style }) {
  return (
    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
      <span className={`intro-word ${className}`} style={{ ...d(delay), ...style }}>
        {children}
      </span>
    </span>
  );
}

export default function Hero() {
  const { hero, ui } = site;
  const lead = hero.headline.lead.split(" ");
  const accent = hero.headline.accent.split(" ");
  const delayOf = (i) => T.word0 + i * T.wordStep;

  return (
    <section aria-labelledby="hero-title" className="hero-orbit relative isolate overflow-hidden bg-bg">
      {/* The ring + disc are ::before / ::after on this section. This track rides
          the same circle and carries two satellites: green (easy) and orange (hard). */}
      <HeroOrbitFit />
      <span aria-hidden="true" className="hero-orbit-track orbit-track">
        <span className="orbit-dot orbit-dot--easy" />
        <span className="orbit-dot orbit-dot--hard" />
      </span>
      {/* fade the orbit out into the next section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-bg" />

      <Container className="relative pt-36 pb-20 md:pt-44 md:pb-28 lg:pt-48 lg:pb-32">
        <h1 id="hero-title" className="text-h1 max-w-[15ch] lg:max-w-[14ch] xl:max-w-[15.5ch]">
          {lead.map((w, i) => (
            <span key={i}>
              <Word delay={delayOf(i)}>{w}</Word>{" "}
            </span>
          ))}
          {/* "easy software." takes the easy (lime → green) end of the logo gradient;
              the hand-drawn underline runs the full hard → easy spectrum. */}
          <span className="relative inline-block whitespace-nowrap">
            {accent.map((w, i) => (
              <span key={i}>
                <Word
                  delay={delayOf(lead.length + i)}
                  className="text-easy"
                  style={{ backgroundSize: "200% 100%", backgroundPosition: i === 0 ? "0% 0" : "100% 0" }}
                >
                  {w}
                </Word>
                {i < accent.length - 1 ? " " : null}
              </span>
            ))}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -bottom-[0.16em] left-[-1%] h-[0.22em] w-[102%] overflow-visible"
              fill="none"
            >
              <defs>
                <linearGradient id="hero-underline" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#FF7A00" />
                  <stop offset="0.3" stopColor="#FBBF24" />
                  <stop offset="0.68" stopColor="#84CC16" />
                  <stop offset="1" stopColor="#16A34A" />
                </linearGradient>
              </defs>
              <path
                d="M4 15.5C58 9.8 121 7.4 197 8.6c62 1 101 4.8 168 4.1 74-.8 140-6.6 231-9.2"
                pathLength="1"
                stroke="url(#hero-underline)"
                strokeWidth="4.2"
                strokeLinecap="round"
                className="intro-draw"
                style={{ ...d(T.underline), "--dur": "0.9s" }}
              />
              <path
                d="M38 20.4c84-4.6 170-4.9 262-3.6 70 1 144-.6 214-4.2"
                pathLength="1"
                stroke="url(#hero-underline)"
                strokeOpacity="0.5"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="intro-draw"
                style={{ ...d(T.underline + 0.25), "--dur": "0.65s" }}
              />
            </svg>
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-14 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <div data-hero-copy className="lg:col-span-5 lg:pt-2">
            <p className="text-body intro-rise max-w-[46ch] text-mute" style={d(T.subtext)}>
              {hero.subtext}
            </p>

            <div className="intro-rise mt-9 flex flex-col items-start gap-4 whitespace-nowrap sm:flex-row sm:items-center sm:gap-7 lg:flex-col lg:items-start lg:gap-4 xl:flex-row xl:items-center xl:gap-7" style={d(T.buttons)}>
              <MagneticButton className="w-full sm:w-auto">
                <Button href={hero.primaryCta.href} arrow className="w-full sm:w-auto">
                  {hero.primaryCta.label}
                </Button>
              </MagneticButton>
              <Button href={navLinks().some((l) => l.id === "clients") ? hero.secondaryCta.href : "#services"} variant="text">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <ul className="intro-rise mt-10 flex flex-wrap gap-2" style={d(T.chips)}>
              {hero.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-btn border border-line-strong px-3 py-1.5 font-mono text-[12px] tracking-[0.02em] text-fg/80"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div data-hero-device className="lg:col-span-7">
            <HeroVisual visual={hero.visual} ui={ui} />
          </div>
        </div>
      </Container>
    </section>
  );
}
