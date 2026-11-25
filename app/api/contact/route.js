import { z } from "zod";
import { contactSchema } from "@/lib/contact-schema";

// ---------------------------------------------------------------------------
// Contact form → email.
// Every valid submission is emailed to CONTACT_TO_EMAIL through Resend
// (https://resend.com). Settings live in .env.local (never committed).
// ---------------------------------------------------------------------------

const DEFAULT_TO = "hard2easysolutions@gmail.com";
// Resend's shared test sender. It only delivers to the email address that
// owns the Resend account, so sign up to Resend with the inbox above — or
// verify your own domain in Resend and set CONTACT_FROM_EMAIL.
const DEFAULT_FROM = "Hard2Easy Website <onboarding@resend.dev>";

// Light abuse guard: max 5 submissions per IP every 10 minutes (per server
// instance). Stops a bot from flooding the inbox or the Resend quota.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function buildEmail({ name, email, phone, service, message }) {
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Call / WhatsApp", phone],
    ["Needs", service],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${message}\n\n— Sent from the Hard2Easy website contact form. Reply to this email to answer ${name}.`;
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#050505;max-width:600px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#16a34a">New website enquiry</p>
  <h1 style="margin:0 0 20px;font-size:22px">${escapeHtml(name)}</h1>
  <table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;border-top:1px solid #e5e5e5;color:#5c5c5c;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 0;border-top:1px solid #e5e5e5">${escapeHtml(v)}</td></tr>`
    )
    .join("")}</table>
  <p style="margin:24px 0 8px;color:#5c5c5c">Message</p>
  <div style="white-space:pre-wrap;padding:16px;border:1px solid #e5e5e5;border-radius:8px">${escapeHtml(message)}</div>
  <p style="margin:24px 0 0;font-size:13px;color:#5c5c5c">Sent from the Hard2Easy website contact form. Just hit reply to answer ${escapeHtml(name)}.</p>
</div>`;
  return { text, html };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot filled → pretend success so bots learn nothing.
  if (body && typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, errors: z.flattenError(parsed.error).fieldErrors }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Local development without a key: show the submission in the terminal
    // instead of emailing it. In production a missing key is an error, so a
    // visitor is never told "sent" when nothing was sent.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[contact] RESEND_API_KEY is not set — this message was NOT emailed:\n", data);
      return Response.json({ ok: true, dev: true });
    }
    console.error("[contact] RESEND_API_KEY is not set — cannot deliver contact form messages.");
    return Response.json({ ok: false, error: "Email is not configured." }, { status: 503 });
  }

  const { text, html } = buildEmail(data);
  const subject = `New enquiry from ${data.name} — ${data.service}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: (process.env.CONTACT_TO_EMAIL || DEFAULT_TO).split(",").map((s) => s.trim()),
        reply_to: data.email,
        subject: subject.slice(0, 200),
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] Resend rejected the email:", res.status, await res.text());
      return Response.json({ ok: false, error: "Could not send your message." }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Could not reach Resend:", err);
    return Response.json({ ok: false, error: "Could not send your message." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
