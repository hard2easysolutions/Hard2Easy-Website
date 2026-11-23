// ---------------------------------------------------------------------------
// DO NOT EDIT TEXT HERE. All site content lives in /content/data/*.json —
// one file per page section. See /content/README.md for how to edit them.
//
// This file only gathers those JSON files into the single `site` object the
// components read, so the components never need to change when copy changes.
// ---------------------------------------------------------------------------

import about from "./data/about.json";
import brand from "./data/brand.json";
import clients from "./data/clients.json";
import contactDetails from "./data/contact-details.json";
import contactSection from "./data/contact.json";
import footer from "./data/footer.json";
import hero from "./data/hero.json";
import nav from "./data/nav.json";
import numbers from "./data/numbers.json";
import process from "./data/process.json";
import seo from "./data/seo.json";
import services from "./data/services.json";
import testimonials from "./data/testimonials.json";
import ui from "./data/ui.json";

export const site = {
  brand,
  meta: seo,
  contact: contactDetails,
  ui,
  nav,
  hero,
  numbers: numbers.items,
  process,
  services,
  clients,
  testimonials,
  about,
  contactSection,
  footer,
};
