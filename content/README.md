# Editing the website content

Every word, link and image path on the site lives in **`content/data/`** — one JSON file per section of the page. You never need to touch the React components to change copy.

## Which file controls what

| Page area (top → bottom) | File |
|---|---|
| Browser tab title, Google / social preview text | `seo.json` |
| Company name, logo files | `brand.json` |
| Top menu links and the "Start a Project" button | `nav.json` |
| Hero (headline, intro, buttons, chips, the Sketch → Live dashboard) | `hero.json` |
| Numbers strip | `numbers.json` |
| How we work (4 steps) | `process.json` |
| What we do (service cards + the 3 small boxes) | `services.json` |
| Trusted by (client logos) | `clients.json` |
| What our clients say (testimonials) | `testimonials.json` |
| About | `about.json` |
| Contact (headings, "What happens next" steps, form labels, dropdown options, errors) | `contact.json` |
| Email, phone, WhatsApp, location, social links | `contact-details.json` |
| Footer | `footer.json` |
| Small labels for buttons and screen readers | `ui.json` |

Each file starts with a `"_help"` line that explains its fields. Fields starting with `_` are notes for people; the site ignores them.

## How to edit

1. Open the file, change the text **inside the quotes**, save.
2. Run the checker:

   ```bash
   npm run check:content
   ```

   It tells you exactly what is wrong and where, for example:

   ```
   • hero.json: not valid JSON (around line 7) — check for a missing comma, quote or bracket.
   • services.json: cards → 2 → icon: icon must be one of PenTool, LayoutDashboard, Workflow, AppWindow
   • clients.json: image "/clients/iretix.svg" not found — put the file in /public/clients/iretix.svg
   ```

3. Check it in the browser with `npm run dev`. The checker also runs automatically before every `npm run build`, so a broken file can't be deployed.

## JSON rules that trip people up

- Text always goes in **double quotes**: `"title": "What we do"` — not single quotes.
- Items in a list or object are separated by **commas**, but there is **no comma after the last one**.
- To use a double quote inside text, write `\"`, e.g. `"He said \"hello\""`.
- `null` (no quotes) means "nothing", e.g. `"photo": null`.
- Numbers have no quotes: `"value": 25` shows as a counting number; `"value": "[00+]"` is a placeholder and is hidden.

## Common tasks

**Add a list item** (a chip, a service bullet, a paragraph) — copy an existing line, paste it below, change the text, and make sure the line above it ends with a comma.

```json
"chips": [
  "Free consultation",
  "Sketch to live",
  "Design, build, test, support",
  "New chip here"
]
```

**Add a client logo** — get written permission first. Put the image in `public/clients/` (SVG or PNG, transparent background), then in `clients.json`:

```json
{ "name": "Iretix", "logo": "/clients/iretix.svg" }
```

Logos show in greyscale and turn to colour on hover. Five or more logos scroll as a marquee.

**Add a testimonial** — only real, approved quotes. Put a square photo (at least 96×96) in `public/testimonials/`, then add to `testimonials.json` → `items`:

```json
{
  "quote": "They turned our spreadsheet chaos into one simple system.",
  "name": "Ada Obi",
  "role": "Operations Lead",
  "company": "Example Ltd",
  "photo": "/testimonials/ada-obi.jpg"
}
```

Use `"photo": null` to show initials instead. Delete every item to hide the whole section.

**Show a real number** — in `numbers.json`, replace the placeholder text with a number:

```json
{ "value": 40, "suffix": "+", "label": "Projects delivered" }
```

**Change a service icon** — `"icon"` must be one of `PenTool`, `LayoutDashboard`, `Workflow`, `AppWindow`.

**Change the logo** — replace the files in `public/brand/` (keep the names) or point `brand.json → logos → src` at new files. Update `width` / `height` to the new image's pixel size.

**Fill in placeholders** — anything in `[square brackets]` is a placeholder (email, phone, social links…). Replace the whole thing including the brackets. Until then, the site shows it as plain text without a link.

## Things that are *not* in these files

- **Where form messages are emailed** — `CONTACT_TO_EMAIL` in `.env.local`.
- **Colours and fonts** — `app/globals.css` (design tokens at the top).
- **How form emails are sent** — `app/api/contact/route.js` (uses Resend; needs `RESEND_API_KEY`).
