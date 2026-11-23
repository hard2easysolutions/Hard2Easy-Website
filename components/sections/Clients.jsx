import Image from "next/image";
import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Marquee from "@/components/ui/Marquee";
import Reveal from "@/components/ui/Reveal";
import { visibleLogos } from "@/content/derive";

// IMPORTANT: get written permission from each client before showing their logo.

function LogoItem({ item, label }) {
  if (item.logo) {
    return (
      <Image
        src={item.logo}
        alt={item.name}
        width={160}
        height={56}
        className="h-12 w-auto object-contain opacity-60 grayscale transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0"
      />
    );
  }
  // Development-only placeholder wordmark box.
  return (
    <div className="flex h-16 w-44 flex-col items-center justify-center rounded-btn border border-dashed border-line-strong bg-fg/[0.03] text-center">
      <span className="font-mono text-[11px] tracking-[0.14em] text-mute uppercase">{label}</span>
      <span className="mt-1 text-[12px] text-mute/80">{item.placeholder}</span>
    </div>
  );
}

export default function Clients() {
  const { clients } = site;
  const logos = visibleLogos();
  if (!logos.length) return null;

  return (
    <section id="clients" aria-labelledby="clients-title" className="tone-alt relative border-t border-line bg-bg py-24 md:py-32">
      <Container>
        <SectionHeader id="clients-title" title={clients.title} intro={clients.subline} />
      </Container>

      <Reveal className="mt-14 md:mt-16">
        {logos.length >= 5 ? (
          <>
            <div className="motion-reduce:hidden">
              <Marquee duration={36}>
                {/* repeat so one copy of the track is wider than a 1920px screen */}
                {[...logos, ...logos].map((item, i) => (
                  <div key={i} className="px-5 md:px-8">
                    <LogoItem item={item} label={clients.placeholderLabel} />
                  </div>
                ))}
              </Marquee>
            </div>
            <Container className="hidden motion-reduce:block">
              <ul className="flex flex-wrap justify-center gap-6">
                {logos.map((item, i) => (
                  <li key={i}>
                    <LogoItem item={item} label={clients.placeholderLabel} />
                  </li>
                ))}
              </ul>
            </Container>
          </>
        ) : (
          <Container>
            <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {logos.map((item, i) => (
                <li key={i}>
                  <LogoItem item={item} label={clients.placeholderLabel} />
                </li>
              ))}
            </ul>
          </Container>
        )}
      </Reveal>
    </section>
  );
}
