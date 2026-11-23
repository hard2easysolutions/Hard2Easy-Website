import { site } from "./site";

const isDev = process.env.NODE_ENV === "development";

/**
 * Client logos to render. Real logos always; placeholders only in development.
 */
export function visibleLogos() {
  return site.clients.logos.filter((l) => l.logo || isDev);
}

/** Numbers strip: only items whose value is a real number. */
export function visibleNumbers() {
  return site.numbers.filter((n) => typeof n.value === "number");
}

/** Nav links, dropping sections that will not render. */
export function navLinks() {
  const hasClients = visibleLogos().length > 0;
  return site.nav.links.filter((l) => l.id !== "clients" || hasClients);
}

export const placeholderPattern = /^\[.*\]$/;

/** True when a contact value is still a [placeholder]. */
export const isPlaceholder = (v) => typeof v === "string" && placeholderPattern.test(v.trim());
