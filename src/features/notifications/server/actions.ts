"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/guards"

export async function markNotificationRead(id: string) {
  await requireUser()
  const supabase = await createSupabaseServerClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null)
}

export async function markAllNotificationsRead() {
  await requireUser()
  const supabase = await createSupabaseServerClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
}
