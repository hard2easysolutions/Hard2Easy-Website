import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import HardToEasy from "./about/HardToEasy";

export default function About() {
  const { about } = site;
  return (
    <section id="about" aria-labelledby="about-title" className="tone-alt relative bg-bg py-24 md:py-32 lg:py-40">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow>{about.eyebrow}</Eyebrow>
          </Reveal>
          <SplitText id="about-title" text={about.title} className="text-h2 mt-6 max-w-[14ch] text-balance" />
          <Reveal delay={0.1} className="mt-8 space-y-5">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 20)} className="text-body max-w-[54ch] text-mute">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal as="ol" stagger={0.08} className="mt-12 border-t border-line">
            {about.pillars.map((pillar, i) => (
              <RevealItem
                as="li"
                key={pillar.title}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-6 sm:grid-cols-[4rem_1fr]"
              >
                <span className="pt-0.5 font-mono text-[12px] tracking-[0.14em] text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-[17px] font-semibold">{pillar.title}</span>
                  <span className="mt-1 block text-[16px] leading-relaxed text-mute">{pillar.body}</span>
                </span>
              </RevealItem>
            ))}
          </Reveal>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="lg:sticky lg:top-28 lg:h-[min(640px,calc(100dvh-9rem))]">
            <HardToEasy from={about.wordmark.from} to={about.wordmark.to} />
          </div>
        </div>
      </Container>
    </section>
  );
}
