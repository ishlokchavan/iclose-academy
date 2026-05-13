"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markLessonCompleteAction(
  lessonId: string,
  trackSlug: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { error: "Failed to save progress." };

  revalidatePath(`/tracks/${trackSlug}/lessons/${lessonId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function savePositionAction(
  lessonId: string,
  positionSeconds: number,
): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      position_seconds: positionSeconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
}
