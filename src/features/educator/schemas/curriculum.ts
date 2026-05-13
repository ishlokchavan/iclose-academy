import { z } from "zod";

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Too long (max ${max})`)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

export const createModuleSchema = z.object({
  trackId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required").max(120),
  summary: optionalString(280),
});

export const updateModuleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  summary: optionalString(280),
});

// 11-char YouTube ID. Strict enough to catch typos but permissive on case.
const youtubeId = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{11}$/u, "Enter an 11-character YouTube video ID")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const youtubeIdNullable = z
  .union([z.string().length(0), youtubeId])
  .transform((v) => (typeof v === "string" && v.length === 0 ? null : (v ?? null)));

export const chapterSchema = z.object({
  t: z.number().int().nonnegative().max(86_400),
  label: z.string().trim().min(1, "Chapter label required").max(120),
});

export const createLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required").max(140),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  summary: optionalString(400),
  youtube_id: youtubeIdNullable,
  duration_seconds: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number.parseInt(v, 10) : null))
    .pipe(z.number().int().min(0).max(86_400).nullable()),
  is_preview: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  chapters: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw) return [] as Array<{ t: number; label: string }>;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [] as Array<{ t: number; label: string }>;
        return parsed
          .map((c) => chapterSchema.safeParse(c))
          .filter((r): r is { success: true; data: { t: number; label: string } } => r.success)
          .map((r) => r.data);
      } catch {
        return [] as Array<{ t: number; label: string }>;
      }
    }),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
