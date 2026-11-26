import { Mail, MapPin, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import Orbit from "@/components/ui/Orbit";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { isPlaceholder, whatsappHref } from "@/content/derive";
import ContactForm from "./contact/ContactForm";

function ContactLine({ icon: Icon, href, children }) {
  const inner = (
    <>
      <Icon aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0 text-accent" />
      <span>{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="inline-flex min-h-11 items-center gap-3 transition-colors hover:text-fg">
          {inner}
        </a>
      ) : (
        <span className="inline-flex min-h-11 items-center gap-3">{inner}</span>
      )}
    </li>
  );
}

export default function Contact() {
  const { contactSection: c, contact } = site;

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden bg-bg py-24 md:py-32 lg:py-40">
      {/* echo of the hero orbit, so the page opens and closes on the same circle */}
      <Orbit disc className="-right-[35vw] -bottom-[30vw] w-[110vw] opacity-80 lg:-right-[18vw] lg:-bottom-[22vw] lg:w-[min(1200px,80vw)]" speed="48s" />
      <Container className="relative">
        <SectionHeader id="contact-title" eyebrow={c.eyebrow} title={c.title} intro={c.intro} />

        <div className="mt-14 grid grid-cols-1 gap-5 md:mt-20 lg:grid-cols-12">
          {/* The form is the main event, so it comes first on mobile and sits right on desktop. */}
          <Reveal className="rounded-card border border-line bg-raised p-7 md:p-10 lg:order-2 lg:col-span-7">
            <h3 className="mb-7 text-[17px] font-semibold">{c.form.title}</h3>
            <ContactForm copy={c.form} />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col rounded-card border border-line bg-raised p-7 md:p-9 lg:order-1 lg:col-span-5">
            <h3 className="text-[17px] font-semibold">{c.next.title}</h3>
            <ol className="mt-6 space-y-5">
              {c.next.steps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[12px] text-fg"
                    style={{ borderColor: `var(--color-step-${Math.min(i + 1, 4)})` }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 text-[15px] leading-snug text-fg/85">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-line pt-7 lg:mt-auto">
              <p className="text-[14px] text-mute">{c.form.replyNote}</p>
              <ul className="mt-3 text-[15px] text-fg/85">
                <ContactLine icon={Mail} href={isPlaceholder(contact.email) ? null : `mailto:${contact.email}`}>
                  {contact.email}
                </ContactLine>
                {contact.phones.map((phone) => (
                  <ContactLine key={phone} icon={MessageCircle} href={whatsappHref(phone)}>
                    {phone}
                  </ContactLine>
                ))}
                <ContactLine icon={MapPin}>{contact.location}</ContactLine>
              </ul>
              <p className="mt-5 text-[12px] leading-relaxed text-mute">{c.form.privacy}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
