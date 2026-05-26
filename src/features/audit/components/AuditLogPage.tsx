"use client";

import { ChevronRight, Database, Search, Server, User, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { AuditFacets, AuditLogRow } from "../server/queries";
import { AuditDetailDrawer } from "./AuditDetailDrawer";

const SOURCE_PILL: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  db:     { label: "DB",     cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: Database },
  app:    { label: "App",    cls: "bg-violet-50 text-violet-700 border-violet-200", icon: User },
  api:    { label: "API",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Server },
  system: { label: "System", cls: "bg-amber-50 text-amber-700 border-amber-200",    icon: Wand2 },
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function AuditLogPage({
  rows, facets,
}: {
  rows: AuditLogRow[];
  facets: AuditFacets;
}) {
  const [search, setSearch]       = useState("");
  const [actionFilter, setAction] = useState<string>("all");
  const [sourceFilter, setSource] = useState<string>("all");
  const [entityFilter, setEntity] = useState<string>("all");
  const [actorFilter, setActor]   = useState<string>("all");
  const [selected, setSelected]   = useState<AuditLogRow | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (actionFilter !== "all" && r.action !== actionFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (entityFilter !== "all" && r.entity_type !== entityFilter) return false;
      if (actorFilter !== "all") {
        const key = r.actor_id ?? r.actor_email ?? "";
        if (key !== actorFilter) return false;
      }
      if (!q) return true;
      return (
        r.action.toLowerCase().includes(q) ||
        r.entity_type?.toLowerCase().includes(q) ||
        r.entity_id?.toLowerCase().includes(q) ||
        r.actor_email?.toLowerCase().includes(q)
      );
    });
  }, [rows, search, actionFilter, sourceFilter, entityFilter, actorFilter]);

  const hasFilters =
    !!search || actionFilter !== "all" || sourceFilter !== "all" ||
    entityFilter !== "all" || actorFilter !== "all";

  return (
    <>
      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search action, entity, actor email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select label="Source" value={sourceFilter} onChange={setSource}>
            <option value="all">All sources</option>
            <option value="db">DB triggers</option>
            <option value="app">App actions</option>
            <option value="api">API routes</option>
            <option value="system">System</option>
          </Select>
          <Select label="Action" value={actionFilter} onChange={setAction}>
            <option value="all">All actions</option>
            {facets.actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
          <Select label="Entity" value={entityFilter} onChange={setEntity}>
            <option value="all">All entities</option>
            {facets.entityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select label="Actor" value={actorFilter} onChange={setActor}>
            <option value="all">All actors</option>
            {facets.actors.map((a) => {
              const key = a.id ?? a.email ?? "";
              if (!key) return null;
              return (
                <option key={key} value={key}>
                  {a.email ?? a.id?.slice(0, 8) ?? "unknown"}
                </option>
              );
            })}
          </Select>
          {hasFilters ? (
            <button
              onClick={() => {
                setSearch("");
                setAction("all"); setSource("all");
                setEntity("all"); setActor("all");
              }}
              className="h-9 rounded-full border border-hairline bg-surface-raised px-3 text-[12px] font-medium text-ink-muted hover:text-ink hover:border-ink/30"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/60">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">When</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Action</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:table-cell">Entity</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Actor</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Source</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  {hasFilters ? "No events match your filters." : "No audit events yet."}
                </td>
              </tr>
            ) : (
              visible.map((r) => {
                const sourceMeta = SOURCE_PILL[r.source] ?? SOURCE_PILL.system!;
                const SourceIcon = sourceMeta.icon;
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-subtle/60 transition-colors"
                  >
                    <td className="px-5 py-3 text-[12px] text-ink-muted whitespace-nowrap tabular-nums">
                      {fmtDateTime(r.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded-md border border-hairline bg-surface-subtle px-1.5 py-0.5 font-mono text-[12px] text-ink">
                        {r.action}
                      </code>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      {r.entity_type ? (
                        <div className="flex flex-col">
                          <span className="text-[13px] text-ink">{r.entity_type}</span>
                          {r.entity_id ? (
                            <code className="font-mono text-[10px] text-ink-muted truncate max-w-[14ch]">
                              {r.entity_id}
                            </code>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-[12px] text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3 text-[12px] md:table-cell">
                      {r.actor_email ? (
                        <span className="text-ink truncate block max-w-[24ch]">{r.actor_email}</span>
                      ) : (
                        <span className="text-ink-muted">system</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${sourceMeta.cls}`}>
                        <SourceIcon className="size-2.5" /> {sourceMeta.label}
                      </span>
                    </td>
                    <td className="pr-4 text-ink-muted">
                      <ChevronRight className="size-4" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {visible.length > 0 ? (
          <div className="border-t border-hairline px-5 py-3 text-[12px] text-ink-muted">
            {visible.length} {visible.length === 1 ? "event" : "events"}
            {hasFilters && " matching filters"}
          </div>
        ) : null}
      </div>

      <AuditDetailDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Select({
  label, value, onChange, children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface-raised pl-3 pr-2 text-[12px] text-ink-muted">
      <span>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border-0 bg-transparent pr-1 text-[12px] text-ink focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}
