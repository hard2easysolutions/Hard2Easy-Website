import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import TestimonialCarousel from "./testimonials/TestimonialCarousel";

export default function Testimonials() {
  const { testimonials, ui } = site;
  if (!testimonials.items.length) return null;

  return (
    <section aria-labelledby="testimonials-title" className="relative overflow-hidden bg-bg py-24 md:py-32 lg:py-40">
      <Container>
        <SectionHeader id="testimonials-title" title={testimonials.title} />
      </Container>
      <Reveal className="mt-14 md:mt-16">
        <TestimonialCarousel items={testimonials.items} ui={ui} titleId="testimonials-title" />
      </Reveal>
    </section>
  );
}
