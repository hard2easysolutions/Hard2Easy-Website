"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { site } from "@/content/site";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { EASE } from "@/components/ui/motion";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { ArrowUpRight, MapPin } from "lucide-react";
import SocialLinks from "@/components/ui/SocialLinks";
import { isPlaceholder, navLinks, whatsappHref } from "@/content/derive";

const NAV_LINKS = navLinks();
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Nav() {
  const { nav: navContent, brand, ui, contact } = site;
  const nav = { ...navContent, links: NAV_LINKS };
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const lastY = useRef(0);

  // --- scrolled / hide-on-scroll-down ----------------------------------------
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    setScrolled(y > 40);
    if (open) return;
    if (y < 120) setHidden(false);
    else if (delta > 4) setHidden(true);
    else if (delta < -4) setHidden(false);
  });

  // --- active section ---------------------------------------------------------
  useEffect(() => {
    const sections = nav.links.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const current = nav.links.find((l) => visible.get(l.id));
        setActive(current ? current.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [nav.links]);

  // --- mobile menu: lock scroll, inert page, Esc, focus trap -----------------
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const main = document.getElementById("main");
    const footer = document.querySelector("footer");
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      if (main) main.inert = true;
      if (footer) footer.inert = true;
      requestAnimationFrame(() => {
        rootRef.current?.querySelector("[data-menu-link]")?.focus();
      });
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      if (main) main.inert = false;
      if (footer) footer.inert = false;
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [...rootRef.current.querySelectorAll(FOCUSABLE)].filter(
        (n) => n.offsetParent !== null || n === document.activeElement
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close the menu if the viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    // Wait a frame so Lenis is restarted before scrolling.
    requestAnimationFrame(() => scrollToTarget(lenis, href));
    if (typeof href === "string") history.replaceState(null, "", href);
  };

  // When the menu is open the full-screen sheet is the background, so the bar goes clear.
  // Scrolled: frosted bar. Menu open: fully opaque bar so nothing shows through.
  const solid = scrolled && !open;

  return (
    <div ref={rootRef}>
    <motion.header
      initial={false}
      animate={{ y: hidden && !open ? "-100%" : "0%" }}
      transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`relative z-10 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ease-quint ${
          open ? "border-line bg-bg" : solid ? "border-line bg-bg/80 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-18 w-full max-w-site items-center justify-between px-5 md:px-8 lg:px-12">
          <a
            href="#main"
            onClick={(e) => go(e, 0)}
            className="-ml-1 flex min-h-11 items-center rounded-btn px-1"
            aria-label={`${brand.name} — ${ui.backToTop}`}
          >
            <Logo name={brand.name} priority className="h-8 sm:h-9" />
          </a>

          <nav aria-label={ui.navPrimary} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    aria-current={active === link.id ? "true" : undefined}
                    className="group relative flex min-h-11 items-center px-3.5 text-[14px] text-fg/75 transition-colors duration-200 hover:text-fg aria-[current]:text-fg"
                  >
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-250 ease-quint group-hover:-translate-y-full">
                        {link.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 block translate-y-full transition-transform duration-250 ease-quint group-hover:translate-y-0"
                      >
                        {link.label}
                      </span>
                    </span>
                    {active === link.id && (
                      <motion.span
                        layoutId="nav-dot"
                        aria-hidden="true"
                        transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                        className="absolute bottom-1.5 left-1/2 -ml-0.5 size-1 rounded-full bg-accent"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <span className="hidden md:block">
              <Button href={nav.cta.href} size="sm" onClick={(e) => go(e, nav.cta.href)}>
                {nav.cta.label}
              </Button>
            </span>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? ui.menuClose : ui.menuOpen}
              className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-btn md:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-6">
                <motion.span
                  className="absolute top-0 left-0 block h-[1.5px] w-6 origin-center bg-fg"
                  animate={open ? { y: 5.25, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-[1.5px] w-6 origin-center bg-fg"
                  animate={open ? { y: -5.25, rotate: -45, width: 24 } : { y: 0, rotate: 0, width: 16 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={ui.menuLabel}
            // A solid, opaque sheet slides down over the whole screen, then the content follows.
            initial={reduce ? { opacity: 0 } : { y: "-100%" }}
            animate={reduce ? { opacity: 1 } : { y: "0%" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { y: "-100%", transition: { duration: 0.45, ease: EASE, delay: 0.05 } }
            }
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
            style={{ backgroundColor: "var(--color-bg)" }}
            className="fixed inset-x-0 top-0 z-40 flex h-lvh min-h-dvh w-screen flex-col no-scrollbar overflow-x-hidden overflow-y-auto overscroll-contain bg-bg opacity-100 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] md:hidden"
          >

            {/* Sheet is 100lvh (never a gap when the browser bar collapses); the
                content column is 100dvh so the contact block stays in view. */}
            <nav aria-label={ui.navMobile} className="relative flex max-h-max flex-1 flex-col px-5 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <motion.p
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="text-label text-mute"
              >
                {ui.menuLabel}
              </motion.p>

              <ul className="mt-3 border-t border-line">
                {nav.links.map((link, i) => {
                  const isActive = active === link.id;
                  return (
                    <li key={link.id} className="overflow-hidden border-b border-line">
                      <motion.a
                        data-menu-link
                        href={link.href}
                        onClick={(e) => go(e, link.href)}
                        aria-current={isActive ? "true" : undefined}
                        initial={reduce ? false : { y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={reduce ? undefined : { y: "-40%", opacity: 0, transition: { duration: 0.25 } }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.22 + i * 0.06 }}
                        className="group flex min-h-14 cursor-pointer items-center justify-between gap-4 py-2"
                      >
                        <span
                          className={`text-[18px] leading-snug font-medium tracking-[-0.005em] transition-colors duration-200 ${
                            isActive ? "text-easy" : "text-fg group-active:text-accent"
                          }`}
                        >
                          {link.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          strokeWidth={1.25}
                          className="size-4 shrink-0 text-mute transition-transform duration-300 ease-quint group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:text-accent"
                        />
                      </motion.a>
                    </li>
                  );
                })}
              </ul>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
                className="mt-auto pt-12"
              >
                <Button href={nav.cta.href} arrow onClick={(e) => go(e, nav.cta.href)} className="w-full">
                  {nav.cta.label}
                </Button>

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-label text-mute">{ui.menuContact}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-[15px]">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-mute">{ui.menuEmail}</dt>
                      <dd className="mt-1 truncate">
                        {isPlaceholder(contact.email) ? (
                          contact.email
                        ) : (
                          <a href={`mailto:${contact.email}`} className="underline-offset-4 hover:underline">
                            {contact.email}
                          </a>
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-mute">{ui.menuWhatsApp}</dt>
                      {contact.phones.map((phone) => (
                        <dd key={phone} className="mt-1">
                          <a href={whatsappHref(phone)} className="underline-offset-4 hover:underline">
                            {phone}
                          </a>
                        </dd>
                      ))}
                    </div>
                  </dl>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="flex items-center gap-2 text-[14px] text-mute">
                      <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-accent" />
                      {contact.location}
                    </p>
                    <SocialLinks social={contact.social} />
                  </div>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
