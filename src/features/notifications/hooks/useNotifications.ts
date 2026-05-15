"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { markNotificationRead, markAllNotificationsRead } from "../server/actions"
import type { Notification } from "../types"

export function useNotifications(initial: Notification[]) {
  const [notifications, setNotifications] = useState<Notification[]>(initial)
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null)

  const unreadCount = notifications.filter((n) => !n.read_at).length

  // Real-time subscription
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const incoming = payload.new as Notification
          setNotifications((prev) => [incoming, ...prev])
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    )
    await markNotificationRead(id)
  }, [])

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: now }))
    )
    await markAllNotificationsRead()
  }, [])

  return { notifications, unreadCount, markRead, markAllRead }
}
