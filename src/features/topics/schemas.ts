import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const requiredString = (label: string, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(1, `${label} is required`).max(max),
  );

const optionalString = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    },
    z.union([z.null(), z.string().max(max)]),
  );

const optionalYoutubeId = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  },
  z.union([
    z.null(),
    z.string().regex(/^[A-Za-z0-9_-]{11}$/u, "11-character YouTube video ID"),
  ]),
);

const optionalUuid = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  },
  z.union([z.null(), z.string().uuid()]),
);

const subtypesField = z.preprocess(
  (v) => {
    if (v == null) return [] as string[];
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === "string") {
      // FormData getAll returns repeats; single value is a string.
      return v.length > 0 ? [v] : [];
    }
    return [] as string[];
  },
  z.array(z.string().uuid()).max(20),
);

export const createTopicSchema = z.object({
  title: requiredString("Title", 200),
  slug: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : ""),
    z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(80)
      .regex(slugRegex, "Lowercase letters, numbers, hyphens only"),
  ),
  description: optionalString(8000),
  youtube_id: optionalYoutubeId,
  area_id: optionalUuid,
  subarea: optionalString(120),
  type_id: optionalUuid,
  subtype_ids: subtypesField,
});

export const updateTopicSchema = createTopicSchema;

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ----------------------------------------------------------------------------
// Resources (mirrors V1; renamed bucket).
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
    z.string().min(1).max(500),
  ),
});

export type CreateLinkResourceInput = z.infer<typeof createLinkResourceSchema>;
export type CreateFileResourceInput = z.infer<typeof createFileResourceSchema>;
