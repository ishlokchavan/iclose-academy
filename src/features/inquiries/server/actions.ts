"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInquirySchema } from "@/features/inquiries/schemas";
import type { InquiryStatus } from "@/features/inquiries/server/queries";

export type CreateInquiryState =
  | { error: string; fieldErrors?: Record<string, string> }
  | { success: true; id: string }
  | null;

export type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/inquiries");
  revalidatePath("/educator/inquiries");
  revalidatePath("/staff/inquiries");
  revalidatePath("/staff");
}

// ----------------------------------------------------------------------------
// Learner posts an inquiry. The DB trigger auto-routes to the area's educator.
// ----------------------------------------------------------------------------
export async function createInquiryAction(
  _prev: CreateInquiryState,
  formData: FormData,
): Promise<CreateInquiryState> {
  const user = await requireUser();

  const parsed = createInquirySchema.safeParse({
    description: formData.get("description"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    area_id: formData.get("area_id"),
    subarea: formData.get("subarea"),
    type_id: formData.get("type_id"),
    subtype_ids: formData.getAll("subtype_ids"),
    source_topic_id: formData.get("source_topic_id"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: inserted, error } = await supabase
    .from("inquiries")
    .insert({
      learner_id: user.id,
      description: parsed.data.description,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area_id: parsed.data.area_id,
      subarea: parsed.data.subarea,
      type_id: parsed.data.type_id,
      source_topic_id: parsed.data.source_topic_id,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? "Failed to post inquiry" };
  }

  if (parsed.data.subtype_ids.length > 0) {
    await supabase.from("inquiry_subtypes").insert(
      parsed.data.subtype_ids.map((sid) => ({
        inquiry_id: inserted.id,
        subtype_id: sid,
      })),
    );
  }

  revalidateAll();
  redirect(`/inquiries?posted=${inserted.id}`);
}

// ----------------------------------------------------------------------------
// Assigned educator (or staff) updates status.
// ----------------------------------------------------------------------------
export async function setInquiryStatusAction(
  inquiryId: string,
  status: InquiryStatus,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      resolved_at: status === "closed" ? new Date().toISOString() : null,
    })
    .eq("id", inquiryId);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}

// ----------------------------------------------------------------------------
// Staff manual assignment (override the trigger).
// ----------------------------------------------------------------------------
export async function assignInquiryAction(
  inquiryId: string,
  educatorId: string | null,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      assigned_educator_id: educatorId,
      status: educatorId ? "assigned" : "open",
    })
    .eq("id", inquiryId);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}
