"use client"

import { useEffect, useRef } from "react"
import { NotificationItem } from "./NotificationItem"
import type { Notification } from "../types"

interface Props {
  notifications: Notification[]
  onRead: (id: string) => void
  onMarkAllRead: () => void
  onClose: () => void
}

export function NotificationPanel({ notifications, onRead, onMarkAllRead, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const hasUnread = notifications.some((n) => !n.read_at)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className={[
        "absolute right-0 top-full mt-2 z-50",
        "w-[360px] max-h-[480px] flex flex-col",
        "rounded-xl border border-hairline",
        "bg-surface/95 backdrop-blur-xl shadow-xl",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline shrink-0">
        <span className="text-sm font-semibold text-ink">Notifications</span>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-hairline/50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-2xl" aria-hidden>🔔</span>
            <p className="text-sm text-ink-secondary">You&apos;re all caught up</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={onRead}
            />
          ))
        )}
      </div>
    </div>
  )
}
