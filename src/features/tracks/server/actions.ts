"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function enrollAction(trackId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, track_id: trackId });

  if (error) {
    if (error.code === "23505") return {}; // already enrolled — treat as success
    return { error: "Failed to enroll. Please try again." };
  }

  revalidatePath("/tracks");
  revalidatePath("/dashboard");
  return {};
}

export async function saveTrackAction(
  trackId: string,
  saved: boolean,
): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  if (saved) {
    await supabase
      .from("saved_items")
      .insert({ user_id: user.id, entity_type: "track", entity_id: trackId });
  } else {
    await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("entity_type", "track")
      .eq("entity_id", trackId);
  }

  revalidatePath("/tracks");
  return {};
}
