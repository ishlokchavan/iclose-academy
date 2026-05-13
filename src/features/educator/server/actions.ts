"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createTrackSchema,
  updateTrackSchema,
} from "@/features/educator/schemas";

export type ActionState =
  | { error: string; fieldErrors?: Record<string, string> }
  | { success: true; slug: string }
  | null;

function assertCanAuthor(role: string) {
  if (role !== "educator" && role !== "content_manager" && role !== "admin") {
    throw new Error("Only educators and staff can author tracks");
  }
}

// ----------------------------------------------------------------------------
// Create a new track (minimal fields). Status defaults to 'draft'.
// ----------------------------------------------------------------------------
export async function createTrackAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createTrackSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    specialty_id: formData.get("specialty_id"),
    level_id: formData.get("level_id"),
    subtitle: formData.get("subtitle"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: first?.message ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tracks").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    educator_id: user.id,
    specialty_id: parsed.data.specialty_id,
    level_id: parsed.data.level_id,
    subtitle: parsed.data.subtitle,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Try another." };
    }
    return { error: error.message };
  }

  revalidatePath("/educator");
  revalidatePath("/educator/tracks");
  redirect(`/educator/tracks/${parsed.data.slug}`);
}

// ----------------------------------------------------------------------------
// Update an existing track's metadata.
// ----------------------------------------------------------------------------
export async function updateTrackAction(
  trackId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = updateTrackSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    specialty_id: formData.get("specialty_id"),
    level_id: formData.get("level_id"),
    subtitle: formData.get("subtitle"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    duration_minutes: formData.get("duration_minutes"),
    outcomes: formData.get("outcomes"),
    prerequisites: formData.get("prerequisites"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: first?.message ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tracks")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      specialty_id: parsed.data.specialty_id,
      level_id: parsed.data.level_id,
      subtitle: parsed.data.subtitle,
      summary: parsed.data.summary,
      description: parsed.data.description,
      duration_minutes: parsed.data.duration_minutes,
      outcomes: parsed.data.outcomes,
      prerequisites: parsed.data.prerequisites,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken. Try another." };
    }
    return { error: error.message };
  }

  revalidatePath("/educator");
  revalidatePath("/educator/tracks");
  revalidatePath(`/educator/tracks/${parsed.data.slug}`);
  return { success: true, slug: parsed.data.slug };
}

// ----------------------------------------------------------------------------
// Update the cover image URL after a Storage upload.
// ----------------------------------------------------------------------------
export async function updateTrackCoverAction(
  trackId: string,
  coverUrl: string | null,
): Promise<{ error?: string }> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tracks")
    .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
    .eq("id", trackId);

  if (error) return { error: error.message };
  revalidatePath("/educator");
  revalidatePath("/educator/tracks");
  return {};
}

// ----------------------------------------------------------------------------
// Archive a track (soft-archive; sets status + archived_at).
// ----------------------------------------------------------------------------
export async function archiveTrackAction(trackId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tracks")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId);

  if (error) return { error: error.message };
  revalidatePath("/educator");
  revalidatePath("/educator/tracks");
  return {};
}

// ----------------------------------------------------------------------------
// Submit a draft for staff review.
// ----------------------------------------------------------------------------
export async function submitForReviewAction(
  trackId: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tracks")
    .update({ status: "in_review", updated_at: new Date().toISOString() })
    .eq("id", trackId)
    .eq("status", "draft");

  if (error) return { error: error.message };
  revalidatePath("/educator");
  revalidatePath("/educator/tracks");
  return {};
}
