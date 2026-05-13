import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const trimmedString = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} too long (max ${max})`);

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Too long (max ${max})`)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

const stringList = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );

export const createTrackSchema = z.object({
  title: trimmedString("Title", 120),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(80, "Slug too long")
    .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens"),
  specialty_id: z.string().uuid("Pick a specialty"),
  level_id: z.string().uuid("Pick a level"),
  subtitle: optionalString(200),
});

export const updateTrackSchema = z.object({
  title: trimmedString("Title", 120),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(80, "Slug too long")
    .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens"),
  specialty_id: z.string().uuid("Pick a specialty"),
  level_id: z.string().uuid("Pick a level"),
  subtitle: optionalString(200),
  summary: optionalString(400),
  description: optionalString(4000),
  duration_minutes: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number.parseInt(v, 10) : null))
    .pipe(z.number().int().min(0).max(100000).nullable()),
  outcomes: stringList,
  prerequisites: stringList,
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
