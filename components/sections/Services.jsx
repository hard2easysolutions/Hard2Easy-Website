import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import ServicesGrid from "./services/ServicesGrid";

export default function Services() {
  const { services } = site;
  return (
    <section id="services" aria-labelledby="services-title" className="tone-alt relative bg-bg py-24 md:py-32 lg:py-40">
      <Container>
        <SectionHeader id="services-title" title={services.title} intro={services.subline} />

        <Reveal className="mt-14 md:mt-20">
          <ServicesGrid cards={services.cards} />
        </Reveal>

        <Reveal as="ul" stagger={0.08} className="mt-14 grid grid-cols-1 border-t border-line md:mt-16 md:grid-cols-3">
          {services.extras.map((extra, i) => (
            <RevealItem
              as="li"
              key={extra.title}
              className={`border-line py-7 md:px-7 md:py-9 ${i > 0 ? "border-t md:border-t-0 md:border-l" : ""} ${
                i === 0 ? "md:pl-0" : ""
              }`}
            >
              <p className="text-[15px] font-semibold">{extra.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">
                {Array.isArray(extra.body)
                  ? extra.body.map((part) =>
                      part.href ? (
                        <a
                          key={part.text}
                          href={part.href}
                          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                        >
                          {part.text}
                        </a>
                      ) : (
                        <span key={part.text}>{part.text}</span>
                      )
                    )
                  : extra.body}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
