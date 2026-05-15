"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "../hooks/useNotifications"
import { NotificationPanel } from "./NotificationPanel"
import type { Notification } from "../types"

interface Props {
  initialNotifications: Notification[]
}

export function NotificationBell({ initialNotifications }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(initialNotifications)
  const [open, setOpen] = useState(false)

  function handleToggle() {
    setOpen((prev) => !prev)
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className={[
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          "text-ink-secondary hover:text-ink hover:bg-surface-raised",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          open ? "bg-surface-raised text-ink" : "",
        ].join(" ")}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className={[
              "absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center",
              "rounded-full bg-blue-500 px-[3px]",
              "text-[10px] font-semibold leading-none text-white",
            ].join(" ")}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          onRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
