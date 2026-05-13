"use server";

import { revalidatePath } from "next/cache";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

function revalidate(slug: string) {
  revalidatePath("/staff");
  revalidatePath("/staff/tracks");
  revalidatePath(`/staff/tracks/${slug}`);
  revalidatePath("/tracks");
  revalidatePath(`/tracks/${slug}`);
}

// ----------------------------------------------------------------------------
// Approve a submitted track → published.
// Only allowed from `in_review`.
// ----------------------------------------------------------------------------
export async function approveTrackAction(
  trackId: string,
  trackSlug: string,
): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("tracks")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId)
    .eq("status", "in_review");

  if (error) return { error: error.message };
  revalidate(trackSlug);
  return {};
}

// ----------------------------------------------------------------------------
// Reject a submitted track → back to draft.
// Only allowed from `in_review`.
// ----------------------------------------------------------------------------
export async function rejectTrackAction(
  trackId: string,
  trackSlug: string,
): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("tracks")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", trackId)
    .eq("status", "in_review");

  if (error) return { error: error.message };
  revalidate(trackSlug);
  return {};
}

// ----------------------------------------------------------------------------
// Unpublish a previously-published track → back to draft.
// ----------------------------------------------------------------------------
export async function unpublishTrackAction(
  trackId: string,
  trackSlug: string,
): Promise<ActionResult> {
  await requireMinRole("content_manager");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("tracks")
    .update({
      status: "draft",
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId)
    .eq("status", "published");

  if (error) return { error: error.message };
  revalidate(trackSlug);
  return {};
}
