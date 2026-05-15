"use client"

import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import type { Notification, NotificationType } from "../types"

const ICON_MAP: Record<NotificationType, string> = {
  inquiry_submitted:      "📋",
  inquiry_assigned:       "👤",
  inquiry_status_changed: "🔄",
  topic_in_review:        "🔍",
  topic_published:        "🎓",
  topic_archived:         "📦",
  new_user_registered:    "👋",
  role_changed:           "🔑",
}

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const router = useRouter()
  const isUnread = !notification.read_at

  function handleClick() {
    if (isUnread) onRead(notification.id)
    if (notification.entity_url) router.push(notification.entity_url)
  }

  return (
    <button
      onClick={handleClick}
      className={[
        "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors",
        "hover:bg-surface-raised focus-visible:outline-none focus-visible:bg-surface-raised",
        isUnread ? "bg-surface-raised/50" : "",
      ].join(" ")}
    >
      {/* Icon */}
      <span className="mt-0.5 text-base leading-none shrink-0" aria-hidden>
        {ICON_MAP[notification.type] ?? "🔔"}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink leading-snug">
          {notification.title}
        </p>
        <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed line-clamp-2">
          {notification.body}
        </p>
        <p className="text-[11px] text-ink-tertiary mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread" />
      )}
    </button>
  )
}
