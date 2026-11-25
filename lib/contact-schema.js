import { z } from "zod";
import { site } from "@/content/site";

const { errors: e, serviceOptions } = site.contactSection.form;

/** Shared by the contact form (client) and /api/contact (server). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, e.name).max(120, e.name),
  email: z.string().trim().max(200, e.email).pipe(z.email(e.email)),
  // Call or WhatsApp number. Digits, spaces, +, -, . and ( ), with 7–15 digits.
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,25}$/, e.phone)
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, e.phone),
  service: z.enum(serviceOptions, { error: e.service }),
  message: z.string().trim().min(10, e.message).max(5000),
  // Honeypot: real people never see or fill this.
  website: z.string().max(0).optional().or(z.literal("")),
});
