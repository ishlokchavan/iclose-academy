"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, BellRing } from "lucide-react"

type PermissionState = "unsupported" | "default" | "granted" | "denied" | "loading"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function PushPermissionButton() {
  const [state, setState] = useState<PermissionState>("loading")

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported")
      return
    }
    setState(Notification.permission as PermissionState)
  }, [])

  async function subscribe() {
    setState("loading")
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setState("denied")
        return
      }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const json = sub.toJSON()
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })

      setState("granted")
    } catch (err) {
      console.error("Push subscribe error:", err)
      setState("denied")
    }
  }

  async function unsubscribe() {
    setState("loading")
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState("default")
    } catch {
      setState("granted")
    }
  }

  if (state === "unsupported" || state === "loading") return null

  if (state === "granted") {
    return (
      <button
        onClick={unsubscribe}
        title="Disable push notifications"
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          "text-blue-500 hover:bg-surface-raised hover:text-blue-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        ].join(" ")}
      >
        <BellRing className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
    )
  }

  if (state === "denied") {
    return (
      <button
        disabled
        title="Push notifications blocked — enable in browser settings"
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-tertiary cursor-not-allowed"
      >
        <BellOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <button
      onClick={subscribe}
      title="Enable push notifications"
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        "text-ink-secondary hover:text-ink hover:bg-surface-raised",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      ].join(" ")}
    >
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  )
}
