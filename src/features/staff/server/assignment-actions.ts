"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const optionalUuid = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  },
  z.union([z.null(), z.string().uuid()]),
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

const createAssignmentSchema = z.object({
  educator_id: z.string().uuid(),
  area_id: z.string().uuid(),
  type_id: optionalUuid,
  subarea: optionalString(120),
});

export type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/staff/educators");
  revalidatePath("/staff/inquiries");
  revalidatePath("/educator/inquiries");
}

export async function createAssignmentAction(
  educatorId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const parsed = createAssignmentSchema.safeParse({
    educator_id: educatorId,
    area_id: formData.get("area_id"),
    type_id: formData.get("type_id"),
    subarea: formData.get("subarea"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("educator_assignments").insert({
    educator_id: parsed.data.educator_id,
    area_id: parsed.data.area_id,
    type_id: parsed.data.type_id,
    subarea: parsed.data.subarea,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "This educator already has the same assignment." };
    }
    return { error: error.message };
  }

  await rerouteOpenInquiriesForArea(parsed.data.area_id);
  revalidateAll();
  return {};
}

export async function deleteAssignmentAction(assignmentId: string): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("educator_assignments")
    .delete()
    .eq("id", assignmentId);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}

/**
 * Re-route every still-open inquiry in an area through the (now updated)
 * educator_assignments lookup. Calls the SECURITY DEFINER `reroute_inquiry`
 * helper for each candidate row.
 */
async function rerouteOpenInquiriesForArea(areaId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inquiries")
    .select("id")
    .eq("area_id", areaId)
    .in("status", ["open"]);
  if (!data?.length) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await Promise.all(
    data.map((row) => sb.rpc("reroute_inquiry", { p_inquiry_id: row.id })),
  );
}

export async function rerouteAllOpenInquiriesAction(): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inquiries")
    .select("id")
    .in("status", ["open"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await Promise.all(
    (data ?? []).map((row) => sb.rpc("reroute_inquiry", { p_inquiry_id: row.id })),
  );
  revalidateAll();
  return {};
}
