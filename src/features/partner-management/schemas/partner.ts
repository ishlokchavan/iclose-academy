import { z } from "zod";

const code = z
  .string()
  .trim()
  .min(3, "Code must be at least 3 characters")
  .max(40, "Code is too long")
  .regex(/^[a-z0-9-]+$/i, "Use letters, numbers, and dashes only");

export const createPartnerSchema = z.object({
  name:  z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v ? v : null)),
  code: code
    .optional()
    .transform((v) => (v ? v.toLowerCase() : null)),
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
