import { z } from "zod";

export const partnerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type PartnerProfileInput = z.infer<typeof partnerProfileSchema>;
