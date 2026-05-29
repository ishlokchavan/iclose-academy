import { z } from "zod";

export const acceptInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().uuid("Invalid invite link"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
