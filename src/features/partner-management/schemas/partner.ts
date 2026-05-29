import { z } from "zod";

// Codes are stored canonical (uppercase) and share one namespace with member
// referral codes. Letters, digits and dashes only.
const code = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(
    z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(40, "Code is too long")
      .regex(/^[A-Z0-9][A-Z0-9-]*$/, "Use letters, numbers, and dashes only"),
  );

export const createPartnerSchema = z.object({
  name:  z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v ? v : null)),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || /^[A-Z0-9][A-Z0-9-]{2,39}$/.test(v),
      "Use letters, numbers, and dashes only (3–40 chars)",
    ),
});

export const updatePartnerSchema = z.object({
  name:   z.string().trim().min(2).max(80),
  phone:  z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v ? v : null)),
  code:   code,
  status: z.enum(["active", "inactive"]),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
