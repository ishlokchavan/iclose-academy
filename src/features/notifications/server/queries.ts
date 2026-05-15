import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Notification } from "../types"

export async function getNotifications(limit = 30): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null)

  if (error) return 0
  return count ?? 0
}
