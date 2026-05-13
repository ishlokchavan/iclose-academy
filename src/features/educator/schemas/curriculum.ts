import { z } from "zod";

// FormData-friendly preprocessors. `formData.get(name)` returns `null` when
// the field is missing entirely (e.g. unchecked checkboxes), `""` for blank
// text fields, or a string. These helpers normalize those quirks before Zod
// validation runs.

const requiredString = (label: string, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(1, `${label} is required`).max(max, `${label} too long (max ${max})`),
  );

const optionalString = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return null;
      const trimmed = v.trim();
      return trimmed.length > 0 ? trimmed : null;
    },
    z.union([z.null(), z.string().max(max, `Too long (max ${max})`)]),
  );

const optionalYoutubeId = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
  z.union([
    z.null(),
    z
      .string()
      .regex(/^[A-Za-z0-9_-]{11}$/u, "Enter an 11-character YouTube video ID"),
  ]),
);

const optionalSeconds = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string" || v.length === 0) return null;
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    },
    z.union([z.null(), z.number().int().min(0).max(max)]),
  );

const checkboxBool = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

export const chapterSchema = z.object({
  t: z.number().int().nonnegative().max(86_400),
  label: z.string().trim().min(1, "Chapter label required").max(120),
});

const chaptersField = z.preprocess(
  (raw) => {
    if (typeof raw !== "string" || raw.length === 0) return [] as unknown[];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as unknown[];
    }
  },
  z.array(z.unknown()).transform((arr) =>
    arr
      .map((c) => chapterSchema.safeParse(c))
      .filter((r): r is { success: true; data: { t: number; label: string } } => r.success)
      .map((r) => r.data),
  ),
);

export const createModuleSchema = z.object({
  trackId: z.string().uuid(),
  title: requiredString("Title", 120),
  summary: optionalString(280),
});

export const updateModuleSchema = z.object({
  title: requiredString("Title", 120),
  summary: optionalString(280),
});

export const createLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: requiredString("Title", 140),
});

export const updateLessonSchema = z.object({
  title: requiredString("Title", 140),
  summary: optionalString(400),
  youtube_id: optionalYoutubeId,
  duration_seconds: optionalSeconds(86_400),
  is_preview: checkboxBool,
  chapters: chaptersField,
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type Chapter = z.infer<typeof chapterSchema>;

// ----------------------------------------------------------------------------
// Lesson resources
// ----------------------------------------------------------------------------
export const createLinkResourceSchema = z.object({
  label: requiredString("Label", 120),
  url: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().url("Enter a valid URL").max(2000),
  ),
});

export const createFileResourceSchema = z.object({
  label: requiredString("Label", 120),
  storage_path: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(1, "Storage path required").max(500),
  ),
});

export type CreateLinkResourceInput = z.infer<typeof createLinkResourceSchema>;
export type CreateFileResourceInput = z.infer<typeof createFileResourceSchema>;
