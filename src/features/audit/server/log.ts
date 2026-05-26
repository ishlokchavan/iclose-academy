import "server-only";

import { createHash } from "crypto";
import { headers } from "next/headers";

import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * App-side audit logger. Writes to the same `audit_logs` table that DB
 * triggers populate, but with actor + request context attached.
 *
 * Use this from server actions and API routes for high-value events
 * (deletes, role changes, sensitive settings). DB triggers already cover
 * raw INSERT/UPDATE/DELETE on instrumented tables — call this when you
 * also want to record _who_ did it and _why_.
 *
 * Failures here MUST NOT break the calling code path. The function
 * swallows its own errors and logs to the server console instead.
 */
export type AuditAction =
  // members / leads
  | "member.delete"
  | "lead.create_via_api"
  | "lead.update"
  // profile / users
  | "profile.role_change"
  | "profile.plan_change"
  | "profile.self_edit"
  | "profile.delete"
  // auth
  | "auth.signin"
  | "auth.signup"
  | "auth.signout"
  | "auth.password_reset_request"
  | "auth.password_reset_complete"
  | "auth.otp_request"
  | "auth.otp_verify"
  // platform
  | "platform.settings_update"
  | (string & {});

export type LogAuditInput = {
  action: AuditAction;
  entity_type?: string | null;
  entity_id?: string | null;
  diff?: unknown;
  source?: "app" | "api" | "system";
  /** Override actor — defaults to current session user. */
  actor?: {
    id?: string | null;
    email?: string | null;
    role?: string | null;
  };
  /** Override request context — defaults to the current request headers. */
  ip?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
};

const hashIp = (ip: string | null) =>
  ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;

export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    let actorId = input.actor?.id ?? null;
    let actorEmail = input.actor?.email ?? null;
    let actorRole = input.actor?.role ?? null;

    if (actorId === null && actorEmail === null && actorRole === null) {
      try {
        const user = await getSessionUser();
        if (user) {
          actorId = user.id;
          actorEmail = user.email ?? null;
          actorRole = user.role;
        }
      } catch {
        // Anonymous/public flows — leave actor null.
      }
    }

    let ip = input.ip ?? null;
    let userAgent = input.user_agent ?? null;
    if (ip === null || userAgent === null) {
      try {
        const h = await headers();
        if (ip === null) {
          const fwd = h.get("x-forwarded-for");
          ip = fwd ? (fwd.split(",")[0]?.trim() ?? null) : (h.get("x-real-ip") ?? null);
        }
        if (userAgent === null) userAgent = h.get("user-agent") ?? null;
      } catch {
        // No request context available (e.g. background job).
      }
    }

    const admin = createSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      action: input.action,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      diff: (input.diff ?? null) as never,
      source: input.source ?? "app",
      actor_id: actorId,
      actor_email: actorEmail,
      actor_role: actorRole,
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      request_id: input.request_id ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to log", input.action, err);
  }
}
