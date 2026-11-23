import { Mail, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import Reveal from "@/components/ui/Reveal";
import { isPlaceholder, navLinks } from "@/content/derive";
import SocialLinks from "@/components/ui/SocialLinks";
import BackToTop from "./footer/BackToTop";

export default function Footer() {
  const { footer, brand, contact, ui } = site;
  const links = footer.links.filter((l) => l.href !== "#clients" || navLinks().some((n) => n.id === "clients"));
  const digits = contact.whatsapp.replace(/\D/g, "");

  return (
    <footer className="tone-dark relative overflow-hidden border-t border-line bg-bg text-fg">
      <Container className="relative pt-20 md:pt-28">
        <div className="grid grid-cols-1 gap-12 border-b border-line pb-14 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Logo name={brand.name} className="h-11 md:h-12" />
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-mute">{footer.blurb}</p>
          </div>

          <nav aria-label={ui.navFooter} className="md:col-span-3">
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-flex min-h-11 items-center text-[15px] text-fg/80 transition-colors hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <ul className="space-y-1 text-[15px] text-fg/80">
              <li>
                <a
                  href={isPlaceholder(contact.email) ? undefined : `mailto:${contact.email}`}
                  className="inline-flex min-h-11 items-center gap-3 transition-colors hover:text-fg"
                >
                  <Mail aria-hidden="true" strokeWidth={1.5} className="size-4 text-accent" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={digits ? `https://wa.me/${digits}` : undefined}
                  className="inline-flex min-h-11 items-center gap-3 transition-colors hover:text-fg"
                >
                  <MessageCircle aria-hidden="true" strokeWidth={1.5} className="size-4 text-accent" />
                  {contact.phone}
                </a>
              </li>
            </ul>
            <SocialLinks social={contact.social} className="mt-5" />
          </div>
        </div>

        <div className="flex flex-col gap-4 py-8 text-[13px] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            {footer.legal}
            {footer.rcNumber && (
              <>
                <span aria-hidden="true" className="mx-2 text-mute/50">
                  ·
                </span>
                <span className="whitespace-nowrap">{footer.rcNumber}</span>
              </>
            )}
          </p>
          <BackToTop label={ui.backToTop} />
        </div>
      </Container>

      <Reveal y={60} aria-hidden="true" className="pointer-events-none -mb-[3.2vw] select-none">
        <p className="text-center font-display text-[18vw] leading-[0.8] font-medium tracking-[-0.03em] whitespace-nowrap text-graphite">
          {footer.wordmark}
        </p>
      </Reveal>
    </footer>
  );
}
