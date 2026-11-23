import Container from "@/components/ui/Container";
import Counter from "@/components/ui/Counter";
import Reveal, { RevealItem } from "@/components/ui/Reveal";
import { visibleNumbers } from "@/content/derive";
import { site } from "@/content/site";

export default function Numbers() {
  const items = visibleNumbers();
  if (!items.length) return null;

  // One real figure: a single wide band — value, a line that turns from
  // dashed (sketch) to solid (live), then the label.
  if (items.length === 1) {
    const [n] = items;
    return (
      <section aria-label={site.ui.numbersLabel} className="relative bg-bg">
        <Container>
          <Reveal className="flex flex-col gap-5 border-y border-line py-10 sm:flex-row sm:items-center sm:gap-8 md:py-14">
            <p className="text-[clamp(2.75rem,6vw,3.5rem)] leading-none tracking-[-0.04em]">
              <Counter value={n.value} suffix={n.suffix} />
            </p>
            <svg aria-hidden="true" className="hidden h-2 flex-1 sm:block" preserveAspectRatio="none" viewBox="0 0 100 2">
              <line x1="0" y1="1" x2="55" y2="1" stroke="var(--color-warm)" strokeDasharray="1.2 1.6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <line x1="55" y1="1" x2="100" y2="1" stroke="var(--color-accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <p className="font-mono text-[13px] tracking-[0.14em] text-mute uppercase">{n.label}</p>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section aria-label={site.ui.numbersLabel} className="relative bg-bg">
      <Container>
        <Reveal
          as="dl"
          stagger={0.08}
          className="grid grid-cols-2 border-y border-line md:grid-cols-4"
        >
          {items.map((n, i) => (
            <RevealItem
              key={n.label}
              className={`flex flex-col-reverse gap-3 border-line px-5 py-10 md:px-8 md:py-14 ${
                i % 2 === 1 ? "border-l" : ""
              } ${i > 0 && i % 2 === 0 ? "md:border-l" : ""} ${i < 2 && items.length > 2 ? "border-b md:border-b-0" : ""}`}
            >
              <dt className="text-[14px] text-mute">{n.label}</dt>
              <dd className="text-[clamp(2.5rem,4.5vw,3.5rem)] leading-none tracking-[-0.04em]">
                <Counter value={n.value} suffix={n.suffix} />
              </dd>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
