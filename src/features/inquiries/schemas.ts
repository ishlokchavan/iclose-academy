import { z } from "zod";

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
    if (typeof v === "string") return v.length > 0 ? [v] : [];
    return [] as string[];
  },
  z.array(z.string().uuid()).max(20),
);

export const createInquirySchema = z.object({
  description: requiredString("Description", 4000),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().email("Enter a valid email").max(320),
  ),
  phone: optionalString(40),
  area_id: optionalUuid,
  subarea: optionalString(120),
  type_id: optionalUuid,
  subtype_ids: subtypesField,
  source_topic_id: optionalUuid,
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
