import { z } from "zod";
import { site } from "@/content/site";

const { errors: e, serviceOptions } = site.contactSection.form;

/** Shared by the contact form (client) and /api/contact (server). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, e.name).max(120, e.name),
  email: z.string().trim().max(200, e.email).pipe(z.email(e.email)),
  // Optional. Digits, spaces, +, -, ( ) only, 7–20 characters when filled.
  phone: z
    .string()
    .trim()
    .max(20, e.phone)
    .refine((v) => v === "" || /^\+?[\d\s()-]{7,20}$/.test(v), e.phone)
    .optional()
    .or(z.literal("")),
  // Optional. "" means the visitor left the dropdown on its prompt.
  service: z.enum(serviceOptions).optional().or(z.literal("")),
  message: z.string().trim().min(10, e.message).max(5000),
  // Honeypot: real people never see or fill this.
  website: z.string().max(0).optional().or(z.literal("")),
});
