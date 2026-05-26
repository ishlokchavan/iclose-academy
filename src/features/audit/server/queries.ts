import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/db";

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export type AuditLogFilter = {
  search?: string;
  actorId?: string;
  action?: string;
  entityType?: string;
  source?: "db" | "app" | "api" | "system";
  since?: string; // ISO date
  limit?: number;
};

export async function getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLogRow[]> {
  const admin = createSupabaseAdminClient();
  let q = admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 200);

  if (filter.actorId)    q = q.eq("actor_id", filter.actorId);
  if (filter.action)     q = q.eq("action", filter.action);
  if (filter.entityType) q = q.eq("entity_type", filter.entityType);
  if (filter.source)     q = q.eq("source", filter.source);
  if (filter.since)      q = q.gte("created_at", filter.since);

  // Free-text search across action + entity + actor_email + entity_id
  if (filter.search) {
    const term = filter.search.replace(/[%_]/g, " ").trim();
    if (term) {
      const pattern = `%${term}%`;
      q = q.or(
        `action.ilike.${pattern},entity_type.ilike.${pattern},entity_id.ilike.${pattern},actor_email.ilike.${pattern}`,
      );
    }
  }

  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}

export type AuditFacets = {
  actions: string[];
  entityTypes: string[];
  actors: Array<{ id: string | null; email: string | null }>;
};

/** Distinct values for filter dropdowns. Cheap on small log volumes. */
export async function getAuditFacets(): Promise<AuditFacets> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("action, entity_type, actor_id, actor_email")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (!data) return { actions: [], entityTypes: [], actors: [] };

  const actions = new Set<string>();
  const entityTypes = new Set<string>();
  const actorMap = new Map<string, { id: string | null; email: string | null }>();
  for (const row of data) {
    if (row.action) actions.add(row.action);
    if (row.entity_type) entityTypes.add(row.entity_type);
    if (row.actor_id || row.actor_email) {
      const key = row.actor_id ?? row.actor_email ?? "";
      if (!actorMap.has(key)) {
        actorMap.set(key, { id: row.actor_id, email: row.actor_email });
      }
    }
  }
  return {
    actions: [...actions].sort(),
    entityTypes: [...entityTypes].sort(),
    actors: [...actorMap.values()].sort((a, b) =>
      (a.email ?? "").localeCompare(b.email ?? ""),
    ),
  };
}
