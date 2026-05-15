import { NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/db"

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL ?? "noreply.iclose@gmail.com"}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Service-role client — bypasses RLS to read push_subscriptions
const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Validate Supabase webhook secret
  const secret = process.env.WEBHOOK_SECRET ?? ""
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await req.json()
    // Supabase Database Webhook payload: { type, table, schema, record, old_record }
    const notification = payload.record as {
      user_id: string
      title: string
      body: string
      entity_url: string | null
    } | null

    if (!notification?.user_id) {
      return NextResponse.json({ error: "no record" }, { status: 400 })
    }

    const { data: subs } = await adminSupabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", notification.user_id)

    if (!subs?.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const pushPayload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.entity_url ?? "/",
      icon: "/icons/icon-192.png",
    })

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload
        )
      )
    )

    // Clean up expired/unsubscribed endpoints (410 Gone)
    const expiredEndpoints = subs
      .filter((_, i) => {
        const r = results[i]
        return r?.status === "rejected" && ((r as PromiseRejectedResult).reason as { statusCode?: number })?.statusCode === 410
      })
      .map((s) => s.endpoint)

    if (expiredEndpoints.length) {
      await adminSupabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints)
    }

    return NextResponse.json({ ok: true, sent: subs.length - expiredEndpoints.length })
  } catch (err) {
    console.error("push/send error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
